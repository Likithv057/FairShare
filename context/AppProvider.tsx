import React, { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

interface AppProviderProps {
  children: ReactNode;  // Define children as ReactNode to accept any valid JSX content
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children} 
      </ThemeProvider>
    </AuthProvider>
  );
};

export default AppProvider;
