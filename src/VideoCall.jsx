import React, { useState, useEffect, useRef } from 'react';
import './VideoCall.css';

export default function VideoCall({ user, onLogout }) {
  const [searching, setSearching] = useState(false);
  const [connected, setConnected] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // PeerJS को बिना इंस्टॉल किए सीधे लोड करने का तरीका
    const script = document.createElement('script');
    script.src = "https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js";
    script.onload = () => {
      const peer = new window.Peer(undefined, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });
      peerInstance.current = peer;

      // कैमरा और माइक एक्सेस
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        });

      // कॉल आने पर जवाब देना
      peer.on('call', (call) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          });
        });
      });
    };
    document.head.appendChild(script);

    setupAIVoiceTranslator();

    return () => {
      if (peerInstance.current) peerInstance.current.destroy();
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
        translateAndSpeak(transcript);
      };
      recognitionRef.current = rec;
    }
  };

  const translateAndSpeak = (text) => {
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
      if (recognitionRef.current) recognitionRef.current.start();
    }, 2000);
  };

  return (
    <div className="video-container">
      <div className="top-bar">
        <div className="user-profile"><span>{user?.name || "User"}</span></div>
        <button className="logout-btn" onClick={onLogout}>लॉगआउट</button>
      </div>

      <div className="video-grid">
        <video ref={localVideoRef} autoPlay playsInline muted className="video-box" />
        <video ref={remoteVideoRef} autoPlay playsInline className="video-box remote-box" />
      </div>

      {connected && (
        <div className="ai-translation-bar">
          🤖 AI ट्रांसलेशन: <strong>{translatedText}</strong>
        </div>
      )}

      <div className="controls">
        <button className="btn" onClick={handleNextCall}>
          {searching ? "खोज रहे हैं..." : "START / NEXT"}
        </button>
      </div>
    </div>
  );
}
