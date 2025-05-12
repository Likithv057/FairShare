import React from 'react';
import { Slot } from 'expo-router';
import AppProvider from '@/context/AppProvider';  

export default function RootLayout() {
  return (
    <AppProvider> 
        <Slot />
    </AppProvider>
  );
}

