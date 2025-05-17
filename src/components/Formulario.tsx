// src/components/Formulario.tsx
import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Image
} from "react-native";
import { TextInput, Button, Card, Title, Paragraph, Divider } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useCamera } from "../hooks/useCamera";
import { createPDF, sharePDF } from "../../services/pdfService";
import { FormData, PruebaAnclaje, FotoInspeccion } from "../../types/types";
import { validateForm } from "../utils/formUtils";
import * as FileSystem from "expo-file-system";
import ViewShot, { captureRef } from "react-native-view-shot";
import GraficoResistencias from "./GraficoResistencias";

const screenWidth = Dimensions.get("window").width;
const UNIDADES = ["Saucito", "San Julián", "Fresnillo", "Ciénega", "Juanicipio"];
const OPCIONES_ANCLAS = {
  "Ancla Química": { largos: ["1m", "1.5m", "2m", "2.5m", "3m"], diametros: ["25mm", "28mm", "32mm"] },
  "Ancla Mecánica": { largos: ["1.2m", "1.8m", "2.4m", "3m", "3.6m"], diametros: ["22mm", "25mm", "28mm"] },
  "Ancla de Cable": { largos: ["3m", "4m", "5m", "6m", "7m"], diametros: ["15mm", "18mm", "21mm"] }
};

