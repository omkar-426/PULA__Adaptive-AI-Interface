import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfileSelector from "./pages/ProfileSelector";
import ChatPage from "./pages/ChatPage";
import Onboarding from "./pages/Onboarding";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileSelector />} />
        <Route path="/onboarding/:profileKey" element={<Onboarding />} />
        <Route path="/chat/:profileKey" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;