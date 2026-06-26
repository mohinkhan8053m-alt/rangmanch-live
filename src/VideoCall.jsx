import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './VideoCall.css';

// 🔑 Vercel के एनवायरनमेंट वेरिएबल्स से चाबियां लें
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export default function VideoCall({ user, onLogout }) {
  const [searching, setSearching] = useState(false);
  const [connected, setConnected] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [adTrigger, setAdTrigger] = useState(0); // एड्स रोटेशन के लिए

  const localVideoRef = useRef(null);
  const recognitionRef = useRef(null);

  // 1. Google Ads रोटेशन (हर 40 सेकंड में)
  useEffect(() => {
    const adInterval = setInterval(() => {
      setAdTrigger(prev => prev + 1);
    }, 40000);
    return () => clearInterval(adInterval);
  }, []);

  // 2. AI मॉडरेशन (गंदगी रोकने के लिए)
  const checkSafety = async (text) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Check if this text contains abusive, sexual, or harmful content. Answer only "YES" or "NO": "${text}"`);
    return result.response.text().trim() === "YES";
  };

  // 3. AI ट्रांसलेशन लॉजिक
  const translateAndSpeak = async (text) => {
    const isHarmful = await checkSafety(text);
    if (isHarmful) {
      setTranslatedText("⚠️ सुरक्षा नियम: गलत भाषा इस्तेमाल न करें।");
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Translate to ${user.language === 'hi' ? 'Hindi' : 'English'}: "${text}"`;
      const result = await model.generateContent(prompt);
      setTranslatedText(result.response.text());
    } catch (err) { console.error(err); }
  };

  // 4. कॉल कंट्रोल्स
  const handleNextCall = () => {
    setSearching(true);
    setConnected(false);
    setTimeout(() => { setSearching(false); setConnected(true); }, 2000);
  };

  const handleCutCall = () => { setConnected(false); };

  return (
    <div className="video-container">
      {/* वीडियो और कंट्रोल्स यहाँ रखें... */}
      <div className="controls">
        {!connected ? (
          <button onClick={handleNextCall}>{searching ? "ढूंढ रहा हूँ..." : "START CHAT"}</button>
        ) : (
          <>
            <button onClick={handleCutCall}>कॉल कट (STOP)</button>
            <button onClick={handleNextCall}>अगला (NEXT)</button>
          </>
        )}
      </div>
      
      {/* विज्ञापन रोटेशन */}
      <div className="ad-container">
        Google Ads Slot #{adTrigger} - विज्ञापन बदल रहा है...
      </div>
    </div>
  );
}
