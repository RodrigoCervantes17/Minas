// src/hooks/useCamera.ts
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';
import { FotoInspeccion } from '../../types/types';

export const useCamera = () => {
  const requestPermission = async () => {
    try {
      // Verificar si ImagePicker está disponible
      if (!ImagePicker.requestCameraPermissionsAsync) {
        throw new Error('Módulo de cámara no disponible');
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Ve a ajustes y activa los permisos de la cámara',
          [
            { text: 'Cancelar' },
            { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error en requestPermission:', error);
      Alert.alert("Error", "No se pudo acceder a la cámara");
      return false;
    }
  };

  const takePhoto = async (): Promise<FotoInspeccion | null> => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        return {
          uri: result.assets[0].uri,
          base64: result.assets[0].base64 || '',
          observaciones: ''
        };
      }
      return null;
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert("Error", "No se pudo tomar la foto");
      return null;
    }
  };

  return { takePhoto };
};