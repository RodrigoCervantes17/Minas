// src/components/Formulario.tsx
import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useCamera } from "../hooks/useCamera";
import { createPDF, sharePDF } from "../../services/pdfService";
import { FormData } from "../../types/types";
import { validateForm } from "../utils/formUtils";
import * as FileSystem from "expo-file-system";
import ViewShot, { captureRef } from "react-native-view-shot";
import GraficoResistencias from "./GraficoResistencias";

const screenWidth = Dimensions.get("window").width;
const UNIDADES = ["Saucito", "San Julián", "Fresnillo", "Ciénega", "Juanicipio"];
const OPCIONES_ANCLAS = {
  "Ancla Activa": { diametros: ['5/8"', '3/4"'] },
  "Ancla de argolla soldada": { diametros: ['5/8"', '3/4"'] },
  "Ancla de rosca estándar": { diametros: ['5/8"', '3/4"'] },
  "Ancla de cabeza cuadrado": { diametros: ['5/8"', '3/4"'] },
  'Ancla de tipo "PALETA"': { diametros: ['5/8"', '3/4"'] },
  "Ancla Split Set": { diametros: ["39mm", "47mm", "51mm"] },
  "Ancla Split Var": { diametros: ["39mm", "47mm", "51mm"] },
  "Pines": { diametros: ["39mm", "47mm", "51mm"] },
  "Ancla de cable": { diametros: ['5/8"'] },
  "Rollo de cable": { diametros: ['5/8"'] }
};

