import { StyleSheet, TextInput, View } from 'react-native';
import React from 'react';
import { TextInputProps } from 'react-native';
import { hp, wp } from '@/helpers/common';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme'; // Import the theme type

interface Props extends TextInputProps {
  icon?: React.ReactNode;
  actionComponent?: React.ReactNode;
}

const Input = ({ icon, actionComponent, ...textInputProps }: Props) => {
  const { theme } = useTheme();
  const styles = getStyle(theme);

  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.textLight}
        {...textInputProps}
      />
      {actionComponent && <View style={styles.icon}>{actionComponent}</View>}
    </View>
  );
};

export default Input;

const getStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      height: hp(7),
      width: wp(90),
      borderWidth: theme.borderWidth.thick,
      borderColor: theme.colors.text,
      borderRadius: theme.radius.md,
      borderCurve: 'continuous',
      paddingHorizontal: wp(5),
    },
    icon: {
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    input: {
      flex: 1,
      marginLeft: wp(2),
      fontSize: hp(2),
      color: theme.colors.text,
      paddingVertical: 0,
    },
  });