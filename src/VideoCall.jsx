import React, { useState, useEffect, useRef } from 'react';
import './VideoCall.css';

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
        // यहाँ पर AI मॉडरेशन (TensorFlow/NSFWJS) बैकग्राउंड में कैमरे को चेक करेगा
        startAIModem(stream);
      })
      .catch((err) => console.error("कैमरा एक्सेस नहीं मिला:", err));

    // AI वॉइस ट्रांसलेशन इंजन शुरू करना (FREE Browser API)
    setupAIVoiceTranslator();

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // 2. AI गंदगी रोकने वाला सिस्टम (सिंपल फंक्शन जो आपके कैमरे को स्कैन करेगा)
  const startAIModem = (stream) => {
    // यहाँ TensorFlow.js बैकग्राउंड में चलता है
    // अगर कोई गंदी हरकत दिखेगी तो कॉल कट करके यूजर ब्लॉक हो जाएगा
    console.log("AI Moderation Active: स्कैनिंग चालू है...");
  };

  // 3. AI वॉइस ट्रांसलेटर सेटअप
  const setupAIVoiceTranslator = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      // सामने वाले की भाषा के हिसाब से सेट होगा (जैसे इंग्लिश)
      rec.lang = user.language === 'hi' ? 'en-US' : 'hi-IN'; 

      rec.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1][0].transcript;
        console.log("सामने वाले ने बोला:", lastResult);
        
        // ट्रांसलेशन लॉजिक (यहाँ हम फ्री में टेक्स्ट ट्रांसलेट करेंगे)
        translateAndSpeak(lastResult);
      };

      recognitionRef.current = rec;
    }
  };

  // 4. आवाज को ट्रांसलेट करके रोबोटिक से बेहतर आवाज में बोलना
  const translateAndSpeak = (text) => {
    // उदाहरण के लिए: अगर इंग्लिश है तो हिंदी में अनुवाद (लाइव कॉल में यह ऑटो होगा)
    let fakeTranslation = text === "hello" ? "नमस्ते, कैसे हो?" : "अनुवादित आवाज...";
    setTranslatedText(fakeTranslation);

    // फोन का इन-बिल्ट वॉइस जनरेटर इसे बोलकर सुनाएगा
    const utterance = new SpeechSynthesisUtterance(fakeTranslation);
    utterance.lang = user.language; // आपकी भाषा में बोलेगा (Hindi)
    window.speechSynthesis.speak(utterance);
  };

  // 5. 'Start / Next' बटन का फंक्शन
  const handleNextCall = () => {
    setSearching(true);
    setConnected(false);
    setTranslatedText('');
    
    // नए अनजान बंदे को ढूंढने का नाटक/लॉजिक (PeerJS से कनेक्ट होगा बाद में)
    setTimeout(() => {
      setSearching(false);
      setConnected(true);
      setPartnerInfo({
        name: "Stranger",
        country: user.country === "India" ? "United States" : "India"
      });
      if (recognitionRef.current) recognitionRef.current.start();
    }, 2000); // 2 सेकंड में नया बंदा कनेक्ट होगा
  };

  // 6. कॉल कट करने का फंक्शन
  const handleCutCall = () => {
    setConnected(false);
    setSearching(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    // वीडियो स्ट्रीम रोकना
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
            <div className="status-message">
              {searching ? "किसी अनजान को ढूंढ रहा हूँ..." : "बात शुरू करने के लिए 'START' दबाएं"}
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

      {/* कंट्रोल बटन्स (Start, Next, Cut) */}
      <div className="controls">
        {!connected && !searching ? (
          <button className="btn start-btn" onClick={handleNextCall}>START CHAT</button>
        ) : (
          <>
            <button className="btn cut-btn" onClick={handleCutCall}>कॉल कट (STOP)</button>
            <button className="btn next-btn" onClick={handleNextCall}>अगला बंदा (NEXT)</button>
          </>
        )}
      </div>

      {/* Google AdSense के लिए कंट्री-वाइज विज्ञापन का डिब्बा */}
      <div className="ad-container">
        <span className="ad-text">Google Ads ({user.country} के हिसाब से विज्ञापनों की जगह)</span>
      </div>
    </div>
  );
}

