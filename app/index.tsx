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
    ancho: ""
  });
  
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const getCampos = (): Campo[] => {
    const camposBase: Campo[] = [
      { id: "1", label: "E.Mina", type: "input", key: "emina" },
      { id: "2", label: "Técnico", type: "input", key: "tecnico" },
      { id: "3", label: "Auxiliar", type: "input", key: "auxiliar" },
      { id: "4", label: "Ubicacion de prueba", type: "input", key: "ubicacionPrueba" },
      { id: "5", label: "Calidad de Roca", type: "input", key: "calidadRoca" },
      { id: "6", label: "Temperatura ambiente", type: "input", key: "temperaturaAmbiente" },
      { id: "7", label: "Unidad Minera", key: "unidadMinera", type: "select", options: ["Saucito", "San Julian", "Fresnillo", "Cienega", "Juanicipio"] },
      { 
        id: "8", 
        label: "Tipo de Ancla", 
        key: "tipoAncla", 
        type: "select", 
        options: Object.keys(OPCIONES_ANCLAS) 
      }
    ];

    // Agregar campos de largo y ancho condicionalmente
    if (formData.tipoAncla) {
      camposBase.push(
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
        }
      );
    }

    return camposBase;
  };

  const handleChange = (key: keyof FormData, value: string) => {
    // Resetear valores al cambiar tipo de ancla
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <FlatList
          data={getCampos()}
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
                      <Picker.Item label={`Seleccione ${item.label}`} value="" />
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