// src/services/cameraService.ts
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Alert } from 'react-native';

export const requestCameraPermissions = async () => {
  const cameraStatus = await Camera.requestCameraPermissionsAsync();
  return cameraStatus.status === 'granted';
};

export const requestGalleryPermissions = async () => {
  const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return galleryStatus.status === 'granted';
};

export const takePhoto = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Error al tomar foto:', error);
    Alert.alert("Error", "No se pudo tomar la foto");
    return null;
  }
};

export const selectFromGallery = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Error al seleccionar imagen:', error);
    Alert.alert("Error", "No se pudo seleccionar la imagen");
    return null;
  }
};