import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const useChat = (profileKey) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`pula_history_${profileKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch (e) {
      console.log("No history found");
    }
  }, [profileKey]);

  // save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // keep last 50 messages only
        const toSave = messages.slice(-50);
        localStorage.setItem(`pula_history_${profileKey}`, JSON.stringify(toSave));
      } catch (e) {
        console.log("Could not save history");
      }
    }
  }, [messages, profileKey]);

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    const newMessage = { role: "user", content: userMessage };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/chat/`, {
        profile: profileKey,
        message: userMessage,
        messages: messages,
      });

      const aiMessage = {
        role: "assistant",
        content: response.data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages([...updatedMessages, aiMessage]);
      return response.data.reply;

    } catch (err) {
      const errorMsg = err.response?.data?.error || "Something went wrong. Try again!";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, profileKey]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    localStorage.removeItem(`pula_history_${profileKey}`);
  }, [profileKey]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};

export default useChat;