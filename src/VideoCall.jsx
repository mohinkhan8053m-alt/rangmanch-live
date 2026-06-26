import React, { useState, useEffect, useRef } from 'react';
import './VideoCall.css';

export default function VideoCall({ user, onLogout }) {
  const [searching, setSearching] = useState(false);
  const [connected, setConnected] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [translatedText, setTranslatedText] = useState('');

  // 🔑 Vercel से Gemini API Key उठाने का सही तरीका
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const localVideoRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // कैमरा एक्सेस
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("कैमरा एक्सेस नहीं मिला:", err));

    setupAIVoiceTranslator();

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const setupAIVoiceTranslator = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.lang = 'hi-IN';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        
        // यहाँ Gemini API का इस्तेमाल होगा
        if (!GEMINI_API_KEY) {
          console.error("Gemini API Key missing! Vercel में चेक करें।");
        }
        
        translateAndSpeak(transcript);
      };
      recognitionRef.current = rec;
    }
  };

  const translateAndSpeak = (text) => {
    // आप यहाँ Gemini API की कॉल लगा सकते हैं
    const fakeTranslation = "अनुवादित: " + text;
    setTranslatedText(fakeTranslation);
    const utterance = new SpeechSynthesisUtterance(fakeTranslation);
    window.speechSynthesis.speak(utterance);
  };

  const handleNextCall = () => {
    setSearching(true);
    setConnected(false);
    
    setTimeout(() => {
      setSearching(false);
      setConnected(true);
      setPartnerInfo({ name: "Stranger", country: "Global" });
      if (recognitionRef.current) recognitionRef.current.start();
    }, 2000);
  };

  return (
    <div className="video-container">
      <div className="top-bar">
        <div className="user-profile">
          <span>{user?.name || "User"}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>लॉगआउट</button>
      </div>

      <div className="video-grid">
        <video ref={localVideoRef} autoPlay playsInline muted className="video-box" />
        <div className="video-box remote-box">
          {searching ? "खोज रहे हैं..." : connected ? "बातचीत जारी है" : "START दबाएं"}
        </div>
      </div>

      {connected && (
        <div className="ai-translation-bar">
          🤖 AI ट्रांसलेशन: <strong>{translatedText}</strong>
        </div>
      )}

      <div className="controls">
        {!connected && !searching ? (
          <button className="btn start-btn" onClick={handleNextCall}>START CHAT</button>
        ) : (
          <button className="btn next-btn" onClick={handleNextCall}>अगला (NEXT)</button>
        )}
      </div>
    </div>
  );
}
