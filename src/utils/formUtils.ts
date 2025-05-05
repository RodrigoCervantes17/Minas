// utils/formUtils.ts
import { FormData } from "../../types/types";

export const validateForm = (formData: FormData): boolean => {
  const requiredFields: (keyof FormData)[] = [
    "emina", 
    "tecnico", 
    "ubicacionPrueba", 
    "unidadMinera", 
    "tipoAncla",
    "largo",
    "diametro"
  ];
  
  // Verificar que al menos una prueba tenga resistencia
  const hasResistance = formData.pruebas.some(p => p.resistencia.trim() !== "");
  
  return requiredFields.every(field => !!formData[field]) && hasResistance;
};