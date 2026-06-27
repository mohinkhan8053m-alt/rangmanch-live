import React, { useState, useEffect } from 'react';
import { LiveKitRoom, ParticipantTile, useParticipants, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import './VideoCall.css';

// ओमेगल जैसा लेआउट बनाने के लिए कंपोनेंट
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

  // 1. टोकन लाना
  useEffect(() => {
    if (isRoomActive && user?.name) {
      (async () => {
        try {
          const resp = await fetch(`/api/token?room=public-chat&username=${encodeURIComponent(user.name)}`);
          const data = await resp.json();
          setToken(data.token);
        } catch (err) {
          console.error("Token fetch failed", err);
        }
      })();
    }
  }, [isRoomActive, user]);

  // 2. AI Translator फीचर
  const translateAndSpeak = (text) => {
    const translation = "अनुवादित: " + text;
    setTranslatedText(translation);
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(translation));
  };

  // 3. AI Security फीचर
  const handleSecurityCheck = (text) => {
    const badWords = ["gali1", "gali2"];
    if (badWords.some(w => text.toLowerCase().includes(w.toLowerCase()))) {
      alert("अवैध गतिविधि! आपको ब्लॉक किया गया है।");
      handleEndCall();
    }
  };

  // 4. कॉल कट करना
  const handleEndCall = () => {
    setIsRoomActive(false);
    setSearching(false);
  };

  // 5. कॉल स्टार्ट/नेक्स्ट
  const handleNextCall = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setIsRoomActive(true);
    }, 2000);
  };

  return (
    <div className="video-container">
      {/* टॉप बार */}
      <div className="top-bar">
        <div className="user-profile"><span>{user?.name || "User"}</span></div>
        <button className="logout-btn" onClick={onLogout}>लॉगआउट</button>
      </div>

      {/* वीडियो ग्रिड */}
      <div className="video-grid">
        {isRoomActive && token ? (
          <LiveKitRoom 
            video={true} 
            audio={true} 
            token={token} 
            serverUrl={import.meta.env.VITE_LIVEKIT_URL}
          >
            <ParticipantList />
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <div className="video-box status-message">
            {searching ? "खोज रहे हैं..." : "तैयार रहें... START दबाएं"}
          </div>
        )}
      </div>

      {/* AI Translation और Security Area */}
      {isRoomActive && <div className="ai-translation-bar">🤖 AI: {translatedText}</div>}

      {/* गूगल एडसेंस */}
      <div className="ad-container">
        <ins className="adsbygoogle" style={{display: 'block'}} data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX"></ins>
      </div>

      {/* कंट्रोल बटन */}
      <div className="controls">
        <button className="btn start-btn" onClick={handleNextCall}>{searching ? "खोज रहे..." : "START / NEXT"}</button>
        <button className="btn cut-btn" onClick={handleEndCall}>कॉल कट करें</button>
      </div>
    </div>
  );
}
