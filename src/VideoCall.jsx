import React, { useState, useEffect } from 'react';
import { LiveKitRoom, ParticipantTile, useParticipants, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import './VideoCall.css';

function ParticipantList() {
  const participants = useParticipants();
  return (
    <div className="video-grid-inner">
      {participants.map((participant) => (
        <div key={participant.sid} className="video-box">
          <ParticipantTile participant={participant} />
        </div>
      ))}
    </div>
  );
}

export default function VideoCall({ user, onLogout }) {
  const [token, setToken] = useState("");
  const [searching, setSearching] = useState(false);
  const [isRoomActive, setIsRoomActive] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  // 1. कॉल स्टार्ट/नेक्स्ट (मैचमेकिंग के साथ)
  const handleNextCall = async () => {
    setSearching(true);
    setIsRoomActive(false); // पिछला रूम साफ़ करें

    try {
      // अब सर्वर खुद मैचमेकिंग करके रूम और टोकन देगा
      const resp = await fetch(`/api/token?username=${encodeURIComponent(user.name)}`);
      const data = await resp.json();
      
      if (data.token) {
        setToken(data.token);
        setIsRoomActive(true);
      } else {
        alert("अभी कोई ऑनलाइन नहीं है, थोड़े समय बाद कोशिश करें।");
      }
    } catch (err) {
      console.error("Connection failed", err);
      alert("सर्वर से जुड़ने में दिक्कत आई।");
    } finally {
      setSearching(false);
    }
  };

  // 2. कॉल कट करना
  const handleEndCall = () => {
    setIsRoomActive(false);
    setToken(""); // टोकन क्लियर करें
    setSearching(false);
  };

  // 3. AI Translator फीचर
  const translateAndSpeak = (text) => {
    const translation = "अनुवादित: " + text;
    setTranslatedText(translation);
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(translation));
  };

  // 4. AI Security फीचर
  const handleSecurityCheck = (text) => {
    const badWords = ["gali1", "gali2"];
    if (badWords.some(w => text.toLowerCase().includes(w.toLowerCase()))) {
      alert("अवैध गतिविधि! आपको ब्लॉक किया गया है।");
      handleEndCall();
    }
  };

  return (
    <div className="video-container">
      <div className="top-bar">
        <div className="user-profile"><span>{user?.name || "User"}</span></div>
        <button className="logout-btn" onClick={onLogout}>लॉगआउट</button>
      </div>

      <div className="video-grid">
        {isRoomActive && token ? (
          <LiveKitRoom 
            video={true} 
            audio={true} 
            token={token} 
            serverUrl={import.meta.env.VITE_LIVEKIT_URL}
            connect={true}
          >
            <ParticipantList />
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <div className="video-box status-message">
            {searching ? "साथी ढूंढ रहे हैं..." : "तैयार हैं? START दबाएं"}
          </div>
        )}
      </div>

      {isRoomActive && <div className="ai-translation-bar">🤖 AI: {translatedText}</div>}

      {/* गूगल एडसेंस - जैसा था वैसा ही रखा है */}
      <div className="ad-container">
        <ins className="adsbygoogle" style={{display: 'block'}} data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX"></ins>
      </div>

      <div className="controls">
        <button className="btn start-btn" onClick={handleNextCall} disabled={searching}>
            {searching ? "खोज रहे..." : "START / NEXT"}
        </button>
        <button className="btn cut-btn" onClick={handleEndCall}>कॉल कट करें</button>
      </div>
    </div>
  );
}
