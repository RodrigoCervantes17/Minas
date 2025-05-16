# 📋 App de Inspección de Anclajes Mineros

Aplicación móvil desarrollada con **React Native (Expo)** para capturar y gestionar información técnica de pruebas de anclaje en entornos mineros.

## 🚀 Funcionalidades Principales

- Registro de datos técnicos de pruebas de anclaje.
- Captura de fotografías con observaciones y recomendaciones.
- Generación automática de un PDF con toda la información y gráfico de resistencias.
- Almacenamiento temporal de los datos en el estado de la app.
- Interfaz dividida en dos pasos para facilitar el llenado.

## 📷 Capturas
> *(Agrega aquí tus screenshots de la app en uso: formulario, gráfico, PDF generado, etc.)*

## 🧱 Tecnologías Usadas

| Herramienta                 | Propósito                          |
|----------------------------|------------------------------------|
| Expo SDK 52                | Framework base para React Native   |
| React Native Paper         | UI moderna y adaptable             |
| Expo Camera & Image Picker| Captura de imágenes                |
| React Native Chart Kit     | Gráfico de barras de resistencias  |
| React Native View Shot     | Captura de componentes para PDF    |
| Expo File System & Sharing | Lectura y exportación de archivos  |

## 📁 Estructura de Carpetas

```
/components
  ├── Formulario.tsx
  ├── GraficoResistencias.tsx
  ├── photoUploader.tsx
/hooks
  └── useCamera.ts
/services
  └── pdfService.ts
/utils
  └── formUtils.ts
/types
  └── types.ts
```

## 📦 Instalación

```bash
git clone https://github.com/tuusuario/inspeccion-anclajes.git
cd inspeccion-anclajes
npm install
npx expo start
```

## 🧪 Scripts Útiles

```bash
npm run android     # Ejecutar en emulador Android
npm run ios         # Ejecutar en iOS (solo Mac)
npm run web         # Vista web (limitada)
npm run lint        # Lint del proyecto
npm run test        # Tests con Jest (si aplica)
```

## 📄 Generación de PDF

- La app captura un gráfico generado dinámicamente.
- El PDF incluye:
  - Datos técnicos
  - Observaciones y fotos
  - Gráfico de resistencia por prueba
  - Fecha y recomendaciones

## ✅ Requisitos

- Node.js 18+
- Expo CLI instalado globalmente (`npm install -g expo-cli`)
- Dispositivo o emulador Android/iOS con cámara funcional

## ✍️ Autores

- **Rodrigo Cervantes**
- Desarrollo móvil

---

## 🧠 Ideas Futuras y Propuestas de Mejora

### UX/UI
- ✅ Agregar indicadores visuales de validación en campos obligatorios
- ✅ Barra de progreso entre pasos del formulario
- ⏳ Reemplazar Alert por Snackbar con `react-native-paper`

### Funcionalidad
- 🔜 Agregar selector de fecha con `@react-native-community/datetimepicker`
- 🔒 Añadir firma digital del técnico usando `react-native-signature-canvas`
- 📍 Registrar ubicación GPS con `expo-location`
- 🗃 Almacenamiento local persistente con `expo-sqlite` o `AsyncStorage`

### Integración
- ☁ Subida de datos y fotos a Firebase o API REST
- 🛠 Backoffice web con dashboards de pruebas y generación histórica
- 📡 Soporte offline con sincronización posterior

---

## 📃 Licencia

MIT License
