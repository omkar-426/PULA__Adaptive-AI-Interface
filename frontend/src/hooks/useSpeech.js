import { useState, useCallback, useEffect, useRef } from "react";

const LANG_CODES = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN",
};

const API_URL = "http://localhost:8000/api";

const useSpeech = (autoSpeak = false) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [language, setLanguage] = useState("en");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const levelIntervalRef = useRef(null);
  const stoppedRef = useRef(false);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    const hasMic = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setSupported(hasMic);
  }, []);

  const cleanupAudio = useCallback(() => {
    clearInterval(levelIntervalRef.current);
    setAudioLevel(0);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // edge-tts via backend
  const speak = useCallback(async (text, profileKey = "normal", lang = "en") => {
    if (!text) return;

    // stop any current audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    setIsSpeaking(true);

    try {
      const response = await fetch(`${API_URL}/tts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, profile: profileKey, language: lang }),
      });

      const data = await response.json();
      if (!data.audio) { setIsSpeaking(false); return; }

      // play mp3
      const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
      const blob = new Blob([audioBytes], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioPlayerRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setIsSpeaking(false);
      audio.play();

    } catch (err) {
      console.error("TTS error:", err);
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(async (onResult, lang = "en") => {
    try {
      stoppedRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
        }
      });

      audioChunksRef.current = [];

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      let silenceStart = null;
      const SILENCE_THRESHOLD = 5;
      const SILENCE_DURATION = 3000;

      levelIntervalRef.current = setInterval(() => {
        if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
        analyser.getByteFrequencyData(dataArray);
        const avg = Math.round(dataArray.reduce((a, b) => a + b) / dataArray.length);
        setAudioLevel(avg);

        if (avg < SILENCE_THRESHOLD) {
          if (!silenceStart) silenceStart = Date.now();
          const elapsed = Date.now() - silenceStart;
          if (elapsed >= SILENCE_DURATION && !stoppedRef.current) {
            console.log("🔇 Auto-stop: silence");
            stoppedRef.current = true;
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop();
            }
          }
        } else {
          silenceStart = null;
        }
      }, 200);

      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" }
        : MediaRecorder.isTypeSupported("audio/webm")
        ? { mimeType: "audio/webm" }
        : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        cleanupAudio();
        stream.getTracks().forEach(t => t.stop());
        setIsListening(false);

        const totalSize = audioChunksRef.current.reduce((sum, c) => sum + c.size, 0);
        if (totalSize < 1000) {
          alert("Recording too short! Speak for at least 2 seconds.");
          return;
        }

        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(",")[1];
          try {
            const response = await fetch(`${API_URL}/transcribe/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio: base64, language: lang }),
            });
            const data = await response.json();
            if (data.text) {
              setTranscript(data.text);
              onResult && onResult(data.text);
            } else {
              alert("Could not understand. Try again!");
            }
          } catch (err) {
            console.error("Transcribe error:", err);
            alert("Mic error. Check backend!");
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start(250);
      setIsListening(true);
      console.log("Recording started:", mediaRecorder.mimeType);

    } catch (err) {
      console.error("Mic error:", err);
      alert("Could not access microphone!");
      setIsListening(false);
    }
  }, [cleanupAudio]);

  const stopListening = useCallback(() => {
    stoppedRef.current = true;
    cleanupAudio();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, [cleanupAudio]);

  const speakIfAuto = useCallback((text, profileKey = "normal", lang = "en") => {
    if (autoSpeak) speak(text, profileKey, lang);
  }, [autoSpeak, speak]);

  return {
    isListening,
    isSpeaking,
    audioLevel,
    transcript,
    supported,
    language,
    setLanguage,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    speakIfAuto,
  };
};

export default useSpeech;