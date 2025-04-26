// src/utils/formUtils.ts
import { FormData } from "../../types/types";

export const validateForm = (formData: FormData): boolean => {
  const requiredFields: (keyof FormData)[] = ["tecnico", "unidadMinera", "emina", "tipoAncla"];
  return requiredFields.every(field => !!formData[field]);
};  