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
    // 1. सीधे सत्र (Session) चेक करें
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };

    checkUser();

    // 2. तुरंत अपडेट के लिए
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // सफेद पन्ने के बजाय, अगर लोडिंग हो तो यहाँ कोई छोटा सा 'Spinner' या बस खाली रहने दें
  if (loading) return null; 

  return (
    <div className="main-app">
      {!user ? (
        <Login />
      ) : (
        <VideoCall user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}
