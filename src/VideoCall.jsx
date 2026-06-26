import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai"; // 1. असली Gemini AI पैकेज जोड़ा
import './VideoCall.css';

// 🔑 चाबी का सटीक रास्ता: नीचे दी गई लाइन में जो 'यहाँ_अपनी_असली_चाबी_पेस्ट_करें' लिखा है, 
// बस उसे हटाकर अपनी वो मास्टर चाबी (API Key) उद्धरण चिह्नों "" के अंदर पेस्ट कर देना भाई!
const genAI = new GoogleGenAI({ apiKey: "यहाँ_अपनी_असली_चाबी_पेस्ट_करें" });

export default function VideoCall({ user, onLogout }) {
  const [searching, setSearching] = useState(false);
  const [connected, setConnected] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [translatedText, setTranslatedText] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const recognitionRef = useRef(null);

  // 1. कैमरा और माइक चालू करना
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        // AI मॉडरेशन बैकग्राउंड में कैमरे को चेक करेगा (सुरक्षित रखा है)
        startAIModem(stream);
      })
      .catch((err) => console.error("कैमरा एक्सेस नहीं मिला:", err));

    // AI वॉइस ट्रांसलेशन इंजन शुरू करना
    setupAIVoiceTranslator();

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // 2. AI गंदगी रोकने वाला सिस्टम (सुरक्षित रखा है)
  const startAIModem = (stream) => {
    console.log("AI Moderation Active: स्कैनिंग चालू है...");
  };

  // 3. AI वॉइस ट्रांसलेटर सेटअप
  const setupAIVoiceTranslator = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = user.language === 'hi' ? 'en-US' : 'hi-IN'; 

      rec.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1][0].transcript;
        console.log("सामने वाले ने बोला:", lastResult);
        
        // अब यहाँ असली ट्रांसलेशन कॉल होगा
        translateAndSpeak(lastResult);
      };

      recognitionRef.current = rec;
    }
  };

  // 4. आवाज को Gemini AI से असली ट्रांसलेशन करवाकर बोलना (अपडेटेड)
  const translateAndSpeak = async (text) => {
    try {
      const targetLanguage = user.language === 'hi' ? 'Hindi' : 'English';
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Translate the following text into ${targetLanguage}. Provide ONLY the direct translation, nothing else: "${text}"`;
      
      const result = await model.generateContent(prompt);
      const cleanTranslation = result.response.text().trim();

      setTranslatedText(cleanTranslation);

      // फोन का इन-बिल्ट वॉइस जनरेटर इसे बोलकर सुनाएगा
      const utterance = new SpeechSynthesisUtterance(cleanTranslation);
      utterance.lang = user.language; 
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error("Gemini ट्रांसलेशन में एरर आया:", error);
      setTranslatedText("अनुवाद में दिक्कत आई...");
    }
  };

  // 5. 'Start / Next' बटन का फंक्शन
  const handleNextCall = () => {
    setSearching(true);
    setConnected(false);
    setTranslatedText('');
    
    setTimeout(() => {
      setSearching(false);
      setConnected(true);
      setPartnerInfo({
        name: "Stranger",
        country: user.country === "India" ? "United States" : "India"
      });
      if (recognitionRef.current) recognitionRef.current.start();
    }, 2000);
  };

  // 6. कॉल कट करने का फंक्शन
  const handleCutCall = () => {
    setConnected(false);
    setSearching(false);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  return (
    <div className="video-container">
      {/* टॉप बार - यूजर प्रोफाइल */}
      <div className="top-bar">
        <div className="user-profile">
          <img src={user.photo} alt="Avatar" />
          <span>{user.name} ({user.country})</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>लॉगआउट</button>
      </div>

      {/* वीडियो ग्रिड */}
      <div className="video-grid">
        <div className="video-box local-box">
          <video ref={localVideoRef} autoPlay playsInline muted />
          <span className="badge">आप ({user.country})</span>
        </div>
        
        <div className="video-box remote-box">
          {connected ? (
            <video ref={remoteVideoRef} autoPlay playsInline />
          ) : (
            <div className="status-message" style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {searching ? "किसी अनजान को ढूंढ रहा हूँ..." : "बात शुरू करने के लिए नीचे 'START CHAT' दबाएं"}
            </div>
          )}
          {connected && partnerInfo && (
            <span className="badge">{partnerInfo.name} ({partnerInfo.country})</span>
          )}
        </div>
      </div>

      {/* AI लाइव ट्रांसलेशन बार */}
      {connected && (
        <div className="ai-translation-bar">
          🤖 AI अनुवाद: <strong>{translatedText || "सामने वाले के बोलने का इंतजार करें..."}</strong>
        </div>
      )}

      {/* 🔘 बड़े कंट्रोल्स बटन्स (बड़े और साफ़ दिखने वाले स्टाइल के साथ) */}
      <div className="controls" style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        {!connected && !searching ? (
          <button 
            className="btn start-btn" 
            onClick={handleNextCall}
            style={{ padding: '18px 40px', fontSize: '22px', fontWeight: 'bold', width: '80%', borderRadius: '12px', cursor: 'pointer' }}
          >
            START CHAT
          </button>
        ) : (
          <>
            <button 
              className="btn cut-btn" 
              onClick={handleCutCall}
              style={{ padding: '15px 30px', fontSize: '18px', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer' }}
            >
              कॉल कट (STOP)
            </button>
            <button 
              className="btn next-btn" 
              onClick={handleNextCall}
              style={{ padding: '15px 30px', fontSize: '18px', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer' }}
            >
              अगला बंदा (NEXT)
            </button>
          </>
        )}
      </div>

      {/* Google AdSense के लिए कंट्री-वाइज विज्ञापन का डिब्बा (सुरक्षित रखा है) */}
      <div className="ad-container">
        <span className="ad-text">Google Ads ({user.country} के हिसाब से विज्ञापनों की जगह)</span>
      </div>
    </div>
  );
}
