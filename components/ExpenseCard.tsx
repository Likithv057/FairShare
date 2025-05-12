import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { wp, hp } from "@/helpers/common";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/constants/theme";

interface ExpenseCardProps {
  name: string;
  amount: number;
  category: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  actionComponent?: React.ReactNode;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  name,
  amount,
  category,
  onPress,
  icon,
  actionComponent,
}) => {
  const { theme } = useTheme();
  const styles = getStyle(theme);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.leftSection}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.amount}>₹{amount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        {actionComponent && <View style={styles.actionContainer}>{actionComponent}</View>}
      </View>
    </Pressable>
  );
};

export default ExpenseCard;

const getStyle = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: theme.borderWidth.thin, // Use theme border width
      borderColor: theme.colors.border, // Use theme border color
      borderRadius: theme.radius.md,
      padding: hp(2),
      marginBottom: hp(1.5),
      width: wp(90),
      backgroundColor: theme.colors.cardBackground, // Add background color
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: wp(3),
    },
    iconContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    name: {
      fontSize: hp(2),
      fontWeight: "600",
      color: theme.colors.text,
      maxWidth: wp(55),
    },
    amount: {
      fontSize: hp(1.5),
      color: theme.colors.textLight,
      marginTop: 2,
    },
    rightSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: wp(2),
    },
    categoryBadge: {
      backgroundColor: theme.colors.accent, // Use accent color
      paddingHorizontal: wp(2.5),
      paddingVertical: hp(0.5),
      borderRadius: theme.radius.md,
    },
    categoryText: {
      color: "#fff",
      fontSize: hp(1.6),
      fontWeight: "500",
    },
    actionContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: wp(1),
      marginLeft: wp(2),
      marginRight: wp(2),
    },
  });