import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      try {
        if (user) {
          router.replace('/main/home');
        } else {
          router.replace('/auth/welcome');
        }
      } catch (err) {
        console.error("Navigation error:", err);
      }
    }
  }, [loading, user]);
  

  if (loading) {
    return (
      <Loading/>
    );
  }

  return null;
}
