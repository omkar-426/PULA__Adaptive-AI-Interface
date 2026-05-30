import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import profiles from "../config/profiles";
import useSpeech from "../hooks/useSpeech";

const Onboarding = () => {
  const { profileKey } = useParams();
  const navigate = useNavigate();
  const profile = profiles[profileKey] || profiles["normal"];
  const speechHook = useSpeech(true);
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [inputMode, setInputMode] = useState("both");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(profile.theme).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    setTimeout(() => setMounted(true), 100);
  }, [profile]);

  // speak question when step changes
  useEffect(() => {
    if (!mounted) return;
    const q = getQuestion();
    if (q) speechHook.speak(q.voiceText, profileKey);
  }, [step, mounted]);

  const getQuestion = () => {
    switch (profileKey) {
      case "children":
        return CHILDREN_STEPS[step];
      case "elderly":
        return ELDERLY_STEPS[step];
      case "special":
        return SPECIAL_STEPS[step];
      default:
        return null;
    }
  };

  // save user info and go to chat
  const finish = (name) => {
    const finalName = name || userName || "Friend";
    localStorage.setItem(`pula_name_${profileKey}`, finalName);
    localStorage.setItem(`pula_inputmode_${profileKey}`, inputMode);
    navigate(`/chat/${profileKey}`);
  };

  const pageStyle = {
    minHeight: "100vh",
    minHeight: "100dvh",
    background: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font)",
    color: "var(--text)",
    padding: "24px",
    gap: "32px",
  };

  if (profileKey === "normal") {
    navigate(`/chat/normal`);
    return null;
  }

  if (profileKey === "children") {
    return <ChildrenOnboarding
      step={step} setStep={setStep}
      userName={userName} setUserName={setUserName}
      finish={finish} profile={profile}
      speechHook={speechHook} profileKey={profileKey}
      mounted={mounted} pageStyle={pageStyle}
    />;
  }

  if (profileKey === "elderly") {
    return <ElderlyOnboarding
      step={step} setStep={setStep}
      userName={userName} setUserName={setUserName}
      finish={finish} profile={profile}
      speechHook={speechHook} profileKey={profileKey}
      mounted={mounted} pageStyle={pageStyle}
    />;
  }

  if (profileKey === "special") {
    return <SpecialOnboarding
      step={step} setStep={setStep}
      userName={userName} setUserName={setUserName}
      inputMode={inputMode} setInputMode={setInputMode}
      finish={finish} profile={profile}
      speechHook={speechHook} profileKey={profileKey}
      mounted={mounted} pageStyle={pageStyle}
    />;
  }

  return null;
};

// ─────────────────────────────────────────────
// 👶 CHILDREN ONBOARDING
// ─────────────────────────────────────────────
const CHILDREN_STEPS = [
  { voiceText: "Hi there! What is your name?" },
  { voiceText: "How old are you?" },
  { voiceText: "What do you love most?" },
];

