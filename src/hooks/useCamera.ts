// src/hooks/useCamera.ts
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

interface PhotoResult {
  uri: string;
  base64: string | null;
}

export const useCamera = () => {
  const takePhoto = async (): Promise<PhotoResult | null> => {
    try {
      // Solicitar permisos para usar la cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se requiere permiso para usar la cámara.");
        return null;
      }

      // Lanzar cámara
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      // Validar si fue cancelado
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];

      // Validar que la URI es válida y local
      if (!asset.uri || !asset.uri.startsWith("file://")) {
        Alert.alert("Error", "La foto no se guardó correctamente.");
        return null;
      }

      return {
        uri: asset.uri,
        base64: asset.base64 ?? null,
      };
    } catch (err) {
      console.error("Error en takePhoto:", err);
      Alert.alert("Error", "Ocurrió un problema al tomar la foto.");
      return null;
    }
  };

  return { takePhoto };
};
