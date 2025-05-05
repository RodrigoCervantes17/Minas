// types/types.ts
export type OpcionesAnclas = {
  [key: string]: {
    largos: string[];
    diametros: string[];
  };
};

export interface PruebaAnclaje {
  id: number;
  resistencia: string;
  observaciones: string;
}

export interface FotoInspeccion {
  uri: string;
  base64: string;
  observaciones: string;
}

export interface FormData {
  emina: string;
  tecnico: string;
  auxiliar: string;
  ubicacionPrueba: string;
  calidadRoca: string;
  equipoBarrenacion: string;
  temperaturaAmbiente: string;
  unidadMinera: string;
  fechaDescenso: string;
  tipoAncla: string;
  largo: string;
  diametro: string;
  brocaUsada: string;
  tempAgua: string;
  pruebas: PruebaAnclaje[];
  fotos: FotoInspeccion[];
  recomendaciones: string;
}