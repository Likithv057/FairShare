import { StyleSheet, Text, Pressable, View } from "react-native";
import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { hp, wp } from "../helpers/common";
import Loading from "./Loading";
import { Theme } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  icon?:React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  icon,
}) => {
  const { theme } = useTheme();
  const styles = getStyle(theme);

  if (loading) {
    return (
      <View style={[styles.button,{backgroundColor:theme.colors.background}]}>
        <Loading/>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} style={[styles.button, styles.shadowStyle]}>
      {icon && <View style={getStyle(theme).icon}>{icon}</View>}
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

export default Button;

const getStyle = (theme: Theme) => StyleSheet.create({
    button: {
      flexDirection:'row',
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: theme.radius.md,
      height: hp(7),
      width: wp(90),
    },
    text: {
      color: "white",
      fontSize: hp(2.5),
      fontWeight: theme.fonts.bold,
    },
    shadowStyle:{
      shadowColor: theme.colors.shadow, // Use theme shadow color
      shadowOffset: { width: 0, height: 4 }, // Adjusted shadow offset
      shadowOpacity: 0.3, // Adjusted shadow opacity
      shadowRadius: 4, // Adjusted shadow radius
      elevation: theme.elevation.md, // Use theme elevation
    },
    icon: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.lg, // Use theme spacing for consistency
    },
  });