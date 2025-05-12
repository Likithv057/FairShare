import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { hp, wp } from '@/helpers/common';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';

interface Props {
  text: string;
  icon?: React.ReactNode;
  actionComponent?: React.ReactNode;
}

const TextDisplay = ({ text, icon, actionComponent }: Props) => {
  const { theme } = useTheme();
  const styles = getStyle(theme);

  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.text}>{text}</Text>
      {actionComponent && <View style={styles.actionContainer}>{actionComponent}</View>}
    </View>
  );
};

export default TextDisplay;

const getStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: hp(7),
      width: wp(90),
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: theme.borderWidth.thick, // Use theme border width
      borderColor: theme.colors.text, // Use theme border color
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.lg, // Use theme spacing
      gap: theme.spacing.sm, // Use theme spacing
    },
    text: {
      color: theme.colors.text,
      fontSize: hp(2),
      flex: 1,
      marginLeft: wp(2),
      alignContent: 'flex-start',
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    }
  });