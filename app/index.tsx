import React, { useState } from "react";
import { 
  View, 
  FlatList, 
  Button, 
  Alert, 
  Keyboard, 
  TouchableWithoutFeedback,
  Text
} from "react-native";
import { TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useGoogleDrive } from "./googleDriveService"; // Importamos nuestro servicio

// Definición de los datos del formulario
type FormData = {
  emina: string;
  tecnico: string;
  auxiliar: string;
  ubicacionPrueba: string;
  calidadRoca: string;
  temperaturaAmbiente: string;
  unidadMinera: string;
};

// Definición de los campos
type Campo = {
  id: string;
  label: string;
  key: keyof FormData;
  type: "input" | "select";
  options?: string[];
};

const Formulario = () => {
  // Estado para el formulario
  const [formData, setFormData] = useState<FormData>({
    emina: "",
    tecnico: "",
    auxiliar: "",
    ubicacionPrueba: "",
    calidadRoca: "",
    temperaturaAmbiente: "",
    unidadMinera: ""
  });
  
  const [uploading, setUploading] = useState(false);
  const { uploadJsonFile } = useGoogleDrive(); // Utilizamos nuestro hook

  // Lista de campos
  const campos: Campo[] = [
    { id: "1", label: "E.Mina", type: "input", key: "emina" },
    { id: "2", label: "Técnico", type: "input", key: "tecnico" },
    { id: "3", label: "Auxiliar", type: "input", key: "auxiliar" },
    { id: "4", label: "Ubicacion de prueba", type: "input", key: "ubicacionPrueba" },
    { id: "5", label: "Calidad de Roca", type: "input", key: "calidadRoca" },
    { id: "6", label: "Temperatura ambiente", type: "input", key: "temperaturaAmbiente" },
    { id: "7", label: "Unidad Minera", key: "unidadMinera", type: "select", options: ["Saucito", "San Julian", "Fresnillo", "Cienega", "Juanicipio"] }
  ];

  // Función para actualizar el estado
  const handleChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Función para enviar el formulario
  const handleSubmit = () => {
    Keyboard.dismiss();
    Alert.alert("Datos enviados", JSON.stringify(formData, null, 2));
  };

  // Función para subir a Google Drive
  const handleUploadToDrive = async () => {
    try {
      setUploading(true);
      
      const fileName = `formulario_${formData.tecnico}_${new Date().toISOString().slice(0, 10)}.json`;
      const result = await uploadJsonFile(formData, fileName);
      
      Alert.alert(
        "Éxito", 
        `El archivo ${result.fileName} se ha subido correctamente a Google Drive`
      );
    } catch (error: any) { // Tipo 'any' para resolver el error de unknown
      Alert.alert("Error", `No se pudo subir el archivo: ${error.message || 'Error desconocido'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ padding: 20, flex: 1 }}>
        <FlatList
          data={campos}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={{ marginBottom: 10 }}>
              {item.type === "input" ? (
                <TextInput
                  label={item.label}
                  value={formData[item.key]}
                  onChangeText={(text) => handleChange(item.key, text)}
                  mode="outlined"
                />
              ) : (
                <Picker
                  selectedValue={formData[item.key]}
                  onValueChange={(value) => handleChange(item.key, value)}
                >
                  {item.options?.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              )}
            </View>
          )}
        />
        <View style={{ marginVertical: 10 }}>
          <Button title="Enviar" onPress={handleSubmit} />
        </View>
        <View style={{ marginVertical: 10 }}>
          <Button 
            title="Subir a Google Drive" 
            onPress={handleUploadToDrive} 
            disabled={uploading}
            color="#4285F4"
          />
          {uploading && <Text style={{ textAlign: 'center', marginTop: 5 }}>Subiendo...</Text>}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Formulario;