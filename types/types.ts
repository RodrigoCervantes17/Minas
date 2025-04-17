// Definición de los datos del formulario
export type FormData = {
    emina: string;
    tecnico: string;
    auxiliar: string;
    ubicacionPrueba: string;
    calidadRoca: string;
    temperaturaAmbiente: string;
    unidadMinera: string;
    tipoAncla: string;
    largo: string;
    ancho: string;
  };

  export type Campo = {
    id: string;
    label: string;
    key: keyof FormData;
    type: "input" | "select";
    options?: string[];
  };