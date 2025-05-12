import { StatusBar, View, Image, Text, StyleSheet } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { wp, hp } from "@/helpers/common";
import Button from "@/components/Button";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/constants/theme";

const Welcome: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <ScreenWrapper>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Image
          resizeMode="contain"
          source={require("../../assets/images/icon.png")}
          style={styles.welcomeImage}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>FairShare!</Text>
          <Text style={styles.tagLine}>Where Group Expense Made Easy</Text>
        </View>
        <View style={styles.footer}>
          <Button title="Sign Up" onPress={() => router.push("/auth/signup")} />
          <Button title="Login" onPress={() => router.push("/auth/login")} />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "space-around",
      padding: wp(5),
      backgroundColor: theme.colors.background,
    },
    welcomeImage: {
      marginTop: hp(5),
      marginBottom: hp(2),
      borderColor: theme.colors.primary,
      borderWidth: theme.borderWidth.thin, 
      borderRadius: theme.radius.xl,
      width: 250,
      height: 250,
      alignSelf: "center",
    },
    textContainer: {
      gap: theme.spacing.md,
    },
    title: {
      fontSize: hp(4),
      fontWeight: theme.fonts.bold,
      color: theme.colors.text,
      textAlign: "center",
    },
    tagLine: {
      textAlign: "center",
      paddingHorizontal: wp(10),
      paddingBottom: hp(3),
      fontSize: hp(2),
      color: theme.colors.textLight,
    },
    footer: {
      gap: theme.spacing.md,
      width: "100%",
      marginBottom: hp(15),
    },
  });