import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/constants/theme";
import { wp } from "@/helpers/common";

interface MessageDisplayProps {
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({
  sender,
  content,
  timestamp,
  isCurrentUser,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
      ]}
    >
      <Text
        style={[styles.sender, isCurrentUser && styles.currentUserSender]}
      >
        {isCurrentUser ? "You" : sender}
      </Text>
      <Text style={styles.message}>{content}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    messageContainer: {
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.textLight,
      borderRadius: theme.radius.md,
      marginVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      padding: theme.spacing.sm,
      maxWidth: wp(80),
    },
    currentUserMessage: {
      alignSelf: "flex-end",
      backgroundColor: theme.colors.background,
    },
    otherUserMessage: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.background,
    },
    sender: {
      fontWeight: theme.fonts.bold,
      color: theme.colors.primary,
    },
    currentUserSender: {
      color: theme.colors.success,
    },
    message: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text,
    },
    timestamp: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.textLight,
      paddingRight:wp(11),
    },
  });

export default MessageDisplay;