const Formulario: React.FC = () => {
  console.log("✅ Componente Formulario montado"); 
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    emina: "",
    tecnico: "",
    auxiliar: "",
    ubicacionPrueba: "",
    calidadRoca: "",
    equipoBarrenacion: "",
    temperaturaAmbiente: "",
    unidadMinera: UNIDADES[0],
    fechaDescenso: new Date().toISOString().split("T")[0],
    tipoAncla: "",
    largo: "",
    diametro: "",
    brocaUsada: "",
    tempAgua: "",
    pruebas: [{ id: 1, resistencia: "", observaciones: "" }],
    fotos: [],
    recomendaciones: ""
  });

  const chartRef = useRef<View>(null);
  const { takePhoto } = useCamera();
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    const camposObligatorios = [
      "emina", "tecnico", "auxiliar", "ubicacionPrueba", "calidadRoca", 
      "equipoBarrenacion", "temperaturaAmbiente", "unidadMinera", 
      "fechaDescenso", "tipoAncla", "largo", "diametro", "brocaUsada", "tempAgua"
    ];
    for (let campo of camposObligatorios) {
      if (!formData[campo as keyof FormData]) {
        Alert.alert("Faltan datos", "Completa todos los campos del paso 1.");
        return;
      }
    }
    setCurrentStep(2);
  };

  const diametrosDisponibles = OPCIONES_ANCLAS[formData.tipoAncla]?.diametros || [];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        {currentStep === 1 && (
          <Card style={styles.card}>
            <Card.Title title="Datos Iniciales" />
            <Card.Content>
              <TextInput label="Emina" value={formData.emina} onChangeText={text => handleChange("emina", text)} style={styles.input} />
              <TextInput label="Técnico" value={formData.tecnico} onChangeText={text => handleChange("tecnico", text)} style={styles.input} />
              <TextInput label="Auxiliar" value={formData.auxiliar} onChangeText={text => handleChange("auxiliar", text)} style={styles.input} />
              <TextInput label="Ubicación de la Prueba" value={formData.ubicacionPrueba} onChangeText={text => handleChange("ubicacionPrueba", text)} style={styles.input} />
              <TextInput label="Calidad de la Roca" value={formData.calidadRoca} onChangeText={text => handleChange("calidadRoca", text)} style={styles.input} />
              <TextInput label="Equipo de Barrenación" value={formData.equipoBarrenacion} onChangeText={text => handleChange("equipoBarrenacion", text)} style={styles.input} />
              <TextInput label="Temperatura Ambiente" value={formData.temperaturaAmbiente} keyboardType="numeric" onChangeText={text => handleChange("temperaturaAmbiente", text)} style={styles.input} />
              <Text style={{ marginBottom: 6 }}>Unidad Minera</Text>
              <Picker selectedValue={formData.unidadMinera} onValueChange={value => handleChange("unidadMinera", value)} style={styles.picker}>
                {UNIDADES.map((unidad, idx) => <Picker.Item key={idx} label={unidad} value={unidad} />)}
              </Picker>
                            <Text style={{ marginBottom: 6 }}>Tipo de Ancla</Text>
              <Picker selectedValue={formData.tipoAncla} onValueChange={value => handleChange("tipoAncla", value)} style={styles.picker}>
                {Object.keys(OPCIONES_ANCLAS).map((ancla, idx) => <Picker.Item key={idx} label={ancla} value={ancla} />)}
              </Picker>
              <TextInput label="Largo del Ancla" value={formData.largo} onChangeText={text => handleChange("largo", text)} style={styles.input} />
              <Text style={{ marginBottom: 6 }}>Diámetro del Ancla</Text>
              <Picker selectedValue={formData.diametro} onValueChange={value => handleChange("diametro", value)} style={styles.picker}>
                {diametrosDisponibles.map((diam, idx) => <Picker.Item key={idx} label={diam} value={diam} />)}
              </Picker>
              <TextInput label="Broca Usada" value={formData.brocaUsada || ""} onChangeText={text => handleChange("brocaUsada", text)} style={styles.input} />
              <TextInput label="Temperatura del Agua" value={formData.tempAgua || ""} keyboardType="numeric" onChangeText={text => handleChange("tempAgua", text)} style={styles.input} />
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" onPress={handleNextStep}>Siguiente</Button>
            </Card.Actions>
          </Card>
        )}
        
        {currentStep === 2 && (
          <>
            <Card style={styles.card}>
              <Card.Title title="Pruebas de Resistencia" />
              <Card.Content>
                <Button mode="outlined" onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    pruebas: [...prev.pruebas, { id: Date.now(), resistencia: '', observaciones: '' }]
                  }));
                }} style={styles.input}>Añadir Prueba</Button>
                {formData.pruebas.map((item, index) => (
                  <View key={item.id} style={{ marginBottom: 12 }}>
                    <TextInput
                      label={`Resistencia ${index + 1}`}
                      value={item.resistencia}
                      keyboardType="numeric"
                      onChangeText={text => {
                        const nuevas = [...formData.pruebas];
                        nuevas[index].resistencia = text;
                        setFormData({ ...formData, pruebas: nuevas });
                      }}
                      style={styles.input}
                    />
                    <TextInput
                      label={`Observaciones ${index + 1}`}
                      value={item.observaciones}
                      onChangeText={text => {
                        const nuevas = [...formData.pruebas];
                        nuevas[index].observaciones = text;
                        setFormData({ ...formData, pruebas: nuevas });
                      }}
                      style={styles.input}
                    />
                    {formData.pruebas.length > 1 && (
                      <Button onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          pruebas: prev.pruebas.filter(p => p.id !== item.id)
                        }));
                      }} compact>Eliminar</Button>
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title title="Fotos (Opcional)" />
              <Card.Content>
                <Button onPress={async () => {
                  try {
  const photo = await takePhoto();

  if (!photo || !photo.uri || !photo.uri.startsWith("file://")) {
    Alert.alert("Foto inválida", "No se pudo capturar o guardar la foto.");
    return;
  }

  const nuevaFoto = {
    uri: photo.uri,
    base64: photo.base64 ?? "",
    observaciones: "",
    recomendaciones: [],
    recomendacionIndividual: ""
  };

  setFormData(prev => ({
    ...prev,
    fotos: [...prev.fotos, nuevaFoto]
  }));
} catch (err) {
  console.error("Error al tomar la foto:", err);
  Alert.alert("Error inesperado", "Ocurrió un problema al tomar la foto.");

                  }
                }} mode="contained" style={{ marginBottom: 8 }}>Agregar Foto</Button>
                {formData.fotos.map((foto, index) => (
                  <Card key={index} style={styles.card}>
                    <Card.Cover source={{ uri: foto.uri }} style={{ height: 200 }} />
                    <Card.Content>
                      <TextInput
                        label="Observación detallada"
                        value={foto.observaciones}
                        multiline
                        onChangeText={text => {
                          const nuevas = [...formData.fotos];
                          nuevas[index].observaciones = text;
                          setFormData({ ...formData, fotos: nuevas });
                        }}
                        style={styles.input}
                      />
                      <TextInput
                        label="Recomendación individual"
                        value={foto.recomendacionIndividual}
                        multiline
                        onChangeText={text => {
                          const nuevas = [...formData.fotos];
                          nuevas[index].recomendacionIndividual = text;
                          setFormData({ ...formData, fotos: nuevas });
                        }}
                        style={styles.input}
                      />
                    </Card.Content>
                  </Card>
                ))}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title title="Recomendaciones Generales" />
              <Card.Content>
                <TextInput
                  label="Recomendaciones"
                  value={formData.recomendaciones}
                  onChangeText={text => handleChange("recomendaciones", text)}
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                />
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => setCurrentStep(1)}>Anterior</Button>
                <Button onPress={async () => {
                  setGeneratingPDF(true);
                  try {
                    const uri = await captureRef(chartRef, {
                      format: "png",
                      quality: 1,
                      width: screenWidth * 2
                    });
                    const chartBase64 = await FileSystem.readAsStringAsync(uri, {
                      encoding: FileSystem.EncodingType.Base64
                    });
                    const pdfUri = await createPDF(formData, chartBase64);
                    await sharePDF(pdfUri);
                  } catch {
                    Alert.alert("Error", "No se pudo generar el PDF");
                  } finally {
                    setGeneratingPDF(false);
                  }
                }} loading={generatingPDF}>Generar PDF</Button>
              </Card.Actions>
            </Card>
          </>
        )}
<View style={styles.hiddenChart}>
          <ViewShot ref={chartRef} options={{ format: "png", quality: 1, width: screenWidth * 2 }}>
            <GraficoResistencias datos={formData.pruebas.map(p => parseFloat(p.resistencia) || 0)} />
          </ViewShot>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f2" },
  card: { marginBottom: 16 },
  input: { marginBottom: 12, backgroundColor: "#fff" },
  picker: { marginBottom: 12, backgroundColor: "#fff" },
  hiddenChart: { position: "absolute", top: Dimensions.get("window").height + 100, width: screenWidth, height: 260, opacity: 0 }
});

export default Formulario;