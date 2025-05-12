import { View, StyleSheet, Alert, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@/assets/icons';
import ScreenWrapper from '@/components/ScreenWrapper';
import UserHeader from '@/components/UserHeader';
import { wp } from '@/helpers/common';
import { useRouter } from 'expo-router';
import { useTheme } from "@/context/ThemeContext";
import Loading from '@/components/Loading';
import TextDisplay from '@/components/TextDisplay';
import { Theme } from '@/constants/theme';

const Profile: React.FC = () => {
  const { user, loading: authLoading, setAuth } = useAuth(); 
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme, mode, toggleTheme } = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('users')
            .select('name, upi, points')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user data:', error.message);
            Alert.alert('Error', 'Could not fetch user data.');
          } else {
            setUserData(data);
          }
        } catch (err) {
          console.error('Error loading user data:', err);
          Alert.alert('Error', 'An unexpected error occurred.');
        }
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }

    // Cleanup function in case component unmounts
    return () => setLoading(false);
  }, [user]);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Failed', error.message);
    } else {
      await AsyncStorage.clear();
      setAuth(null); // Clear user data in context
      router.replace('/auth/welcome'); // Redirect to welcome screen
    }
  };

  const handleLogout = () => {
    Alert.alert('Confirm', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: onLogout, style: 'destructive' },
    ]);
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  return (
    <ScreenWrapper>
      <UserHeader title="Profile" />
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <TextDisplay text={userData?.name || 'No Name'} icon={<Icon name="user" />} />
          <TextDisplay text={user?.email || 'No Email'} icon={<Icon name="mail" />} />
          <TextDisplay text={`UPI : ${userData?.upi || 'Not Linked'}`} icon={<Icon name="upi" />} />
          <TextDisplay text={`Points : ${userData?.points || '0'}`} icon={<Icon name="points" />} />
          <Pressable onPress={handleLogout}>
            <TextDisplay text={`Logout`} icon={<Icon name="logout" color={theme.colors.error} />} />
          </Pressable>
          <Pressable onPress={() => router.push('/main/editprofile')}>
            <TextDisplay text={`Edit Profile`} icon={<Icon name="edit" color={theme.colors.primary} />} />
          </Pressable>
          <Pressable onPress={() => router.push('/main/payments')}>
            <TextDisplay text="View Payments" icon={<Icon name="expenses" />} />
          </Pressable>
          <Pressable onPress={toggleTheme}>
            <TextDisplay text={mode === 'light' ? 'Dark Mode' : 'Light Mode'} icon={<Icon name={mode === 'light' ? 'dark' : 'light'} color={theme.colors.text} />} />
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  ); 
};

export default Profile;

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(4),
    backgroundColor: theme.colors.background,
  },
  infoContainer: {
    gap: theme.spacing.lg,
    alignItems: 'center',
  },
});
