import React, { useState } from "react";
import { 
  View, 
  FlatList, 
  Button, 
  Alert, 
  Keyboard, 
  TouchableWithoutFeedback,
  Text,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { createPDF, sharePDF } from "../services/pdfService";
import { FormData } from "../types/types";

type Campo = {
  id: string;
  label: string;
  key: keyof FormData;
  type: "input" | "select";
  options?: string[];
};

const Formulario = () => {
  const [formData, setFormData] = useState<FormData>({
    emina: "",
    tecnico: "",
    auxiliar: "",
    ubicacionPrueba: "",
    calidadRoca: "",
    temperaturaAmbiente: "",
    unidadMinera: ""
  });
  
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const campos: Campo[] = [
    { id: "1", label: "E.Mina", type: "input", key: "emina" },
    { id: "2", label: "Técnico", type: "input", key: "tecnico" },
    { id: "3", label: "Auxiliar", type: "input", key: "auxiliar" },
    { id: "4", label: "Ubicacion de prueba", type: "input", key: "ubicacionPrueba" },
    { id: "5", label: "Calidad de Roca", type: "input", key: "calidadRoca" },
    { id: "6", label: "Temperatura ambiente", type: "input", key: "temperaturaAmbiente" },
    { id: "7", label: "Unidad Minera", key: "unidadMinera", type: "select", options: ["Saucito", "San Julian", "Fresnillo", "Cienega", "Juanicipio"] }
  ];

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const requiredFields: (keyof FormData)[] = ["tecnico", "unidadMinera", "emina"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        Alert.alert("Error", `El campo ${campos.find(c => c.key === field)?.label || field} es obligatorio`);
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <FlatList
          data={campos}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.fieldContainer}>
              {item.type === "input" ? (
                <TextInput
                  label={item.label}
                  value={formData[item.key]}
                  onChangeText={(text) => handleChange(item.key, text)}
                  mode="outlined"
                />
              ) : (
                <View>
                  <Text style={styles.pickerLabel}>{item.label}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData[item.key]}
                      onValueChange={(value) => handleChange(item.key, value)}
                    >
                      <Picker.Item label="Seleccione una opción" value="" />
                      {item.options?.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}
            </View>
          )}
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

// Mantener los mismos estilos, eliminar estilos relacionados con Google
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f9f9f9'
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
  buttonContainer: {
    marginVertical: 15,
  },
  loader: {
    marginTop: 5,
    alignSelf: 'center'
  }
});

export default Formulario;