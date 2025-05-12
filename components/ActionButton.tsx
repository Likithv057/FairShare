import { StyleSheet, Text, Pressable, View } from "react-native";
import React from "react";
import Loading from "./Loading";
import { hp, wp } from "@/helpers/common";
import { useTheme } from "@/context/ThemeContext"; // Import useTheme
import { Theme } from "@/constants/theme"; // Import Theme type

interface ButtonProps {
  icon?: React.ReactNode;
  title: string;
  onPress: () => void;
  loading?: boolean;
  color?: string; // New color prop to specify the button color
}

const ActionButton: React.FC<ButtonProps> = ({
  icon,
  title,
  onPress,
  loading = false,
  color, // Let the component user decide if they want to use the theme or a custom color
}) => {
  const { theme } = useTheme(); // Access the theme

  const buttonBackgroundColor = color || theme.colors.primary; // Use custom color or theme primary

  if (loading) {
    return (
      <View style={[getStyles(theme).button, { backgroundColor: theme.colors.border }]}>
        <Loading />
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} style={[getStyles(theme).button, { backgroundColor: buttonBackgroundColor }]}>
      {icon && <View style={getStyles(theme).icon}>{icon}</View>}
      <Text style={getStyles(theme).text}>{title}</Text>
    </Pressable>
  );
};

export default ActionButton;

const getStyles = (theme: Theme) => StyleSheet.create({
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.sm, // Use theme radius
    height: hp(5),
    width: wp(40),
    paddingHorizontal: theme.spacing.sm, // Add some horizontal padding
  },
  text: {
    color: theme.colors.text, // Use a color that contrasts with the button background
    fontSize: theme.fontSizes.md, // Use theme font size
    fontWeight: theme.fonts.semibold, // Use theme font weight
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs, // Use theme spacing for consistency
  },
});