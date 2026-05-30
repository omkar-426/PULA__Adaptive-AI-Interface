import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import profiles from "../config/profiles";
import useChat from "../hooks/useChat";
import useSpeech from "../hooks/useSpeech";
import MessageBubble from "../components/MessageBubble";
import InputArea from "../components/InputArea";

const API_URL = "http://localhost:8000/api";

const ChatPage = () => {
  const { profileKey } = useParams();
  const navigate = useNavigate();
  const profile = profiles[profileKey] || profiles["normal"];
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat(profileKey);
  const speechHook = useSpeech(profile.autoSpeak);
  const messagesEndRef = useRef(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const pendingAudioRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(profile.theme).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    return () => {
      root.style.setProperty("--bg", "#0f0f13");
      root.style.setProperty("--text", "#ffffff");
      root.style.setProperty("--font", "'Nunito', sans-serif");
      root.style.setProperty("--font-size", "15px");
    };
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // pre-fetch TTS while AI is thinking
  const preFetchTTS = async (text) => {
    if (!profile.autoSpeak) return;
    try {
      const response = await fetch(`${API_URL}/tts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          profile: profileKey,
          language: speechHook.language,
        }),
      });
      const data = await response.json();
      if (data.audio) {
        // store audio bytes ready to play
        const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
        const blob = new Blob([audioBytes], { type: "audio/mp3" });
        pendingAudioRef.current = URL.createObjectURL(blob);
      }
    } catch (err) {
      console.error("Pre-fetch TTS error:", err);
    }
  };

  // play pre-fetched audio instantly
  const playPendingAudio = () => {
    if (!pendingAudioRef.current) return;
    const audio = new Audio(pendingAudioRef.current);
    audio.onended = () => {
      URL.revokeObjectURL(pendingAudioRef.current);
      pendingAudioRef.current = null;
    };
    audio.play();
  };

  const handleSend = async (text) => {
    pendingAudioRef.current = null;

    // start chat + TTS fetch at same time
    const [reply] = await Promise.all([
      sendMessage(text),
      profile.autoSpeak ? preFetchTTS(text) : Promise.resolve(),
    ]);

    if (reply) {
      // TTS was pre-fetched with user message — now fetch for AI reply
      // (we can't know reply before it arrives, so fetch now but it's faster
      // because chat already finished)
      if (profile.autoSpeak) {
        await preFetchTTS(reply);
        playPendingAudio();
      }
    }
  };

  const handleClear = () => {
    if (showClearConfirm) {
      clearMessages();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const pageStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    height: "100dvh",
    background: "var(--bg)",
    fontFamily: "var(--font)",
    color: "var(--text)",
    overflow: "hidden",
  };

  const headerStyle = {
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "var(--header-bg)",
    backdropFilter: "blur(10px)",
    flexShrink: 0,
  };

  const backBtnStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "none",
    color: "var(--text)",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontFamily: "var(--font)",
    transition: "background 0.2s",
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  const clearBtnStyle = {
    background: showClearConfirm ? "#ef444420" : "rgba(255,255,255,0.07)",
    border: showClearConfirm ? "1px solid #ef4444" : "none",
    color: showClearConfirm ? "#ef4444" : "var(--sub)",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontFamily: "var(--font)",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  const badgeStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: 0,
  };

  const statusDotStyle = {
    width: "8px",
    height: "8px",
    background: "#22c55e",
    borderRadius: "50%",
    flexShrink: 0,
    boxShadow: "0 0 6px #22c55e",
  };

  const messagesStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  };

  const welcomeStyle = {
    textAlign: "center",
    padding: "40px 20px",
    color: "var(--sub)",
  };

  const errorStyle = {
    background: "#ef444420",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "10px 16px",
    borderRadius: "10px",
    margin: "0 16px",
    fontSize: "0.85rem",
  };

  const typingDotStyle = (delay) => ({
    width: "8px",
    height: "8px",
    background: "var(--accent)",
    borderRadius: "50%",
    display: "inline-block",
    animation: `typing 1.2s infinite ${delay}s`,
    opacity: 0.7,
  });

  const getDateLabel = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <button
          style={backBtnStyle}
          onClick={() => navigate("/")}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
        >
          ← Back
        </button>
        <div style={badgeStyle}>
          <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{profile.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile.name}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--sub)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {messages.length > 0 ? `${messages.length} messages` : profile.description}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {messages.length > 0 && (
            <button style={clearBtnStyle} onClick={handleClear}>
              {showClearConfirm ? "Sure? 🗑️" : "Clear"}
            </button>
          )}
          {/* speaking indicator */}
          {speechHook.isSpeaking && (
            <div style={{
              fontSize: "0.72rem", color: "var(--accent)",
              display: "flex", alignItems: "center", gap: "4px"
            }}>
              🔊
            </div>
          )}
          <div style={statusDotStyle} />
        </div>
      </div>

      {/* MESSAGES */}
      <div style={messagesStyle}>
        {messages.length === 0 && (
          <div style={welcomeStyle}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{profile.emoji}</div>
            <h3 style={{ color: "var(--text)", marginBottom: "6px", fontSize: "1.1rem" }}>
              {profile.welcomeTitle}
            </h3>
            <p style={{ fontSize: "0.9rem" }}>{profile.welcomeSub}</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const dateLabel = getDateLabel(msg.timestamp);
          const prevDateLabel = i > 0 ? getDateLabel(messages[i - 1].timestamp) : null;
          const showDate = dateLabel && dateLabel !== prevDateLabel;
          return (
            <React.Fragment key={i}>
              {showDate && (
                <div style={{
                  textAlign: "center", fontSize: "0.75rem",
                  color: "var(--sub)", padding: "4px 12px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "20px", alignSelf: "center",
                }}>
                  {dateLabel}
                </div>
              )}
              <MessageBubble message={msg} profile={profile} />
            </React.Fragment>
          );
        })}

        {/* TYPING ANIMATION */}
        {isLoading && (
          <div style={{ alignSelf: "flex-start", display: "flex", gap: "10px", animation: "msgIn 0.3s ease" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "50%",
              background: "var(--card)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "1.2rem", border: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}>
              {profile.emoji}
            </div>
            <div style={{
              background: "var(--msg-ai)", padding: "14px 18px",
              borderRadius: "18px", borderBottomLeftRadius: "4px",
              display: "flex", gap: "6px", alignItems: "center",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <span key={i} style={typingDotStyle(delay)} />
              ))}
            </div>
          </div>
        )}

        {error && <div style={errorStyle}>❌ {error}</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <InputArea
        profile={profile}
        onSend={handleSend}
        isLoading={isLoading}
        useSpeechHook={speechHook}
      />
    </div>
  );
};

export default ChatPage;