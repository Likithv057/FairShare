import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { hp, wp } from "@/helpers/common";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/constants/theme";
import supabase from "@/lib/supabase";
import Icon from "@/assets/icons";

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Forgot Password", "Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "fairshare://resetpassword",
      });
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "We've sent you a password reset link to your email.");
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton router={router} />
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send a reset link.
        </Text>
        <Input
          icon={<Icon name="mail" />}
          value={email}
          placeholder="Enter your email"
          onChangeText={setEmail}
        />
        <Button title="Send Reset Link" loading={loading} onPress={onSubmit} />
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
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textLight,
    },
  });

export default ForgotPassword;
