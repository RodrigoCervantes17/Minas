// Modificado pdfService.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { FormData } from '../types/types';

// Genera el contenido HTML del PDF
const generateHTML = (data: FormData) => {
  return `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Reporte de Minería</title>
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        color: #333;
        line-height: 1.6;
        margin: 0;
        padding: 0;
      }

      .container {
        width: 100%;
        padding: 20px 40px;
      }

      .header {
        background-color: #003366;
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }

      .logo {
        font-size: 24px;
        font-weight: bold;
      }

      .report-title {
        font-size: 22px;
        text-align: center;
        margin-bottom: 5px;
      }

      .report-subtitle {
        font-size: 16px;
        text-align: center;
        color: #666;
        margin-bottom: 30px;
      }

      .section {
        margin-bottom: 35px;
        padding-bottom: 20px;
        page-break-inside: avoid;
      }

      .section-title {
        font-size: 18px;
        color: #003366;
        margin-bottom: 15px;
        font-weight: bold;
        border-bottom: 2px solid #003366;
        padding-bottom: 5px;
      }

      .data-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px 40px;
      }

      .data-item {
        margin-bottom: 10px;
      }

      .data-label {
        font-weight: bold;
        color: #555;
      }

      .data-value {
        padding: 5px 0;
      }

      .footer {
        margin-top: 40px;
        padding-top: 10px;
        border-top: 1px solid #ddd;
        font-size: 12px;
        color: #777;
        text-align: center;
      }

      .signature-area {
        margin-top: 50px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
      }

      .signature {
        border-top: 1px solid #333;
        padding-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">REPORTE TÉCNICO MINERO</div>
        <div class="date">${getCurrentDate()}</div>
      </div>

      <div class="report-title">Informe de Inspección de Campo</div>
      <div class="report-subtitle">Unidad Minera: ${data.unidadMinera}</div>

      <div class="section">
        <div class="section-title">1. Información General</div>
        <div class="data-grid">
          <div class="data-item">
            <div class="data-label">E.Mina:</div>
            <div class="data-value">${data.emina}</div>
          </div>
          <div class="data-item">
            <div class="data-label">Unidad Minera:</div>
            <div class="data-value">${data.unidadMinera}</div>
          </div>
          <div class="data-item">
            <div class="data-label">Ubicación de prueba:</div>
            <div class="data-value">${data.ubicacionPrueba}</div>
          </div>
          <div class="data-item">
            <div class="data-label">Fecha de inspección:</div>
            <div class="data-value">${getCurrentDate()}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">2. Condiciones Técnicas</div>
        <div class="data-grid">
          <div class="data-item">
            <div class="data-label">Calidad de Roca:</div>
            <div class="data-value">${data.calidadRoca}</div>
          </div>
          <div class="data-item">
            <div class="data-label">Temperatura ambiente:</div>
            <div class="data-value">${data.temperaturaAmbiente}°C</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">3. Personal Técnico</div>
        <div class="data-grid">
          <div class="data-item">
            <div class="data-label">Técnico responsable:</div>
            <div class="data-value">${data.tecnico}</div>
          </div>
          <div class="data-item">
            <div class="data-label">Auxiliar técnico:</div>
            <div class="data-value">${data.auxiliar}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">4. Especificaciones de Anclaje</div>
        <div class="data-grid">
          <div class="data-item">
            <div class="data-label">Tipo de Ancla:</div>
            <div class="data-value">${data.tipoAncla}</div>
          </div>
          <div class="data-item">
            <div class="data-label">Largo:</div>
            <div class="data-value">${data.largo}</div>
          </div>
          <div class="data-item">
            <div class="data-label">Ancho:</div>
            <div class="data-value">${data.ancho}</div>
          </div>
        </div>
      </div>

      <div class="signature-area">
        <div class="signature">
          <div>_________________________</div>
          <div>Firma del Técnico</div>
          <div>${data.tecnico}</div>
        </div>
        <div class="signature">
          <div>_________________________</div>
          <div>Vo.Bo. Supervisor</div>
          <div></div>
        </div>
      </div>

      <div class="footer">
        <p>Este documento es un reporte oficial de inspección minera. Generado el ${getCurrentDate()}.</p>
        <p>© ${new Date().getFullYear()} - Sistema de Reportes Mineros</p>
      </div>
    </div>
  </body>
</html>
  `;
};

// Función principal para crear y guardar el PDF
export const createPDF = async (formData: FormData) => {
  try {
    const html = generateHTML(formData);
    const { uri } = await Print.printToFileAsync({ html });
    return { filePath: uri };
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw error;
  }
};

// Compartir el PDF generado
export const sharePDF = async (filePath: string) => {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath);
    }
  } catch (error) {
    console.error('Error al compartir el PDF:', error);
    throw error;
  }
};



function getCurrentDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}