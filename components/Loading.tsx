import { View, ActivityIndicator, ActivityIndicatorProps, Text, StyleSheet, ColorValue } from "react-native";
import React from "react";
import { useTheme } from "@/context/ThemeContext";
import ScreenWrapper from "./ScreenWrapper";
import { Theme } from "@/constants/theme";

interface LoadingProps {
  size?: ActivityIndicatorProps["size"];
}

const Loading: React.FC<LoadingProps> = ({ size = "large" }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ActivityIndicator size={size}/>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </ScreenWrapper>
  );
};

export default Loading;

const getStyles = (theme: Theme, color?: ColorValue) => // Change color type to ColorValue
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      color: theme.colors.primary || color,
      fontSize: 15,
      marginTop: 10,
    },
  });