const ChildrenOnboarding = ({ step, setStep, userName, setUserName, finish, profile, speechHook, profileKey, mounted, pageStyle }) => {
  const [age, setAge] = useState("");

  const titleStyle = {
    fontSize: "2rem",
    fontWeight: 900,
    textAlign: "center",
    color: "var(--accent)",
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(-20px)",
    transition: "all 0.5s ease",
  };

  const bigBtnStyle = (color) => ({
    background: color || "var(--accent)",
    border: "none",
    color: "#fff",
    padding: "18px 28px",
    borderRadius: "20px",
    fontSize: "1.3rem",
    fontFamily: "var(--font)",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    minWidth: "100px",
  });

  const inputStyle = {
    background: "var(--card)",
    border: "2px solid var(--accent)",
    color: "var(--text)",
    padding: "16px 20px",
    borderRadius: "16px",
    fontSize: "1.3rem",
    fontFamily: "var(--font)",
    outline: "none",
    width: "100%",
    maxWidth: "320px",
    textAlign: "center",
  };

  if (step === 0) return (
    <div style={pageStyle}>
      <div style={titleStyle}>Hi there! 👋</div>
      <div style={{ fontSize: "1.5rem", textAlign: "center", color: "var(--text)" }}>
        What is your name?
      </div>
      <input
        style={inputStyle}
        placeholder="Type your name..."
        value={userName}
        onChange={e => setUserName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && userName && setStep(1)}
        autoFocus
      />
      <div style={{ display: "flex", gap: "12px" }}>
              <button style={bigBtnStyle("#22c55e")} onClick={() => userName && setStep(1)}>
          <span>✅</span>
          <span style={{ fontSize: "0.85rem" }}>Next!</span>
        </button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={pageStyle}>
      <div style={titleStyle}>Hi {userName}! 🎉</div>
      <div style={{ fontSize: "1.5rem", textAlign: "center", color: "var(--text)" }}>
        How old are you?
      </div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        {["4-6", "7-9", "10-12"].map(a => (
          <button key={a} style={bigBtnStyle(age === a ? "#22c55e" : "var(--accent)")}
            onClick={() => { setAge(a); setTimeout(() => setStep(2), 300); }}>
            <span style={{ fontSize: "2rem" }}>
              {a === "4-6" ? "🧒" : a === "7-9" ? "👦" : "🧑"}
            </span>
            <span>{a} yrs</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={pageStyle}>
      <div style={titleStyle}>What do you love? ❤️</div>
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { e: "🦁", l: "Animals" },
          { e: "🚀", l: "Space" },
          { e: "🎮", l: "Games" },
          { e: "🎨", l: "Art" },
          { e: "⚽", l: "Sports" },
          { e: "📚", l: "Stories" },
        ].map(item => (
          <button key={item.l}
            style={{
              ...bigBtnStyle(),
              minWidth: "90px",
            }}
            onClick={() => finish(userName)}>
            <span style={{ fontSize: "2.5rem" }}>{item.e}</span>
            <span style={{ fontSize: "0.9rem" }}>{item.l}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return null;
};

// ─────────────────────────────────────────────
// 🧓 ELDERLY ONBOARDING
// ─────────────────────────────────────────────
const ELDERLY_STEPS = [
  { voiceText: "Hello! Welcome to Pula. What is your name?" },
  { voiceText: "Would you like me to read everything out loud for you?" },
];

const ElderlyOnboarding = ({ step, setStep, userName, setUserName, finish, profile, speechHook, profileKey, mounted, pageStyle }) => {

  const titleStyle = {
    fontSize: "2.2rem",
    fontWeight: 900,
    textAlign: "center",
    color: "var(--text)",
    opacity: mounted ? 1 : 0,
    transition: "all 0.5s ease",
    lineHeight: 1.3,
  };

  const bigBtnStyle = (color) => ({
    background: color || "var(--accent)",
    border: "none",
    color: "#fff",
    padding: "22px 36px",
    borderRadius: "18px",
    fontSize: "1.4rem",
    fontFamily: "var(--font)",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: "140px",
  });

  const inputStyle = {
    background: "var(--card)",
    border: "2px solid var(--accent)",
    color: "var(--text)",
    padding: "20px 24px",
    borderRadius: "16px",
    fontSize: "1.5rem",
    fontFamily: "var(--font)",
    outline: "none",
    width: "100%",
    maxWidth: "380px",
    textAlign: "center",
  };

  if (step === 0) return (
    <div style={pageStyle}>
      <div style={titleStyle}>Hello! 👋{"\n"}Welcome to Pula</div>
      <div style={{ fontSize: "1.6rem", textAlign: "center", color: "var(--sub)", lineHeight: 1.5 }}>
        What is your name?
      </div>
      <input
        style={inputStyle}
        placeholder="Type your name here..."
        value={userName}
        onChange={e => setUserName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && userName && setStep(1)}
        autoFocus
      />
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
               <button style={bigBtnStyle("#22c55e")} onClick={() => userName && setStep(1)}>
          Next →
        </button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={pageStyle}>
      <div style={titleStyle}>Hello, {userName}! 😊</div>
      <div style={{ fontSize: "1.5rem", textAlign: "center", color: "var(--sub)", lineHeight: 1.6, maxWidth: "400px" }}>
        Should I read everything out loud for you?
      </div>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        <button style={bigBtnStyle("#22c55e")} onClick={() => {
          localStorage.setItem(`pula_autospeak_${profileKey}`, "true");
          finish(userName);
        }}>
          ✅ Yes Please
        </button>
        <button style={bigBtnStyle("#6c63ff")} onClick={() => {
          localStorage.setItem(`pula_autospeak_${profileKey}`, "false");
          finish(userName);
        }}>
          🔇 No Thanks
        </button>
      </div>
    </div>
  );

  return null;
};

// ─────────────────────────────────────────────
// 🌟 SPECIAL ONBOARDING
// ─────────────────────────────────────────────
const SPECIAL_STEPS = [
  { voiceText: "Hello! I am Pula. I am here to help you. What is your name?" },
  { voiceText: "How would you like to talk to me?" },
  { voiceText: "That is perfect. I am ready to help you." },
];

const SpecialOnboarding = ({ step, setStep, userName, setUserName, inputMode, setInputMode, finish, profile, speechHook, profileKey, mounted, pageStyle }) => {

  const titleStyle = {
    fontSize: "1.9rem",
    fontWeight: 900,
    textAlign: "center",
    color: "var(--accent)",
    opacity: mounted ? 1 : 0,
    transition: "all 0.5s ease",
    lineHeight: 1.4,
  };

  const bigBtnStyle = (color, selected) => ({
    background: selected ? (color || "var(--accent)") : "var(--card)",
    border: `3px solid ${selected ? (color || "var(--accent)") : "rgba(255,255,255,0.1)"}`,
    color: selected ? "#fff" : "var(--text)",
    padding: "20px 28px",
    borderRadius: "20px",
    fontSize: "1.2rem",
    fontFamily: "var(--font)",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    minWidth: "130px",
  });

  const inputStyle = {
    background: "var(--card)",
    border: "2px solid var(--accent)",
    color: "var(--text)",
    padding: "18px 22px",
    borderRadius: "16px",
    fontSize: "1.3rem",
    fontFamily: "var(--font)",
    outline: "none",
    width: "100%",
    maxWidth: "340px",
    textAlign: "center",
  };

  if (step === 0) return (
    <div style={pageStyle}>
      <div style={titleStyle}>Hello! 🌟{"\n"}I am Pula</div>
      <div style={{ fontSize: "1.4rem", textAlign: "center", color: "var(--sub)", lineHeight: 1.6, maxWidth: "340px" }}>
        I am here to help you. What is your name?
      </div>
      <input
        style={inputStyle}
        placeholder="Your name..."
        value={userName}
        onChange={e => setUserName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && userName && setStep(1)}
        autoFocus
      />
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
                <button style={bigBtnStyle("#22c55e", false)}
          onClick={() => userName && setStep(1)}>
          <span style={{ fontSize: "2rem" }}>✅</span>
          <span>Continue</span>
        </button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={pageStyle}>
      <div style={titleStyle}>Hi {userName}! 😊</div>
      <div style={{ fontSize: "1.4rem", textAlign: "center", color: "var(--sub)", lineHeight: 1.6, maxWidth: "340px" }}>
        How would you like to talk to me?
      </div>
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
        <button style={bigBtnStyle("var(--accent)", inputMode === "type")}
          onClick={() => setInputMode("type")}>
          <span style={{ fontSize: "2rem" }}>⌨️</span>
          <span>I can Type</span>
        </button>
             </div>
      <button style={{
        background: "#22c55e", border: "none", color: "#fff",
        padding: "18px 40px", borderRadius: "16px",
        fontSize: "1.2rem", fontFamily: "var(--font)",
        fontWeight: 700, cursor: "pointer",
      }} onClick={() => setStep(2)}>
        That's right! →
      </button>
    </div>
  );

  if (step === 2) return (
    <div style={pageStyle}>
      <div style={{ fontSize: "4rem", textAlign: "center" }}>🌟</div>
      <div style={titleStyle}>Perfect, {userName}!</div>
      <div style={{ fontSize: "1.3rem", textAlign: "center", color: "var(--sub)", lineHeight: 1.7, maxWidth: "340px" }}>
        I am ready to help you. Take your time. I will always be patient. 😊
      </div>
      <button style={{
        background: "var(--accent)", border: "none", color: "#fff",
        padding: "20px 48px", borderRadius: "16px",
        fontSize: "1.3rem", fontFamily: "var(--font)",
        fontWeight: 700, cursor: "pointer",
        animation: "fadeIn 0.5s ease",
      }} onClick={() => finish(userName)}>
        Let's Start! 🚀
      </button>
    </div>
  );

  return null;
};

export default Onboarding;