const Formulario: React.FC = () => {
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

  const handlePruebaChange = (index: number, field: keyof PruebaAnclaje, value: string) => {
    setFormData(prev => {
      const pruebas = [...prev.pruebas];
      pruebas[index] = { ...pruebas[index], [field]: value };
      return { ...prev, pruebas };
    });
  };

  const handleAddPrueba = () => {
    setFormData(prev => ({
      ...prev,
      pruebas: [...prev.pruebas, { id: Date.now(), resistencia: "", observaciones: "" }]
    }));
  };

  const handleRemovePrueba = (id: number) => {
    setFormData(prev => ({
      ...prev,
      pruebas: prev.pruebas.filter(p => p.id !== id)
    }));
  };

  const handleAddPhoto = async () => {
    try {
      const photo = await takePhoto();
      if (photo) {
        const fotoCompleta: FotoInspeccion = {
          uri: photo.uri,
          base64: photo.base64,
          observaciones: "",
          recomendaciones: [],
          recomendacionIndividual: ""
        };
        setFormData(prev => ({
          ...prev,
          fotos: [...prev.fotos, fotoCompleta]
        }));
      }
    } catch {
      Alert.alert("Error", "No se pudo agregar la foto");
    }
  };

  const handlePhotoObservationChange = (index: number, text: string) => {
    setFormData(prev => {
      const fotos = [...prev.fotos];
      fotos[index].observaciones = text;
      return { ...prev, fotos };
    });
  };

  const handlePhotoRecommendationChange = (index: number, text: string) => {
    setFormData(prev => {
      const fotos = [...prev.fotos];
      fotos[index].recomendacionIndividual = text;
      return { ...prev, fotos };
    });
  };

  const handleGeneratePDF = async () => {
    if (!validateForm(formData)) {
      Alert.alert("Error", "Complete los campos obligatorios");
      return;
    }
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
  };

  const renderPhotoItem = ({ item, index }: { item: FotoInspeccion; index: number }) => (
    <Card key={index.toString()} style={styles.card}>
      <Card.Cover source={{ uri: item.uri }} style={{ height: 200 }} />
      <Card.Content>
        <TextInput
          label="Observación detallada"
          value={item.observaciones}
          multiline
          onChangeText={text => handlePhotoObservationChange(index, text)}
          style={styles.input} editable
        />
        <TextInput
          label="Recomendación individual"
          value={item.recomendacionIndividual}
          multiline
          onChangeText={text => handlePhotoRecommendationChange(index, text)}
          style={styles.input} editable
        />
      </Card.Content>
    </Card>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        {currentStep === 1 ? (
          <>
            <Card style={styles.card}>
              <Card.Title title="Información General" />
              <Card.Content>
                <TextInput label="E.Mina" value={formData.emina} onChangeText={text => handleChange("emina", text)} style={styles.input} editable />
                <TextInput label="Técnico" value={formData.tecnico} onChangeText={text => handleChange("tecnico", text)} style={styles.input} editable />
                <TextInput label="Auxiliar" value={formData.auxiliar} onChangeText={text => handleChange("auxiliar", text)} style={styles.input} editable />
                <TextInput label="Ubicación de Prueba" value={formData.ubicacionPrueba} onChangeText={text => handleChange("ubicacionPrueba", text)} style={styles.input} editable />
                <TextInput label="Calidad de Roca" value={formData.calidadRoca} onChangeText={text => handleChange("calidadRoca", text)} style={styles.input} editable />
                <TextInput label="Equipo de Barrenación" value={formData.equipoBarrenacion} onChangeText={text => handleChange("equipoBarrenacion", text)} style={styles.input} editable />
                <TextInput label="Temperatura Ambiente" value={formData.temperaturaAmbiente} onChangeText={text => handleChange("temperaturaAmbiente", text)} keyboardType="numeric" style={styles.input} editable />
                <TextInput label="Broca Usada" value={formData.brocaUsada} onChangeText={text => handleChange("brocaUsada", text)} style={styles.input} editable />
                <Paragraph>Unidad Minera</Paragraph>
                <Picker selectedValue={formData.unidadMinera} onValueChange={val => handleChange("unidadMinera", val)} style={styles.picker}>
                  {UNIDADES.map(u => <Picker.Item key={u} label={u} value={u} />)}
                </Picker>
                <Paragraph>Tipo de Ancla</Paragraph>
                <Picker selectedValue={formData.tipoAncla} onValueChange={val => handleChange("tipoAncla", val)} style={styles.picker}>
                  <Picker.Item label="Seleccione tipo" value="" />
                  {Object.keys(OPCIONES_ANCLAS).map(k => <Picker.Item key={k} label={k} value={k} />)}
                </Picker>
                {formData.tipoAncla !== "" && (
                  <>
                    <Paragraph>Largo</Paragraph>
                    <Picker selectedValue={formData.largo} onValueChange={val => handleChange("largo", val)} style={styles.picker}>
                      <Picker.Item label="Seleccione largo" value="" />
                      {OPCIONES_ANCLAS[formData.tipoAncla].largos.map(l => <Picker.Item key={l} label={l} value={l} />)}
                    </Picker>
                    <Paragraph>Diámetro</Paragraph>
                    <Picker selectedValue={formData.diametro} onValueChange={val => handleChange("diametro", val)} style={styles.picker}>
                      <Picker.Item label="Seleccione diámetro" value="" />
                      {OPCIONES_ANCLAS[formData.tipoAncla].diametros.map(d => <Picker.Item key={d} label={d} value={d} />)}
                    </Picker>
                  </>
                )}
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => setCurrentStep(2)}>Siguiente</Button>
              </Card.Actions>
            </Card>
          </>
        ) : (
          <>
            <Card style={styles.card}>
              <Card.Title title="Pruebas de Resistencia" />
              <Card.Content>
                <Button mode="outlined" onPress={handleAddPrueba} style={styles.input}>Añadir Prueba</Button>
                <FlatList
                  data={formData.pruebas}
                  keyExtractor={item => item.id.toString()}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => (
                    <View style={{ marginBottom: 12 }}>
                      <TextInput label={`Resistencia ${index + 1}`} value={item.resistencia} keyboardType="numeric" onChangeText={text => handlePruebaChange(index, "resistencia", text)} style={styles.input} editable />
                      <TextInput label={`Observaciones ${index + 1}`} value={item.observaciones} onChangeText={text => handlePruebaChange(index, "observaciones", text)} style={styles.input} editable />
                      {formData.pruebas.length > 1 && (
                        <Button onPress={() => handleRemovePrueba(item.id)} compact>Eliminar</Button>
                      )}
                    </View>
                  )}
                />
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Title title="Fotos (Opcional)" />
              <Card.Content>
                <Button onPress={handleAddPhoto} mode="contained" style={{ marginBottom: 8 }}>Agregar Foto</Button>
                {formData.fotos.map((foto, index) => renderPhotoItem({ item: foto, index }))}
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Title title="Recomendaciones Generales" />
              <Card.Content>
                <TextInput label="Recomendaciones" value={formData.recomendaciones} onChangeText={text => handleChange("recomendaciones", text)} multiline numberOfLines={4} style={styles.input} editable />
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => setCurrentStep(1)}>Anterior</Button>
                <Button onPress={handleGeneratePDF} loading={generatingPDF}>Generar PDF</Button>
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
  picker: { backgroundColor: "#fff", marginBottom: 12 },
  hiddenChart: { position: "absolute", top: Dimensions.get("window").height + 100, width: screenWidth, height: 260, opacity: 0 }
});

export default Formulario;
