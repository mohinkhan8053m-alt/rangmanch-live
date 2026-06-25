import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Login.css';

const SUPABASE_URL = "https://wglrckiaxcztqvqccnxl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_41h96FI0K1HrKow3Rr1p1A_bMksXurh";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [userCountry, setUserCountry] = useState('Detecting...');
  const [detectedLang, setDetectedLang] = useState('en');

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        setUserCountry(data.country_name || 'Unknown');
        if (data.country_code === 'IN') {
          setDetectedLang('hi');
        } else {
          setDetectedLang(navigator.language.split('-')[0] || 'en');
        }
      })
      .catch((err) => {
        console.error("Country detection failed:", err);
        setUserCountry('Global');
      });
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const user = session.user;
      onLoginSuccess({
        uid: user.id,
        name: user.user_metadata.full_name || "Supabase User",
        email: user.email,
        photo: user.user_metadata.avatar_url || "https://via.placeholder.com/150",
        country: userCountry,
        language: detectedLang
      });
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Supabase Login Error:", error.message);
      alert("लॉगिन में दिक्कत आई: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* यहाँ आपका नया कर्सिव लोगो चमकेगा */}
        <h1 className="cursive-logo">Global Chat</h1>
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
