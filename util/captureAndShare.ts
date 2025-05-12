import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export async function captureAndShareView(view: any) {
  try {
    const uri = await captureRef(view, {
      format: 'png',
      quality: 0.8,
    });
    await Sharing.shareAsync(uri);
  } catch (error) {
    console.error('Error capturing and sharing view:', error);
  }
}
