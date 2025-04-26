// src/components/PhotoUploader.tsx
import { Button, Image, View, Text, StyleSheet } from "react-native";

type PhotoUploaderProps = {
  fotoUri?: string;
  onTakePhoto: () => void;
  onSelectPhoto: () => void;
};

export const PhotoUploader = ({ fotoUri, onTakePhoto, onSelectPhoto }: PhotoUploaderProps) => (
  <View style={styles.photoContainer}>
    {fotoUri ? (
      <Image source={{ uri: fotoUri }} style={styles.photo} />
    ) : (
      <Text style={styles.noPhotoText}>No hay foto seleccionada</Text>
    )}
    <View style={styles.photoButtons}>
      <View style={styles.photoButton}>
        <Button title="Tomar Foto" onPress={onTakePhoto} color="#D14836" />
      </View>
      <View style={styles.photoButton}>
        <Button title="Seleccionar" onPress={onSelectPhoto} color="#555" />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  photoContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  noPhotoText: {
    color: '#999',
    marginBottom: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  photoButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});