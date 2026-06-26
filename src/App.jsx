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
  const [loading, setLoading] = useState(true); // यह सुनिश्चित करेगा कि पहले चेक हो

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false); // चेक पूरा होते ही लोडिंग बंद
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // जब तक चेक चल रहा है, तब तक खाली या 'Loading...' दिखाएं
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-app">
      {!user ? (
        <Login />
      ) : (
        <VideoCall user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
