import React from 'react';
import { BackHandler } from 'react-native';

export const useAvoidBackPress = () => {
  React.useEffect(() => {
    const handleBackPress = () => true;

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);
};
