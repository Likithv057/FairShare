import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import BackButton from './BackButton';
import { hp, wp } from '@/helpers/common';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/constants/theme';

interface UserHeaderProps {
  title: string;
  backbutton?: boolean;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  title,
  backbutton = true,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyle(theme, backbutton); // Pass backbutton prop to getStyle

  return (
    <View style={styles.headerContainer}>
      <View style={styles.container}>
        {backbutton && (
          <View style={styles.backButton}>
            <BackButton router={router} />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title || ' '}</Text>
        </View>
      </View>
    </View>
  );
};

export default UserHeader;

const getStyle = (theme: Theme, showBackButton: boolean) => {
  const backButtonWidth = showBackButton ? wp(12) : 0; 

  return StyleSheet.create({
    headerContainer: {
      paddingHorizontal: wp(4),
      paddingBottom: hp(3),
      gap: hp(2),
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      backgroundColor: theme.colors.background,
      paddingVertical: hp(3),
    },
    backButton: {
      position: 'absolute',
      left: wp(4), // Align with header padding
      zIndex: 1, // Ensure it's above the title if needed
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center', // Center the title within its container
      paddingLeft: backButtonWidth / 2, // Adjust left padding
      paddingRight: backButtonWidth / 2, // Adjust right padding
    },
    title: {
      fontSize: hp(4.5),
      fontWeight: theme.fonts.semibold,
      color: theme.colors.text,
    },
  });
};