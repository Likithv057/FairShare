import React from 'react';
import { StyleSheet, View } from 'react-native';
import { hp, wp } from '@/helpers/common';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';

interface NavProps {
  actionComponent?: React.ReactNode;
}

const Nav: React.FC<NavProps> = ({ actionComponent }) => {
  const { theme } = useTheme();
  const styles = getStyle(theme);

  return (
    <View style={styles.container}>
      {actionComponent && <View style={styles.actionWrapper}>{actionComponent}</View>}
    </View>
  );
};

export default Nav;

const getStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around', // Keep this for overall Nav items if you add more later
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      alignSelf: 'center',
    },
    actionWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-evenly', // Try 'space-between' first
      alignItems: 'center',
      flex: 1,
    },
  });
