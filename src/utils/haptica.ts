import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Respuesta háptica corta para confirmar una acción. Nunca es la única señal. */
export function confirmacionHaptica(): void {
  if (Platform.OS === 'android') {
    Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm);
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}