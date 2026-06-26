import React, { useState, useEffect, useRef } from 'react';
import './VideoCall.css';

export default function VideoCall({ user, onLogout }) {
  const [searching, setSearching] = useState(false);
  const [connected, setConnected] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [translatedText, setTranslatedText] = useState('');

  // Vercel से आपकी API Key को यहाँ एक्सेस करेंगे
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

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
      rec.lang = 'hi-IN'; // अपनी जरूरत के अनुसार बदलें

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        // यहाँ API Key का इस्तेमाल करके Gemini से अनुवाद कर सकते हैं
        console.log("Gemini API Key Check:", GEMINI_API_KEY ? "Loaded" : "Missing");
        translateAndSpeak(transcript);
      };
      recognitionRef.current = rec;
    }
  };

  const translateAndSpeak = (text) => {
    // यहाँ अपना अनुवाद लॉजिक रखें
    const fakeTranslation = "अनुवादित: " + text;
    setTranslatedText(fakeTranslation);
    const utterance = new SpeechSynthesisUtterance(fakeTranslation);
    window.speechSynthesis.speak(utterance);
  };

  const handleNextCall = () => {
    setSearching(true);
    setConnected(false);
    
    // नकली कॉल कनेक्शन (सिमुलेशन)
    setTimeout(() => {
      setSearching(false);
      setConnected(true);
      setPartnerInfo({ name: "Stranger", country: "Global" });
      if (recognitionRef.current) recognitionRef.current.start();
    }, 2000);
  };

  return (
    <div className="video-container">
      {/* टॉप बार */}
      <div className="top-bar">
        <div className="user-profile">
          <span>{user.name}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>लॉगआउट</button>
      </div>

      {/* वीडियो बॉक्स */}
      <div className="video-grid">
        <video ref={localVideoRef} autoPlay playsInline muted className="video-box" />
        <div className="video-box remote-box">
          {searching ? "खोज रहे हैं..." : connected ? "बातचीत जारी है" : "START दबाएं"}
        </div>
      </div>

      {/* ट्रांसलेशन बार */}
      {connected && (
        <div className="ai-translation-bar">
          🤖 AI ट्रांसलेशन: <strong>{translatedText}</strong>
        </div>
      )}

      {/* कंट्रोल्स */}
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
