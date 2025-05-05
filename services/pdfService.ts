// services/pdfService.ts
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { FormData } from '../types/types';

const generateHTML = (data: FormData): string => {
  return `
 <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      margin: 20px;
      color: #333;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .info-table, .pruebas-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    .info-table td, .pruebas-table th, .pruebas-table td {
      padding: 8px;
      border: 1px solid #ddd;
    }

    .pruebas-table th {
      background-color: #f0f0f0;
    }

    .chart {
      width: 100%;
      height: 300px;
      background: #f5f5f5;
      margin: 20px 0;
      padding: 10px;
      box-sizing: border-box;
      overflow-x: auto;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      height: 100%;
      gap: 10px;
    }

    .bar-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 40px;
    }

    .chart-bar {
      background: #D14836;
      width: 100%;
      position: relative;
      border-radius: 5px 5px 0 0;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      color: white;
      font-size: 12px;
      transition: height 0.3s ease;
    }

    .bar-value {
      margin-bottom: 4px;
    }

    .bar-label {
      margin-top: 5px;
      font-size: 12px;
    }

    .foto-container {
      margin: 15px 0;
      page-break-inside: avoid;
    }

    .foto {
      max-width: 100%;
      max-height: 300px;
    }

    .firma {
      margin-top: 50px;
      width: 45%;
      display: inline-block;
    }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>REPORTE TÉCNICO DE ANCLAJE</h1>
    <h3>${data.unidadMinera}</h3>
  </div>

  <table class="info-table">
    <tr>
      <td><strong>E.Mina:</strong></td>
      <td>${data.emina}</td>
      <td><strong>Técnico:</strong></td>
      <td>${data.tecnico}</td>
    </tr>
    <tr>
      <td><strong>Ubicación:</strong></td>
      <td>${data.ubicacionPrueba}</td>
      <td><strong>Fecha:</strong></td>
      <td>${data.fechaDescenso}</td>
    </tr>
    <tr>
      <td><strong>Tipo Ancla:</strong></td>
      <td>${data.tipoAncla}</td>
      <td><strong>Largo:</strong></td>
      <td>${data.largo}</td>
    </tr>
    <tr>
      <td><strong>Diámetro:</strong></td>
      <td>${data.diametro}</td>
      <td><strong>Calidad Roca:</strong></td>
      <td>${data.calidadRoca}</td>
    </tr>
  </table>

  <h3>PRUEBAS DE RESISTENCIA</h3>
  <table class="pruebas-table">
    <thead>
      <tr>
        <th>#PRUEBA</th>
        <th>TIPO ANCLA</th>
        <th>LONGITUD</th>
        <th>DIÁMETRO</th>
        <th>RESISTENCIA (ton)</th>
        <th>OBSERVACIONES</th>
      </tr>
    </thead>
    <tbody>
      ${data.pruebas.map(p => `
        <tr>
          <td>${p.id}</td>
          <td>${data.tipoAncla}</td>
          <td>${data.largo}</td>
          <td>${data.diametro}</td>
          <td>${p.resistencia}</td>
          <td>${p.observaciones}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h3>GRÁFICA DE RESISTENCIAS</h3>
<div class="chart">
  <div class="chart-bars">
    ${(() => {
      const resistencias = data.pruebas.map(p => Number(p.resistencia) || 0);
      const maxResistencia = Math.max(...resistencias, 1); // Evitar división entre 0
      return data.pruebas.map(p => {
        const resistencia = Number(p.resistencia) || 0;
        const height = `${(resistencia / maxResistencia) * 100}%`;
        return `
          <div class="bar-wrapper">
            <div class="chart-bar" style="height: ${height};">
              <div class="bar-value">${resistencia.toFixed(1)}t</div>
            </div>
            <div class="bar-label">P${p.id}</div>
          </div>
        `;
      }).join('');
    })()}
  </div>
</div>

  ${data.fotos.length > 0 ? `
    <h3>FOTOS DE INSPECCIÓN</h3>
    ${data.fotos.map(foto => `
      <div class="foto-container">
        <img class="foto" src="data:image/jpeg;base64,${foto.base64}" />
        <p><strong>Observaciones:</strong> ${foto.observaciones || 'Ninguna'}</p>
      </div>
    `).join('')}
  ` : ''}

  <h3>RECOMENDACIONES GENERALES</h3>
  <p>${data.recomendaciones || 'Ninguna'}</p>

  <div style="width: 100%; margin-top: 50px;">
    <div class="firma">
      <p>_________________________</p>
      <p><strong>Técnico Responsable</strong></p>
      <p>${data.tecnico}</p>
    </div>
    <div class="firma" style="float: right;">
      <p>_________________________</p>
      <p><strong>Supervisor</strong></p>
    </div>
  </div>
</body>
</html>
  `;
};

export const createPDF = async (data: FormData): Promise<string> => {
  try {
    const html = generateHTML(data);
    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};

export const sharePDF = async (fileUri: string): Promise<void> => {
  if (!(await Sharing.isAvailableAsync())) {
    Alert.alert("Error", "La función de compartir no está disponible en tu dispositivo");
    return;
  }
  
  try {
    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error('Sharing Error:', error);
    Alert.alert("Error", "No se pudo compartir el PDF");
  }
};