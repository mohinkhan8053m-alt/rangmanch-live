import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Login from './Login';
import VideoCall from './VideoCall';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. पेज लोड होते ही सत्र चेक करें
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkUser();

    // 2. ऑथेंटिकेशन बदलने पर तुरंत रिस्पॉन्स
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // लोडिंग के दौरान कुछ न दिखाएं
  if (loading) return null; 

  // मुख्य बदलाव: अगर user नहीं है, तो पक्का सिर्फ Login पेज ही दिखेगा
  return (
    <div className="main-app">
      {user ? (
        <VideoCall user={user} onLogout={() => setUser(null)} />
      ) : (
        <Login />
      )}
    </div>
  );
}
