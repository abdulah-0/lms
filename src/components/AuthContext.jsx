// src/components/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // Full user record from `users` table
  const [token, setToken] = useState(null); // Access token from Supabase session

  useEffect(() => {
    // Load current session
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile.error) {
          setUser(profile.data);
          setToken(session.access_token);
        }
      }
    };

    loadSession();

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile.error) {
          setUser(profile.data);
          setToken(session.access_token);
        }
      } else {
        setUser(null);
        setToken(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = (profile, access_token) => {
    setUser(profile);
    setToken(access_token);
    localStorage.setItem('user', JSON.stringify(profile));
    localStorage.setItem('token', access_token);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
