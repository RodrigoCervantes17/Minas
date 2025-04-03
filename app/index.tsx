import React, { useState } from "react";
import { 
  View, 
  FlatList, 
  Button, 
  Alert, 
  Keyboard, 
  TouchableWithoutFeedback 
} from "react-native";
import { TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";

// Definición de los datos del formulario
type FormData = {
  emina: string;
  tecnico: string;
  auxiliar: string;
  ubicacionPrueba: string;
  calidadRoca: string;
  temperaturaAmbiente: string;
  unidadMinera: string; // 🔹 Se agregó este campo
};

// Definición de los campos
type Campo = {
  id: string;
  label: string;
  key: keyof FormData;
  type: "input" | "select"; // 🔹 Se agregó el tipo de campo
  options?: string[]; // 🔹 Opcional, solo si es un select
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
    unidadMinera: "" // 🔹 Se agregó el estado inicial
  });

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
        <Button title="Enviar" onPress={handleSubmit} />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Formulario;
