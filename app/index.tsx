import React, { useState, useEffect } from "react";
import { 
  View, 
  FlatList, 
  Button, 
  Alert, 
  Keyboard, 
  TouchableWithoutFeedback,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image
} from "react-native";
import { TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { createPDF, sharePDF } from "../services/pdfService";
import { FormData } from "../types/types";
import { Campo } from "../types/types";

interface OpcionesAnclas {
  [key: string]: {
    largos: string[];
    anchos: string[];
  };
}

const OPCIONES_ANCLAS: OpcionesAnclas = {
  "Ancla 1": {
    largos: ["2m", "3m", "4m", "5m", "6m"],
    anchos: ["30cm", "40cm", "50cm", "60cm", "70cm"]
  },
  "Ancla 2": {
    largos: ["5m", "6m", "7m", "8m", "9m"],
    anchos: ["80cm", "90cm", "1m", "1.1m", "1.2m"]
  },
  "Ancla 3": {
    largos: ["10m", "11m", "12m", "13m", "14m"],
    anchos: ["1.3m", "1.4m", "1.5m", "1.6m", "1.7m"]
  },
  "Ancla 4": {
    largos: ["15m", "16m", "17m", "18m", "19m"],
    anchos: ["1.8m", "1.9m", "2.0m", "2.1m", "2.2m"]
  },
  "Ancla 5": {
    largos: ["20m", "21m", "22m", "23m", "24m"],
    anchos: ["2.3m", "2.4m", "2.5m", "2.6m", "2.7m"]
  }
};

const Formulario = () => {
  const [formData, setFormData] = useState<FormData>({
    emina: "",
    tecnico: "",
    auxiliar: "",
    ubicacionPrueba: "",
    calidadRoca: "",
    temperaturaAmbiente: "",
    unidadMinera: "",
    tipoAncla: "",
    largo: "",
    ancho: "",
    fotoUri: "",
    fotoBase64: ""
  });
  
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, []);

  const getCampos = (): Campo[] => {
    const camposBase: Campo[] = [
      { 
        id: "1", 
        label: "E.Mina", 
        type: "input",
        key: "emina" 
      },
      { 
        id: "2",
        label: "Técnico",
        type: "input",
        key: "tecnico" 
      },
      { 
        id: "3",
        label: "Auxiliar",
        type: "input",
        key: "auxiliar" 
      },
      { 
        id: "4",
        label: "Ubicacion de prueba",
        type: "input",
        key: "ubicacionPrueba" 
      },
      { 
        id: "5",
        label: "Calidad de Roca",
        type: "input",
        key: "calidadRoca" 
      },
      { 
        id: "6",
        label: "Temperatura ambiente",
        type: "input",
        key: "temperaturaAmbiente" 
      },
      {
        id: "7",
        label: "Unidad Minera",
        key: "unidadMinera",
        type: "select",
        options: ["Saucito", "San Julian", "Fresnillo", "Cienega", "Juanicipio"] 
      },
      { 
        id: "8", 
        label: "Tipo de Ancla", 
        key: "tipoAncla", 
        type: "select", 
        options: Object.keys(OPCIONES_ANCLAS) 
      },
      {
        id: "9",
        label: "Largo",
        key: "largo",
        type: "select",
        options: OPCIONES_ANCLAS[formData.tipoAncla]?.largos || []
      },
      {
        id: "10",
        label: "Ancho",
        key: "ancho",
        type: "select",
        options: OPCIONES_ANCLAS[formData.tipoAncla]?.anchos || []
      },
      {
        id: "11",
        label: "Foto de Inspección",
        key: "fotoUri",
        type: "photo"
      }
    ];
    return camposBase;
  };

  const handleChange = (key: keyof FormData, value: string) => {
    if (key === "tipoAncla") {
      setFormData(prev => ({ 
        ...prev, 
        [key]: value,
        largo: "",
        ancho: ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const takePhoto = async () => {
    if (hasCameraPermission === false) {
      Alert.alert("Error", "No tienes permisos para acceder a la cámara");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        setFormData(prev => ({ 
          ...prev, 
          fotoUri: photo.uri,
          fotoBase64: photo.base64 || undefined 
        }));
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const selectFromGallery = async () => {
    if (hasGalleryPermission === false) {
      Alert.alert("Error", "No tienes permisos para acceder a la galería");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        setFormData(prev => ({ 
          ...prev, 
          fotoUri: photo.uri,
          fotoBase64: photo.base64 || undefined 
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const validateForm = () => {
    const requiredFields: (keyof FormData)[] = ["tecnico", "unidadMinera", "emina", "tipoAncla"];
    for (const field of requiredFields) {
      const missingField = getCampos().find(c => c.key === field)?.label || field;
      if (!formData[field]) {
        Alert.alert("Error", `El campo ${missingField} es obligatorio`);
        return false;
      }
    }
    return true;
  };

  const handleGeneratePDF = async () => {
    if (!validateForm()) return;
    
    try {
      setGeneratingPDF(true);
      const pdf = await createPDF(formData);
      
      if (pdf?.filePath) {
        Alert.alert(
          "PDF Generado", 
          "¿Qué deseas hacer con el PDF?",
          [
            {
              text: "Compartir",
              onPress: () => sharePDF(pdf.filePath),
              style: "default"
            },
            {
              text: "Cerrar",
              style: "cancel"
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert("Error", `No se pudo generar el PDF: ${error.message || 'Error desconocido'}`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const renderItem = ({ item }: { item: Campo }) => (
    <View style={styles.fieldContainer}>
      {item.type === "input" ? (
        <TextInput
          label={item.label}
          value={formData[item.key]}
          onChangeText={(text) => handleChange(item.key, text)}
          mode="outlined"
        />
      ) : item.type === "photo" ? (
        <View>
          <Text style={styles.pickerLabel}>{item.label}</Text>
          <View style={styles.photoContainer}>
            {formData.fotoUri ? (
              <Image 
                source={{ uri: formData.fotoUri }} 
                style={styles.photo} 
              />
            ) : (
              <Text style={styles.noPhotoText}>No hay foto seleccionada</Text>
            )}
            <View style={styles.photoButtons}>
              <View style={styles.photoButton}>
                <Button 
                  title="Tomar Foto" 
                  onPress={takePhoto} 
                  color="#D14836"
                />
              </View>
              <View style={styles.photoButton}>
                <Button 
                  title="Seleccionar" 
                  onPress={selectFromGallery} 
                  color="#555"
                />
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.pickerLabel}>{item.label}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData[item.key]}
              onValueChange={(value) => handleChange(item.key, value)}
            >
              <Picker.Item label={`Seleccione ${item.label}`} value="" />
              {item.options?.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <FlatList
          data={getCampos()}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.buttonContainer}>
          <Button 
            title="Generar PDF" 
            onPress={handleGeneratePDF} 
            disabled={generatingPDF}
            color="#D14836"
          />
          {generatingPDF && <ActivityIndicator style={styles.loader} color="#D14836" />}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f9f9f9'
  },
  listContent: {
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff'
  },
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
  buttonContainer: {
    marginVertical: 15,
  },
  loader: {
    marginTop: 5,
    alignSelf: 'center'
  }
});

export default Formulario;