import { StyleSheet, View, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import UserHeader from '@/components/UserHeader';
import { wp } from '@/helpers/common';
import { useRouter, useLocalSearchParams } from 'expo-router';
import supabase from '@/lib/supabase';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ScreenWrapper from '@/components/ScreenWrapper';
import Icon from '@/assets/icons';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';

const EditGroup: React.FC = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [groupName, setGroupName] = useState('');
  const { theme } = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    const fetchGroupName = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single();

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setGroupName(data.name);
      }
    };

    if (groupId) {
      fetchGroupName();
    }
  }, [groupId]);

  const handleEditGroup = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Group name cannot be empty');
      return;
    }

    const { error } = await supabase
      .from('groups')
      .update({ name: trimmedName })
      .eq('id', groupId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Group Name updated successfully');
      router.push('/main/home');
    }
  };

  return (
    <ScreenWrapper>
      <UserHeader title="Edit Group Name" />
      <View style={styles.container}>
        <View style={styles.form}>
          <Input
            icon={<Icon name="texticon" />}
            placeholder="Enter new group name"
            value={groupName}
            onChangeText={setGroupName}
          />
          <Button title="Save" onPress={handleEditGroup} />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default EditGroup;

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