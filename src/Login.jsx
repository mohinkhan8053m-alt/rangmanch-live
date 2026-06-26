import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Login.css';

// 🔑 आपकी चाबियाँ सुरक्षित हैं
const supabase = createClient(
  "https://wglrckiaxcztqvqccnxl.supabase.co", 
  "sb_publishable_41h96FI0K1HrKow3Rr1p1A_bMksXurh"
);

export default function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [userCountry, setUserCountry] = useState('Detecting...');
  const [detectedLang, setDetectedLang] = useState('en');

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        setUserCountry(data.country_name || 'Unknown');
        setDetectedLang(data.country_code === 'IN' ? 'hi' : 'en');
      })
      .catch((err) => {
        console.error("Location detection failed:", err);
        setUserCountry('Global');
      });
  }, []);

  // फीचर: Google लॉगिन (यहाँ बदलाव किया है)
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          // अब यह सीधा आपकी लाइव वेबसाइट पर जाएगा
          redirectTo: 'https://rangmanch-live.vercel.app/auth/v1/callback' 
        }
      });
      if (error) throw error;
    } catch (error) {
      alert("लॉगिन में दिक्कत आई: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="cursive-logo">Rang Manch</h1>
        <p className="tagline">दुनियाभर के अनजान लोगों से अपनी भाषा में बात करें</p>
        
        <div className="country-badge">
          📍 आपकी लोकेशन: <strong>{userCountry}</strong> ({detectedLang === 'hi' ? 'Hindi Mode' : 'English Mode'})
        </div>

        <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
          {loading ? "कनेक्ट हो रहा है..." : "Continue with Google"}
        </button>

        <p className="footer-text">सुरक्षित प्लेटफॉर्म: लॉगिन करने से फेक यूजर्स ब्लॉक रहते हैं।</p>
      </div>
    </div>
  );
}
