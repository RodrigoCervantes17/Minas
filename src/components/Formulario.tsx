// src/components/Formulario.tsx

import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  Button,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  StyleSheet,
  Text,
  Image,
  FlatList
} from "react-native";
import { TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useCamera } from "../hooks/useCamera";
import { createPDF, sharePDF } from "../../services/pdfService";
import { FormData, PruebaAnclaje, FotoInspeccion } from "../../types/types";
import { validateForm } from "../utils/formUtils";
import * as FileSystem from "expo-file-system";
import ViewShot, { captureRef } from "react-native-view-shot";
import GraficoResistencias from "./GraficoResistencias";

const screenWidth = Dimensions.get("window").width;

const OPCIONES_ANCLAS = {
  "Ancla Química": { largos: ["1m","1.5m","2m","2.5m","3m"], diametros: ["25mm","28mm","32mm"] },
  "Ancla Mecánica": { largos: ["1.2m","1.8m","2.4m","3m","3.6m"], diametros: ["22mm","25mm","28mm"] },
  "Ancla de Cable": { largos: ["3m","4m","5m","6m","7m"], diametros: ["15mm","18mm","21mm"] }
};

const Formulario: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    emina: "",
    tecnico: "",
    auxiliar: "",
    ubicacionPrueba: "",
    calidadRoca: "",
    equipoBarrenacion: "",
    temperaturaAmbiente: "",
    unidadMinera: "",
    fechaDescenso: new Date().toISOString().split('T')[0],
    tipoAncla: "",
    largo: "",
    diametro: "",
    brocaUsada: "",
    tempAgua: "",
    pruebas: Array(5).fill(null).map((_, i) => ({ id: i+1, resistencia: "", observaciones: "" })),
    fotos: [],
    recomendaciones: ""
  });
  const chartRef = useRef<ViewShot>(null);
  const { takePhoto } = useCamera();
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const handleChange = (key: keyof FormData, value: string) => {
    if (key === "tipoAncla") {
      setFormData(prev => ({ ...prev, tipoAncla: value, largo: "", diametro: "" }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const handlePruebaChange = (id: number, field: keyof PruebaAnclaje, value: string) => {
    setFormData(prev => ({
      ...prev,
      pruebas: prev.pruebas.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const handleAddPhoto = async () => {
    try {
      const photo = await takePhoto();
      if (photo) {
        const fotoCompleta: FotoInspeccion = { uri: photo.uri, base64: photo.base64, observaciones: photo.observaciones || '' };
        setFormData(prev => ({ ...prev, fotos: [...prev.fotos, fotoCompleta] }));
        Alert.alert("¡Foto agregada!", "La foto se guardó correctamente");
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo agregar la foto");
    }
  };

  const handlePhotoObservationChange = (index: number, text: string) => {
    setFormData(prev => {
      const fotos = [...prev.fotos]; fotos[index].observaciones = text;
      return { ...prev, fotos };
    });
  };

  const handleGeneratePDF = async () => {
    if (!validateForm(formData)) {
      Alert.alert("Error", "Por favor complete los campos obligatorios");
      return;
    }
    try {
      setGeneratingPDF(true);
      // Captura gráfica oculta
      const uri = await captureRef(chartRef, { 
        format: 'png',
        quality: 1,
        width: 800,
        height: 260,});
      const chartBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const pdfUri = await createPDF(formData, chartBase64);
      await sharePDF(pdfUri);
    } catch {
      Alert.alert("Error", "No se pudo generar el PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const renderPruebaItem = ({ item }: { item: PruebaAnclaje }) => (
    <View style={styles.pruebaRow}>
      <Text style={styles.pruebaLabel}>Prueba {item.id}</Text>
      <TextInput
        style={styles.pruebaInput}
        placeholder="Resistencia (ton)"
        value={item.resistencia}
        keyboardType="numeric"
        onChangeText={text => handlePruebaChange(item.id, 'resistencia', text)}
      />
      <TextInput
        style={styles.pruebaInput}
        placeholder="Observaciones"
        value={item.observaciones}
        onChangeText={text => handlePruebaChange(item.id, 'observaciones', text)}
      />
    </View>
  );

  const renderPhotoItem = ({ item, index }: { item: FotoInspeccion, index: number }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
      <TextInput
        style={styles.photoObservation}
        placeholder="Observaciones de la foto"
        value={item.observaciones}
        multiline
        onChangeText={text => handlePhotoObservationChange(index, text)}
      />
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Datos Generales */}
          <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          
          <TextInput
            label="E.Mina"
            value={formData.emina}
            onChangeText={text => handleChange('emina', text)}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Técnico"
            value={formData.tecnico}
            onChangeText={text => handleChange('tecnico', text)}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Auxiliar"
            value={formData.auxiliar}
            onChangeText={text => handleChange('auxiliar', text)}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Ubicación de Prueba"
            value={formData.ubicacionPrueba}
            onChangeText={text => handleChange('ubicacionPrueba', text)}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Calidad de Roca"
            value={formData.calidadRoca}
            onChangeText={text => handleChange('calidadRoca', text)}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Equipo de Barrenación"
            value={formData.equipoBarrenacion}
            onChangeText={text => handleChange('equipoBarrenacion', text)}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Temperatura Ambiente (°C)"
            value={formData.temperaturaAmbiente}
            onChangeText={text => handleChange('temperaturaAmbiente', text)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          
          <TextInput
            label="Unidad Minera"
            value={formData.unidadMinera}
            onChangeText={text => handleChange('unidadMinera', text)}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Fecha de Descenso"
            value={formData.fechaDescenso}
            onChangeText={text => handleChange('fechaDescenso', text)}
            mode="outlined"
            style={styles.input}
          />
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Tipo de Ancla</Text>
            <Picker
              selectedValue={formData.tipoAncla}
              onValueChange={value => handleChange('tipoAncla', value)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione tipo de ancla" value="" />
              {Object.keys(OPCIONES_ANCLAS).map(option => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>

          {formData.tipoAncla && (
            <>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Largo</Text>
                <Picker
                  selectedValue={formData.largo}
                  onValueChange={value => handleChange('largo', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione largo" value="" />
                  {OPCIONES_ANCLAS[formData.tipoAncla].largos.map(option => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Diámetro</Text>
                <Picker
                  selectedValue={formData.diametro}
                  onValueChange={value => handleChange('diametro', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione diámetro" value="" />
                  {OPCIONES_ANCLAS[formData.tipoAncla].diametros.map(option => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            </>
          )}
          
          <TextInput
            label="Broca Usada"
            value={formData.brocaUsada}
            onChangeText={text => handleChange('brocaUsada', text)}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Temperatura del Agua (°C)"
            value={formData.tempAgua}
            onChangeText={text => handleChange('tempAgua', text)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

          {/* Pruebas de Resistencia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pruebas de Resistencia</Text>
            <FlatList
              data={formData.pruebas}
              renderItem={renderPruebaItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          </View>

          {/* Fotos Opcionales */}
          <View style={styles.section}>
            <Button title="Agregar Foto" color="#D14836" onPress={handleAddPhoto} />
            {formData.fotos.length ? (
              <FlatList
                data={formData.fotos}
                renderItem={renderPhotoItem}
                keyExtractor={(_, i) => i.toString()}
                scrollEnabled={false}
              />
            ) : <Text style={styles.noPhotosText}>No hay fotos</Text>}
          </View>

          {/* Recomendaciones */}
          <View style={styles.section}>
            <TextInput
              label="Recomendaciones"
              multiline
              numberOfLines={4}
              style={[styles.input, styles.multilineInput]}
              value={formData.recomendaciones}
              onChangeText={text => handleChange('recomendaciones', text)}
            />
          </View>

          {/* Botón PDF */}
          <View style={styles.buttonContainer}>
            <Button
              title="Generar Reporte PDF"
              onPress={handleGeneratePDF}
              disabled={generatingPDF}
              color="#D14836"
            />
          </View>
        </ScrollView>

        {/* Gráfico invisible para PDF */}
        <View style={{
          position: 'absolute',
          top: Dimensions.get('window').height + 100,
          width: screenWidth,
          height: 260,
          opacity: 0
        }}>
          <ViewShot ref={chartRef} options={{ format: 'png', quality: 1 }}>
            <GraficoResistencias datos={formData.pruebas.map(p => parseFloat(p.resistencia) || 0)} />
          </ViewShot>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { padding: 16 },
  section: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#fff', marginBottom: 12 },
  multilineInput: { minHeight: 80 },
  pruebaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pruebaLabel: { width: 80, fontWeight: 'bold', marginRight: 8 },
  pruebaInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 8, backgroundColor: '#fff', marginRight: 8 },
  photoItem: { marginTop: 12 },
  photo: { width: '100%', height: 200, borderRadius: 4, marginBottom: 8 },
  photoObservation: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 8, backgroundColor: '#fff' },
  noPhotosText: { fontStyle: 'italic', color: '#666', textAlign: 'center', marginTop: 8 },
  buttonContainer: { marginVertical: 16 },
  pickerContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  picker: {
    backgroundColor: '#fff',
  }
});

export default Formulario;