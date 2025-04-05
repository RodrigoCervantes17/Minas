// googleDriveService.ts
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Para Android es necesario registrar el método que manejará los redireccionamientos
if (Platform.OS === 'android') {
  WebBrowser.maybeCompleteAuthSession();
}

// Configuración de Google OAuth
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

// Configura tu cliente de OAuth en Google Cloud Console y obtén tu CLIENT_ID
const CLIENT_ID = '371566310500-655vl62bs9qsh257duvrtht2uim9gpom.apps.googleusercontent.com';
// Usar makeRedirectUri sin el parámetro useProxy que está causando problemas
const REDIRECT_URI = AuthSession.makeRedirectUri();

export const useGoogleDrive = () => {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scopes: ['https://auth.expo.io/@rodbabas-expo/minas', 'https://www.googleapis.com/auth/drive.file'],
      responseType: 'token',
    },
    discovery
  );

  const getAccessToken = async () => {
    // Opciones para promptAsync dependen de la versión, usamos un objeto vacío 
    // para evitar errores de tipado
    const result = await promptAsync({});
    if (result.type === 'success') {
      return result.params.access_token;
    }
    return null;
  };

  const uploadJsonFile = async (jsonData: any, fileName?: string) => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('No se pudo obtener el token de acceso');
    }

    // Crear un archivo temporal con los datos
    const fileContent = JSON.stringify(jsonData, null, 2);
    const name = fileName || `formulario_${new Date().toISOString().slice(0, 10)}.json`;
    
    // Configurar los metadatos del archivo
    const metadata = {
      name,
      mimeType: 'application/json',
    };
    
    // Primera petición: crear el archivo con sus metadatos
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));
    
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        fileId: responseData.id,
        fileName: name
      };
    } else {
      throw new Error(responseData.error?.message || 'Error al subir el archivo');
    }
  };

  return {
    uploadJsonFile
  };
};