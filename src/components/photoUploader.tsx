// src/components/photoUploader.tsx
import React from "react";
import { View, Image, Text, Button, StyleSheet } from "react-native";

interface PhotoUploaderProps {
  fotoUri?: string;
  onTakePhoto: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  fotoUri, 
  onTakePhoto 
}) => {
  return (
    <View style={styles.container}>
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No hay foto seleccionada</Text>
        </View>
      )}
      
      <View style={styles.button}>
        <Button 
          title="Tomar Foto" 
          onPress={onTakePhoto} 
          color="#D14836"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#666',
    fontStyle: 'italic',
  },
  button: {
    alignSelf: 'flex-start',
  },
});

export default PhotoUploader;