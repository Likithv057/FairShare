import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import supabase from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  upi?: string;
  points?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setAuth: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const extractUser = (sessionUser: any): User => ({
    id: sessionUser.id,
    email: sessionUser.email ?? '',
    name: sessionUser.user_metadata?.name,
    upi: sessionUser.user_metadata?.upi,
    points: sessionUser.user_metadata?.points,
  });

  useEffect(() => {
    const initializeUser = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(extractUser(data.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(extractUser(session.user));
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const setAuth = (authUser: User | null) => {
    setUser(authUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
