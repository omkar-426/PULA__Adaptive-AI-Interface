import React from "react";

const MessageBubble = ({ message, profile }) => {
  const isUser = message.role === "user";

  const bubbleStyle = {
    display: "flex",
    gap: "10px",
    maxWidth: "78%",
    alignSelf: isUser ? "flex-end" : "flex-start",
    flexDirection: isUser ? "row-reverse" : "row",
    animation: "msgIn 0.3s ease",
  };

  const avatarStyle = {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    flexShrink: 0,
    background: "var(--card)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const textStyle = {
    padding: "12px 16px",
    borderRadius: "18px",
    lineHeight: "1.6",
    fontSize: "var(--font-size)",
    fontFamily: "var(--font)",
    color: isUser ? "#ffffff" : "var(--msg-ai-text)",
    background: isUser ? "var(--msg-user)" : "var(--msg-ai)",
    borderBottomRightRadius: isUser ? "4px" : "18px",
    borderBottomLeftRadius: isUser ? "18px" : "4px",
    border: isUser ? "none" : "1px solid rgba(255,255,255,0.06)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  return (
    <div style={bubbleStyle}>
      <div style={avatarStyle}>
        {isUser ? "🧑" : profile?.emoji || "🤖"}
      </div>
      <div style={textStyle}>
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;
