import React, { ReactNode } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from '@/constants/theme';

interface ScreenWrapperProps {
  children: ReactNode;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children }) => {
  const { theme, mode } = useTheme();  
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets.top);

  StatusBar.setBarStyle(mode === 'light' ? 'dark-content' : 'light-content');
  StatusBar.setBackgroundColor(theme.colors.background); 

  return <View style={styles.container}>{children}</View>;
};

export default ScreenWrapper;

const getStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: topInset > 0 ? topInset + 5 : 20, // Adjust paddingTop based on insets
      backgroundColor: theme.colors.background,
    },
  });
