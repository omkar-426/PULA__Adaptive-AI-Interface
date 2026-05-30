import React from "react";

const PictureButtons = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  const containerStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    padding: "8px 0",
  };

  const btnStyle = {
    background: "var(--card)",
    border: "2px solid var(--border)",
    color: "var(--text)",
    padding: "10px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontFamily: "var(--font)",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    minWidth: "70px",
  };

  const emojiStyle = {
    fontSize: "1.8rem",
  };

  const labelStyle = {
    fontSize: "0.72rem",
    color: "var(--sub)",
  };

  return (
    <div style={containerStyle}>
      {suggestions.map((s, i) => (
        <button
          key={i}
          style={btnStyle}
          onClick={() => onSelect(`Tell me about ${s.label}`)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <span style={emojiStyle}>{s.emoji}</span>
          <span style={labelStyle}>{s.label}</span>
        </button>
      ))}
    </div>
  );
};

export default PictureButtons;
