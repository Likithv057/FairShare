import { StyleSheet, View, Alert } from 'react-native';
import React, { useState } from 'react';
import UserHeader from '@/components/UserHeader';
import { wp } from '@/helpers/common';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import supabase from '@/lib/supabase';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ScreenWrapper from '@/components/ScreenWrapper';
import Icon from '@/assets/icons';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';

const Creategroup: React.FC = () => {
  const [groupName, setGroupName] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name cannot be empty');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Insert the new group
    const { data, error } = await supabase
      .from('groups')
      .insert([{ name: groupName, created_by: user.id }])
      .select('*')
      .single();

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // Insert the user as an admin in the group_members table
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: data.id, user_id: user.id, role: 'admin' }]);

      if (memberError) {
        Alert.alert('Error', memberError.message);
      } else {
        Alert.alert('Success', 'Group created successfully');
        router.push('/main/home');
      }
    }
  };

  return (
    <ScreenWrapper>
      <UserHeader title="Create Group" />
      <View style={styles.container}>
        <View style={styles.form}>
          <Input
            icon={<Icon name="texticon" />}
            placeholder="Enter group name"
            value={groupName}
            onChangeText={setGroupName}
          />
          <Button title="Create Group" onPress={handleCreateGroup} />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Creategroup;

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      margin:'auto',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      backgroundColor: theme.colors.background,
    },
    form: {
      gap: 20,
      width: '100%',
    },
  });