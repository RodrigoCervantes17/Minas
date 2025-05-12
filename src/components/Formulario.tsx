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
  FlatList,
  TouchableOpacity
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

const UNIDADES = ["Saucito", "San Julián", "Fresnillo", "Ciénega", "Juanicipio"];
const OPCIONES_ANCLAS = {
  "Ancla Química":   { largos: ["1m","1.5m","2m","2.5m","3m"], diametros: ["25mm","28mm","32mm"] },
  "Ancla Mecánica":  { largos: ["1.2m","1.8m","2.4m","3m","3.6m"], diametros: ["22mm","25mm","28mm"] },
  "Ancla de Cable":  { largos: ["3m","4m","5m","6m","7m"], diametros: ["15mm","18mm","21mm"] }
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

  // --- Handlers ---
  const handleChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePruebaChange = (
    index: number,
    field: keyof PruebaAnclaje,
    value: string
  ) => {
    setFormData(prev => {
      const pruebas = [...prev.pruebas];
      pruebas[index] = { ...pruebas[index], [field]: value };
      return { ...prev, pruebas };
    });
  };

  const handleAddPrueba = () => {
    setFormData(prev => ({
      ...prev,
      pruebas: [
        ...prev.pruebas,
        { id: Date.now(), resistencia: "", observaciones: "" }
      ]
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

  // --- Renderers ---
  const renderPruebaItem = ({
    item,
    index
  }: {
    item: PruebaAnclaje;
    index: number;
  }) => (
    <View style={styles.pruebaRow} key={item.id.toString()}>
      <Text style={styles.pruebaLabel}>Prueba {index + 1}</Text>
      <TextInput
        style={styles.pruebaInput}
        placeholder="Resistencia"
        value={item.resistencia}
        keyboardType="numeric"
        onChangeText={text => handlePruebaChange(index, "resistencia", text)}
      />
      <TextInput
        style={styles.pruebaInput}
        placeholder="Observaciones"
        value={item.observaciones}
        onChangeText={text => handlePruebaChange(index, "observaciones", text)}
      />
      {formData.pruebas.length > 1 && (
        <TouchableOpacity
          onPress={() => handleRemovePrueba(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>Eliminar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPhotoItem = ({
    item,
    index
  }: {
    item: FotoInspeccion;
    index: number;
  }) => (
    <View style={styles.photoItem} key={index.toString()}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
      <TextInput
        placeholder="Observación detallada"
        value={item.observaciones}
        multiline
        onChangeText={text => handlePhotoObservationChange(index, text)}
        style={styles.photoObservation}
      />
      <TextInput
        placeholder="Recomendación individual"
        value={item.recomendacionIndividual}
        multiline
        onChangeText={text => handlePhotoRecommendationChange(index, text)}
        style={styles.photoObservation}
      />
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          {currentStep === 1 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información General</Text>

              {/* Campos de Información General */}
              <TextInput
                label="E.Mina"
                value={formData.emina}
                onChangeText={text => handleChange("emina", text)}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Técnico"
                value={formData.tecnico}
                onChangeText={text => handleChange("tecnico", text)}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Auxiliar"
                value={formData.auxiliar}
                onChangeText={text => handleChange("auxiliar", text)}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Ubicación de Prueba"
                value={formData.ubicacionPrueba}
                onChangeText={text =>
                  handleChange("ubicacionPrueba", text)
                }
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Calidad de Roca"
                value={formData.calidadRoca}
                onChangeText={text => handleChange("calidadRoca", text)}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Equipo de Barrenación"
                value={formData.equipoBarrenacion}
                onChangeText={text =>
                  handleChange("equipoBarrenacion", text)
                }
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Temperatura Ambiente"
                value={formData.temperaturaAmbiente}
                onChangeText={text =>
                  handleChange("temperaturaAmbiente", text)
                }
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />

              {/* Unidad Minera */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Unidad Minera</Text>
                <Picker
                  selectedValue={formData.unidadMinera}
                  onValueChange={val =>
                    handleChange("unidadMinera", val as string)
                  }
                  style={styles.picker}
                >
                  {UNIDADES.map(u => (
                    <Picker.Item key={u} label={u} value={u} />
                  ))}
                </Picker>
              </View>

              <TextInput
                label="Broca Usada"
                value={formData.brocaUsada}
                onChangeText={text => handleChange("brocaUsada", text)}
                mode="outlined"
                style={styles.input}
              />

              {/* Tipo de Ancla */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Tipo de Ancla</Text>
                <Picker
                  selectedValue={formData.tipoAncla}
                  onValueChange={val =>
                    handleChange("tipoAncla", val as string)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione tipo" value="" />
                  {Object.keys(OPCIONES_ANCLAS).map(k => (
                    <Picker.Item key={k} label={k} value={k} />
                  ))}
                </Picker>
              </View>
              {formData.tipoAncla && (
                <>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Largo</Text>
                    <Picker
                      selectedValue={formData.largo}
                      onValueChange={val =>
                        handleChange("largo", val as string)
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Seleccione largo" value="" />
                      {OPCIONES_ANCLAS[formData.tipoAncla].largos.map(l => (
                        <Picker.Item key={l} label={l} value={l} />
                      ))}
                    </Picker>
                  </View>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Diámetro</Text>
                    <Picker
                      selectedValue={formData.diametro}
                      onValueChange={val =>
                        handleChange("diametro", val as string)
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Seleccione diámetro" value="" />
                      {OPCIONES_ANCLAS[formData.tipoAncla].diametros.map(d => (
                        <Picker.Item key={d} label={d} value={d} />
                      ))}
                    </Picker>
                  </View>
                </>
              )}

              <View style={styles.navigationButtons}>
                <Button title="Siguiente" onPress={() => setCurrentStep(2)} />
              </View>
            </View>
          ) : (
            <>
              {/* STEP 2 */}
              <View style={styles.section}>
                <View style={styles.pruebasHeader}>
                  <Text style={styles.sectionTitle}>Pruebas de Resistencia</Text>
                  <Button
                    title="Añadir Prueba"
                    onPress={handleAddPrueba}
                    color="#D14836"
                  />
                </View>
                <FlatList
                  data={formData.pruebas}
                  renderItem={renderPruebaItem}
                  keyExtractor={item => item.id.toString()}
                  scrollEnabled={false}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fotos (Opcional)</Text>
                <Button
                  title="Agregar Foto"
                  onPress={handleAddPhoto}
                  color="#D14836"
                />
                {formData.fotos.length > 0 ? (
                  <FlatList
                    data={formData.fotos}
                    renderItem={renderPhotoItem}
                    keyExtractor={(_, i) => i.toString()}
                    scrollEnabled={false}
                  />
                ) : (
                  <Text style={styles.noPhotosText}>
                    No hay fotos agregadas
                  </Text>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Recomendaciones Generales
                </Text>
                <TextInput
                  label="Recomendaciones"
                  value={formData.recomendaciones}
                  onChangeText={text =>
                    handleChange("recomendaciones", text)
                  }
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={[styles.input, styles.multilineInput]}
                />
              </View>

              <View style={styles.navigationButtons}>
                <Button title="Anterior" onPress={() => setCurrentStep(1)} />
                <Button
                  title="Generar PDF"
                  onPress={handleGeneratePDF}
                  disabled={generatingPDF}
                />
              </View>
            </>
          )}
        </ScrollView>

        {/* Gráfico oculto para PDF */}
        <View style={styles.hiddenChart}>
          <ViewShot
            ref={chartRef}
            options={{ format: "png", quality: 1, width: screenWidth * 2 }}
          >
            <GraficoResistencias
              datos={formData.pruebas.map(p => parseFloat(p.resistencia) || 0)}
            />
          </ViewShot>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  contentContainer: { padding: 16 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#333" },
  input: { marginBottom: 12, backgroundColor: "#fff" },
  multilineInput: { minHeight: 100 },
  pickerContainer: { marginBottom: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 4, overflow: "hidden" },
  pickerLabel: { fontSize: 12, color: "#666", paddingHorizontal: 12, paddingTop: 8 },
  picker: { backgroundColor: "#fff" },
  navigationButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  pruebasHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  pruebaRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  pruebaLabel: { width: 80, fontWeight: "bold", marginRight: 8 },
  pruebaInput: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 4, padding: 8, backgroundColor: "#fff", marginRight: 8 },
  deleteButton: { padding: 4, backgroundColor: "#f8d7da", borderRadius: 4 },
  deleteText: { color: "#721c24", fontSize: 12 },
  photoItem: { marginTop: 12 },
  photo: { width: "100%", height: 200, borderRadius: 4, marginBottom: 8 },
  photoObservation: { borderWidth: 1, borderColor: "#ddd", borderRadius: 4, padding: 8, backgroundColor: "#fff", marginBottom: 8 },
  noPhotosText: { textAlign: "center", color: "#666", fontStyle: "italic", marginTop: 8 },
  hiddenChart: { position: "absolute", top: Dimensions.get("window").height + 100, width: screenWidth, height: 260, opacity: 0 }
});

export default Formulario;
