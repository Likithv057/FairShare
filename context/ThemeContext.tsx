import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { themes, Theme } from '@/constants/theme'; // Adjust path if necessary
import AsyncStorage from '@react-native-async-storage/async-storage'; // For persistent storage

interface ThemeContextProps {
  theme: Theme;
  mode: 'light' | 'dark'; // Keep track of mode separately
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');  // Track mode separately
  const [theme, setTheme] = useState<Theme>(themes.light);  // Set initial theme

  // Fetch saved theme mode from AsyncStorage when the app starts
  useEffect(() => {
    const loadTheme = async () => {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode) {
        setMode(savedMode as 'light' | 'dark');  // Set the saved mode
        setTheme(themes[savedMode as 'light' | 'dark']);  // Set the saved theme
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);  // Toggle the mode
    setTheme(themes[newMode]);  // Set the corresponding theme

    // Persist the new mode to AsyncStorage
    await AsyncStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
