import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { updatePassword } from '@/lib/auth';
import supabase from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';
import { wp } from '@/helpers/common';
import ScreenWrapper from '@/components/ScreenWrapper';
import Input from '@/components/Input';
import Loading from '@/components/Loading';
import UserHeader from '@/components/UserHeader';
import Icon from '@/assets/icons';
import { router } from 'expo-router';

export default function EditProfile() {
  const { user, setAuth } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [name, setName] = useState('');
  const [upi, setUpi] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          throw new Error('Unable to fetch user info');
        }

        const metadata = data.user.user_metadata || {};
        setName(metadata.name || '');
        setUpi(metadata.upi || '');
      } catch (err) {
        Alert.alert('Error', 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleUpdate = async () => {
    if (!name.trim() || !upi.trim()) {
      Alert.alert('Validation Error', 'Please fill in name and UPI.');
      return;
    }

    setUpdating(true);

    try {
      // Update metadata (name, upi)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          upi: upi.trim(),
        },
      });
      if (metadataError) throw metadataError;

      // Update password if provided
      if (password.trim() !== '') {
        await updatePassword(password.trim());
      }

      // Refresh user context after update
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser();

      if (updatedUser) {
        setAuth({
          id: updatedUser.id,
          email: updatedUser.email ?? '',
          name: updatedUser.user_metadata?.name,
          upi: updatedUser.user_metadata?.upi,
          points: updatedUser.user_metadata?.points,
        });
      }

      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScreenWrapper>
      <UserHeader title="Edit Profile" />
      <View style={styles.container}>
        <View style={styles.form}>
          <Input
            icon={<Icon name="user" />}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.textLight}
          />
          <Input
            icon={<Icon name="upi" />}
            value={upi}
            onChangeText={setUpi}
            placeholder="Enter your UPI ID"
            placeholderTextColor={theme.colors.textLight}
          />
          <Input
            icon={<Icon name="lock" />}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            placeholderTextColor={theme.colors.textLight}
            secureTextEntry
          />
          <Button title="Update Profile" onPress={handleUpdate} loading={updating} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: wp(4),
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: theme.fonts.bold,
      marginBottom: 20,
      textAlign: 'center',
      color: theme.colors.text,
    },
    form: {
      gap: 15,
      width: '100%',
    },
  });
