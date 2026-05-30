import React, { useState, useRef } from "react";
import PictureButtons from "./PictureButtons";

const LANGUAGES = [
  { code: "en", label: "EN", full: "English" },
  { code: "hi", label: "हि", full: "Hindi" },
  { code: "mr", label: "म", full: "Marathi" },
];

const InputArea = ({ profile, onSend, isLoading, useSpeechHook }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const { isListening, startListening, stopListening, supported, language, setLanguage, audioLevel } = useSpeechHook;

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => setText(transcript), language);
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const containerStyle = {
    padding: "10px 12px 14px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    background: "var(--bg)",
    flexShrink: 0,
  };

  const rowStyle = {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
  };

  const inputStyle = {
    flex: 1,
    background: "var(--card)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "var(--text)",
    padding: "12px 16px",
    borderRadius: "14px",
    fontFamily: "var(--font)",
    fontSize: "var(--font-size)",
    resize: "none",
    outline: "none",
    minHeight: "var(--input-h)",
    maxHeight: "120px",
    lineHeight: "1.4",
    transition: "border 0.2s",
    WebkitAppearance: "none",
  };

  const btnStyle = (active, color) => ({
    background: active ? (color || "var(--accent)") : "rgba(255,255,255,0.07)",
    border: "none",
    color: active ? "#fff" : "var(--text)",
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    cursor: isLoading ? "not-allowed" : "pointer",
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
    WebkitTapHighlightColor: "transparent",
  });

  const langRowStyle = {
    display: "flex",
    gap: "6px",
    marginBottom: "8px",
    alignItems: "center",
  };

  const langBtnStyle = (active) => ({
    background: active ? "var(--accent)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${active ? "var(--accent)" : "rgba(255,255,255,0.1)"}`,
    color: active ? "#fff" : "var(--sub)",
    padding: "4px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontFamily: "var(--font)",
    fontWeight: active ? 700 : 400,
    transition: "all 0.2s",
  });

  // audio level bar color
  const levelColor = audioLevel > 20 ? "#22c55e" : audioLevel > 8 ? "#f59e0b" : "#ef4444";
  const levelWidth = Math.min((audioLevel / 40) * 100, 100);

  return (
    <div style={containerStyle}>
      {/* LANGUAGE SELECTOR */}
      <div style={langRowStyle}>
        <span style={{ fontSize: "0.72rem", color: "var(--sub)", marginRight: "4px" }}>🌍</span>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            style={langBtnStyle(language === l.code)}
            onClick={() => setLanguage(l.code)}
            title={l.full}
          >
            {l.label}
          </button>
        ))}
      </div>

      <PictureButtons
        suggestions={profile?.suggestions}
        onSelect={(msg) => onSend(msg)}
      />

      <div style={rowStyle}>
        {supported && (
          <button
            style={{
              ...btnStyle(false),
              background: isListening ? "#ef4444" : "rgba(255,255,255,0.07)",
              animation: isListening ? "voicePulse 1s infinite" : "none",
              position: "relative",
            }}
            onClick={handleVoice}
            title={isListening ? "Click to stop recording" : "Click to start recording"}
          >
            {isListening ? "⏹" : "🎤"}
          </button>
        )}
        <textarea
          ref={textareaRef}
          style={inputStyle}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKey}
          placeholder={isListening ? "🔴 Recording... click ⏹ to stop" : profile?.placeholder || "Type a message..."}
          rows={1}
          onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
        <button
          style={btnStyle(true)}
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? "⏳" : "➤"}
        </button>
      </div>

      {/* AUDIO LEVEL BAR — shows when recording */}
      {isListening && (
        <div style={{ marginTop: "8px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}>
            <span style={{ fontSize: "0.72rem", color: "#ef4444" }}>🔴 Recording</span>
            <span style={{ fontSize: "0.72rem", color: "var(--sub)" }}>
              {audioLevel > 20 ? "Good signal! 🎤" : audioLevel > 8 ? "Speak louder..." : "No sound detected"}
            </span>
          </div>
          {/* level bar */}
          <div style={{
            width: "100%",
            height: "4px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "4px",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${levelWidth}%`,
              height: "100%",
              background: levelColor,
              borderRadius: "4px",
              transition: "width 0.1s, background 0.2s",
            }} />
          </div>
          <div style={{
            fontSize: "0.7rem",
            color: "var(--sub)",
            marginTop: "4px",
            textAlign: "center",
          }}>
            Click ⏹ when done speaking
          </div>
        </div>
      )}
    </div>
  );
};

export default InputArea;