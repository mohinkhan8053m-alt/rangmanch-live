import React, { useState } from 'react';
import Login from './Login';
import VideoCall from './VideoCall';
import './App.css'; // अगर आपकी कोई बेसिक स्टाइलिंग फाइल है

export default function App() {
  const [user, setUser] = useState(null);

  // लॉगिन सफल होने पर यूजर का डेटा सेव करें और वीडियो कॉल पेज पर भेजें
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // लॉगआउट करने पर वापस लॉगिन पेज पर लाएं
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="main-app">
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <VideoCall user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

