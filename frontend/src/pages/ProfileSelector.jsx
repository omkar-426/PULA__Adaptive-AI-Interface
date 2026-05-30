import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profiles from "../config/profiles";

const ProfileSelector = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", "#0f0f13");
    root.style.setProperty("--card", "#1a1a24");
    root.style.setProperty("--text", "#ffffff");
    root.style.setProperty("--sub", "#999999");
    root.style.setProperty("--accent", "#6c63ff");
    root.style.setProperty("--font", "'Nunito', sans-serif");
    root.style.setProperty("--font-size", "15px");
    root.style.setProperty("--border", "#6c63ff");
    setTimeout(() => setMounted(true), 100);

    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const positions = [
    { key: "children", angle: -90 },
    { key: "special", angle: 0 },
    { key: "normal", angle: 90 },
    { key: "elderly", angle: 180 },
  ];

  const CIRCLE_R = isMobile ? 110 : 160;
  const NODE_SIZE = isMobile ? 85 : 110;
  const CENTER_SIZE = isMobile ? 90 : 120;
  const SVG_SIZE = CIRCLE_R * 2 + NODE_SIZE + 20;
  const centerX = SVG_SIZE / 2;
  const centerY = SVG_SIZE / 2;

  const getProfilePos = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + CIRCLE_R * Math.cos(rad),
      y: centerY + CIRCLE_R * Math.sin(rad),
    };
  };

  const pageStyle = {
    minHeight: "100vh",
    minHeight: "100dvh",
    background: "#0f0f13",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Nunito', sans-serif",
    overflow: "hidden",
    position: "relative",
    padding: "20px",
  };

  const titleStyle = {
    textAlign: "center",
    marginBottom: isMobile ? "24px" : "40px",
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(-20px)",
    transition: "all 0.6s ease",
  };

  const circleContainerStyle = {
    position: "relative",
    width: `${SVG_SIZE}px`,
    height: `${SVG_SIZE}px`,
    opacity: mounted ? 1 : 0,
    transition: "opacity 0.8s ease 0.3s",
    flexShrink: 0,
  };

  const profileCardStyle = (key) => {
    const isHov = hovered === key;
    return {
      position: "absolute",
      width: `${NODE_SIZE}px`,
      height: `${NODE_SIZE}px`,
      borderRadius: "50%",
      background: isHov
        ? `linear-gradient(135deg, ${profiles[key].theme["--accent"]}33, ${profiles[key].theme["--card"]})`
        : "#1a1a24",
      border: `2px solid ${isHov ? profiles[key].theme["--accent"] : "rgba(255,255,255,0.08)"}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transform: `translate(-50%, -50%) scale(${isHov ? 1.12 : 1})`,
      transition: "all 0.3s ease",
      boxShadow: isHov ? `0 0 30px ${profiles[key].theme["--accent"]}44` : "none",
      zIndex: 2,
      gap: "4px",
      WebkitTapHighlightColor: "transparent",
    };
  };

  const logoStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: `${CENTER_SIZE}px`,
    height: `${CENTER_SIZE}px`,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
    boxShadow: "0 0 40px rgba(108,99,255,0.4), 0 0 80px rgba(108,99,255,0.15)",
  };

  return (
    <div style={pageStyle}>
      {/* background glow */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* title */}
      <div style={titleStyle}>
        <h1 style={{
          fontSize: isMobile ? "1.8rem" : "2.4rem",
          fontWeight: 900,
          background: "linear-gradient(135deg, #6c63ff, #a78bfa, #38bdf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "8px",
        }}>
          Welcome to Pula
        </h1>
        <p style={{ color: "#999", fontSize: isMobile ? "0.85rem" : "0.95rem" }}>
          Choose your experience
        </p>
      </div>

      {/* circular layout */}
      <div style={circleContainerStyle}>
        {/* SVG ring + lines */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <circle
            cx={centerX} cy={centerY} r={CIRCLE_R}
            fill="none" stroke="rgba(108,99,255,0.15)" strokeWidth="1"
            strokeDasharray="6 4"
          />
          {positions.map(({ key, angle }) => {
            const pos = getProfilePos(angle);
            return (
              <line
                key={key}
                x1={centerX} y1={centerY}
                x2={pos.x} y2={pos.y}
                stroke={hovered === key ? profiles[key].theme["--accent"] : "rgba(255,255,255,0.05)"}
                strokeWidth={hovered === key ? "1.5" : "1"}
              />
            );
          })}
        </svg>

        {/* center logo */}
        <div style={logoStyle}>
          <span style={{ fontSize: isMobile ? "1.5rem" : "2rem" }}>🌐</span>
          <span style={{
            color: "#fff", fontWeight: 900,
            fontSize: isMobile ? "0.8rem" : "1rem",
            letterSpacing: "1px",
          }}>
            PULA
          </span>
        </div>

        {/* profile nodes */}
        {positions.map(({ key, angle }) => {
          const pos = getProfilePos(angle);
          const profile = profiles[key];
          return (
            <div
              key={key}
              style={{ ...profileCardStyle(key), left: pos.x, top: pos.y }}
              onClick={() => navigate(key === "normal" ? `/chat/${key}` : `/onboarding/${key}`)}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(key)}
              onTouchEnd={() => setHovered(null)}
            >
              <span style={{ fontSize: isMobile ? "1.4rem" : "1.8rem" }}>{profile.emoji}</span>
              <span style={{
                fontSize: isMobile ? "0.6rem" : "0.7rem",
                fontWeight: 700,
                color: hovered === key ? "#fff" : "#999",
                textAlign: "center",
                lineHeight: 1.2,
              }}>
                {profile.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* hovered description */}
      <div style={{
        marginTop: "24px",
        height: "28px",
        color: hovered ? "#fff" : "transparent",
        fontSize: "0.9rem",
        fontWeight: 600,
        transition: "all 0.3s",
        textAlign: "center",
      }}>
        {hovered && `${profiles[hovered].emoji} ${profiles[hovered].description}`}
      </div>
    </div>
  );
};

export default ProfileSelector;