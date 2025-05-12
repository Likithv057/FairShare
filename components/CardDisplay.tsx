import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { wp, hp } from "@/helpers/common";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from '@/constants/theme';

interface CardProps {
  title: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  actionComponent?: React.ReactNode;
}

const CustomCard: React.FC<CardProps> = ({ title, onPress, icon, actionComponent }) => {
  const { theme } = useTheme();
  const styles = getStyle(theme);

  return (
    <Pressable onPress={onPress} style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={styles.title}>{title}</Text>
          {actionComponent && <View style={styles.actionContainer}>{actionComponent}</View>}
        </View>
      </View>
    </Pressable>
  );
};

const getStyle = (theme: Theme) =>
  StyleSheet.create({
    cardContainer: {
      alignSelf: "center",
      marginBottom: hp(2),
    },
    card: {
      padding: hp(2),
      borderRadius: theme.radius.md, // Use theme radius
      borderWidth: theme.borderWidth.thin, // Use theme border width
      width: wp(90),
      justifyContent: 'center',
      height: hp(10),
      borderColor: theme.colors.border, // Use theme border color
      backgroundColor: theme.colors.cardBackground, // Add background color
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "nowrap",
    },
    iconContainer: {
      marginLeft: wp(2),
      marginRight: wp(5),
    },
    title: {
      fontSize: wp(4.5),
      fontWeight: theme.fonts.bold, // Use theme font weight
      color: theme.colors.text,
      flex: 1,
    },
    actionContainer: {
      alignSelf: "flex-end",
      marginRight: wp(4),
    },
  });

export default CustomCard;