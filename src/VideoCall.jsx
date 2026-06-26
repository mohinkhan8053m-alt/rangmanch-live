import React, { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import './VideoCall.css';

export default function VideoCall({ user, onLogout }) {
  const [token, setToken] = useState("");
  const [searching, setSearching] = useState(false);
  const [isRoomActive, setIsRoomActive] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  // 1. टोकन लाना (कनेक्शन के लिए जरूरी)
  useEffect(() => {
    (async () => {
      const resp = await fetch(`/api/get-participant-token?room=omegle-clone&username=${user?.name}`);
      const data = await resp.json();
      setToken(data.token);
    })();
  }, [user]);

  // 2. AI Translator (आपका फीचर)
  const translateAndSpeak = (text) => {
    const translation = "अनुवादित: " + text;
    setTranslatedText(translation);
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(translation));
  };

  // 3. AI Security (गंदगी रोकने के लिए)
  const handleSecurityCheck = (text) => {
    const badWords = ["gali1", "gali2"];
    if (badWords.some(w => text.includes(w))) handleEndCall();
  };

  // 4. कॉल कट करने का ऑप्शन
  const handleEndCall = () => {
    setIsRoomActive(false);
    setSearching(false);
  };

  const handleNextCall = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setIsRoomActive(true);
    }, 2000);
  };

  return (
    <div className="video-container">
      {/* टॉप बार और लॉगआउट */}
      <div className="top-bar">
        <div className="user-profile"><span>{user?.name || "User"}</span></div>
        <button className="logout-btn" onClick={onLogout}>लॉगआउट</button>
      </div>

      {/* वीडियो ग्रिड (इंजन बदल दिया गया है) */}
      <div className="video-grid">
        {isRoomActive ? (
          <LiveKitRoom video={true} audio={true} token={token} serverUrl={import.meta.env.VITE_LIVEKIT_URL}>
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <div className="video-box">तैयार रहें...</div>
        )}
      </div>

      {/* AI Translation और Security का एरिया */}
      {isRoomActive && <div className="ai-translation-bar">🤖 AI: {translatedText}</div>}

      {/* गूगल एडसेंस का ऑप्शन */}
      <div className="ads-container">
        <ins className="adsbygoogle" style={{display: 'block'}} data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX"></ins>
      </div>

      {/* 5. कॉल मिलाने और काटने के बटन */}
      <div className="controls">
        <button className="btn" onClick={handleNextCall}>{searching ? "खोज रहे..." : "START / NEXT"}</button>
        <button className="btn" onClick={handleEndCall}>कॉल कट करें</button>
      </div>
    </div>
  );
}
