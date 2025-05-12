import { Pressable, StyleSheet } from 'react-native';
import React from 'react';
import Icon from '@/assets/icons';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';

const BackButton: React.FC<{ router: ReturnType<typeof useRouter> }> = ({ router }) => {
  const { theme } = useTheme();
  const styles = getStyle(theme);

  return (
    <Pressable onPress={() => router.back()} style={styles.button}>
      <Icon name="arrowleft" />
    </Pressable>
  );
};

export default BackButton;

const getStyle = (theme: Theme) =>
  StyleSheet.create({
    button: {
      alignSelf: 'flex-start',
      padding: theme.spacing.sm, // Use theme spacing
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.background, // Use card background
    },
  });