import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { hp, wp } from '@/helpers/common'
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';

import ScreenWrapper from '@/components/ScreenWrapper';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Icon from '@/assets/icons';
import BackButton from '@/components/BackButton';

import { signUp } from '@/lib/auth';

const SignUp = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const nameref = useRef('');
  const upiref = useRef('');
  const emailref = useRef('');
  const passwordref = useRef('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const name = nameref.current.trim();
    const upi = upiref.current.trim();
    const email = emailref.current.trim();
    const password = passwordref.current;
  
    if (!name || !upi || !email || !password) {
      return Alert.alert('Missing Fields', 'Please fill out all fields.');
    }
  
    try {
      setLoading(true);
      await signUp({ email, password, name, upi }); 
      Alert.alert('Success', 'Check your email to confirm and log in.');
      router.replace('/auth/login');
    } catch (err: any) {
      Alert.alert('Sign Up Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton router={router} />
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Let's</Text>
          <Text style={styles.welcomeText}>Get Started</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.formText}>Enter Your Details To Create Your Account</Text>

          <Input
            icon={<Icon name="user" />}
            placeholder="Enter your Name"
            onChangeText={(value) => (nameref.current = value)}
          />
          <Input
            icon={<Icon name="upi" />}
            placeholder="Enter your UPI ID"
            onChangeText={(value) => (upiref.current = value)}
          />
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

          <Button title="Sign Up" loading={loading} onPress={handleSignUp} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Have an account?</Text>
            <Pressable onPress={() => router.push('/auth/login')}>
              <Text style={styles.footerLink}>Login</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default SignUp;

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      gap: theme.spacing.xl,
      paddingHorizontal: wp(5),
      backgroundColor: theme.colors.background,
    },
    header: {
      gap: theme.spacing.sm,
    },
    welcomeText: {
      fontSize: hp(4),
      fontWeight: theme.fonts.bold,
      color: theme.colors.text,
    },
    form: {
      gap: theme.spacing.lg,
    },
    formText: {
      fontSize: hp(1.5),
      color: theme.colors.text,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    footerText: {
      color: theme.colors.text,
      fontSize: hp(2),
    },
    footerLink: {
      color: theme.colors.primaryDark,
      fontWeight: theme.fonts.bold,
      fontSize: hp(2),
    },
  });
