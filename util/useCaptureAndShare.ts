// utils/useCaptureAndShare.ts

import { useRef } from 'react';
import { Alert } from 'react-native';
import { captureAndShareView } from './captureAndShare';

export function useCaptureAndShare() {
  const captureRefView = useRef<any>(null);

  const handleCapture = async () => {
    if (captureRefView.current) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        await captureAndShareView(captureRefView.current);
      } catch (err) {
        Alert.alert('Capture Error', 'Failed to capture and share the view.');
        console.error(err);
      }
    } else {
      Alert.alert('Error', 'View not ready to capture');
    }
  };

  return { captureRefView, handleCapture };
}
