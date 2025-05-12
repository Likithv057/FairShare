import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { hp, wp } from '@/helpers/common';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';

import ScreenWrapper from '@/components/ScreenWrapper';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Icon from '@/assets/icons';
import BackButton from '@/components/BackButton';

import { signIn } from '@/lib/auth'; 

const Login = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const emailref = useRef('');
  const passwordref = useRef('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const email = emailref.current.trim();
    const password = passwordref.current.trim();

    if (!email || !password) {
      return Alert.alert('Missing Fields', 'Please fill out all fields.');
    }

    try {
      setLoading(true);
      await signIn(email, password); // Perform sign-in using the provided credentials
      Alert.alert('Success', 'Login successful!');
      router.replace('/main/home'); // Redirect to home after successful login
    } catch (err: any) {
      Alert.alert('Login Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton router={router} />
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.formText}>Enter Your Email and Password</Text>

          <Input
            icon={<Icon name="mail" />}
            placeholder="Enter your email"
            keyboardType="email-address"
            onChangeText={(value) => (emailref.current = value)}
          />
          <Input
            icon={<Icon name="lock" />}
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => (passwordref.current = value)}
          />
          <Pressable onPress={() => router.push('/auth/forgotpassword')}>
          <Text style={styles.forgotPassword}>
            Forgot Password?
          </Text>
          </Pressable>

          <Button title="Login" loading={loading} onPress={onSubmit} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push('/auth/signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      gap: theme.spacing.xl, // Use theme spacing
      paddingHorizontal: wp(5),
      backgroundColor: theme.colors.background, // Add background color
    },
    header: {
      gap: theme.spacing.sm, // Use theme spacing
    },
    welcomeText: {
      fontSize: hp(4),
      fontWeight: theme.fonts.bold,
      color: theme.colors.text,
    },
    form: {
      gap: theme.spacing.lg, // Use theme spacing
    },
    formText: {
      fontSize: hp(1.5),
      color: theme.colors.text,
    },
    forgotPassword: {
      textAlign: 'right',
      fontWeight: theme.fonts.semibold,
      color: theme.colors.text,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.sm, // Use theme spacing
    },
    footerText: {
      textAlign: 'center',
      color: theme.colors.text,
      fontSize: hp(2),
    },
    footerLink: {
      textAlign: 'center',
      color: theme.colors.primaryDark,
      fontWeight: theme.fonts.bold,
      fontSize: hp(2),
    },
  });
