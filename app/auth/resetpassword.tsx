import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { hp, wp } from "@/helpers/common";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/constants/theme";
import supabase from "@/lib/supabase";

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // You might want to verify that this screen is opened from the right context
    // If needed, you can check the query params for any deep link-specific data
  }, [router]);

  const handleResetPassword = async () => {
    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Call Supabase to reset the password (based on email stored in the session)
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Password successfully reset! You can now log in with your new password.");
        // Redirect to login screen after 2 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton router={router} />
        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subtitle}>Enter your new password below:</Text>
        <Input
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        {message && <Text style={styles.message}>{message}</Text>}
        <Button
          title={loading ? "Resetting..." : "Reset Password"}
          onPress={handleResetPassword}
          loading={loading}
        />
      </View>
    </ScreenWrapper>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      gap: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: hp(4),
      fontWeight: theme.fonts.bold,
      color: theme.colors.text,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textLight,
      textAlign: "center",
    },
    message: {
      color: "red",
      textAlign: "center",
      marginTop: 10,
    },
  });

export default ResetPassword;
