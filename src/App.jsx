import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Login from './Login';
import VideoCall from './VideoCall';

// Supabase क्लाइंट सेटअप
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. पेज लोड होते ही चेक करें कि क्या यूजर पहले से लॉग इन है?
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
    });

    // 2. लॉगिन/लॉगआउट होने पर ऑटोमैटिक अपडेट करें
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? session.user : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="main-app">
      {/* अगर user है तो VideoCall दिखाओ, नहीं तो Login */}
      {!user ? (
        <Login />
      ) : (
        <VideoCall user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
