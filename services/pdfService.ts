// === PDFSERVICE.TS ===

import * as Print from "expo-print";
import { FormData } from "../types/types";
import { shareAsync } from "expo-sharing";
import { manipulateAsync } from "expo-image-manipulator";

export async function createPDF(formData: FormData, chartBase64?: string): Promise<string> {
  const pruebasHTML = formData.pruebas.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${formData.tipoAncla}</td>
      <td>${formData.largo}</td>
      <td>${formData.diametro}</td>
      <td>${p.resistencia}</td>
      <td>${p.observaciones}</td>
    </tr>`).join('');

  const fotosHTML = formData.fotos.map(foto => `
    <div class="foto">
      <img src="data:image/jpeg;base64,${foto.base64}" />
      <p><strong>Observaciones:</strong> ${foto.observaciones}</p>
    </div>`).join('');

  const graficoHTML = chartBase64 ? `
    <h3>RESISTENCIA</h3>
    <img class="grafico" src="data:image/png;base64,${chartBase64}" />
  ` : '';

  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            color: #000;
          }
          h1 {
            text-align: center;
            margin-bottom: 24px;
            font-size: 22px;
            text-transform: uppercase;
          }
          .header-table, .prueba-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          .header-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            font-size: 12px;
          }
          .prueba-table th, .prueba-table td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
            font-size: 12px;
          }
          .prueba-table th {
            background-color: #eee;
          }
          .foto img, .grafico {
            width: 100%;
            max-width: none;
            border: 1px solid #ccc;
            margin: 0 auto;
          }
          .section {
            margin-top: 24px;
          }
          .section h3 {
            margin-bottom: 8px;
            font-size: 16px;
            border-bottom: 1px solid #000;
          }
        </style>
      </head>
      <body>
        <h1>REPORTE TECNICO GIZ</h1>

        <table class="header-table">
          <tr><td><strong>E. MINA</strong></td><td>${formData.emina}</td><td><strong>UNIDAD MINERA</strong></td><td>${formData.unidadMinera}</td></tr>
          <tr><td><strong>TECNICO</strong></td><td>${formData.tecnico}</td><td><strong>FECHA DE DESCENSO</strong></td><td>${formData.fechaDescenso}</td></tr>
          <tr><td><strong>AUXILIAR</strong></td><td>${formData.auxiliar}</td><td><strong>TIPO DE ANCLA</strong></td><td>${formData.tipoAncla}</td></tr>
          <tr><td><strong>UBICACION DE PRUEBA</strong></td><td>${formData.ubicacionPrueba}</td><td><strong>LARGO</strong></td><td>${formData.largo}</td></tr>
          <tr><td><strong>CALIDAD DE LA ROCA</strong></td><td>${formData.calidadRoca}</td><td><strong>DIAMETRO</strong></td><td>${formData.diametro}</td></tr>
          <tr><td><strong>EQUIPO DE BARRENACION</strong></td><td>${formData.equipoBarrenacion}</td><td><strong>BROCA USADA</strong></td><td>${formData.brocaUsada}</td></tr>
          <tr><td><strong>TEMP. AMBIENTE</strong></td><td>${formData.temperaturaAmbiente} °C</td><td><strong>TEMP. DEL AGUA</strong></td><td>${formData.tempAgua} °C</td></tr>
        </table>

        <h3>PRUEBAS</h3>
        <table class="prueba-table">
          <thead>
            <tr>
              <th>#PRUEBA</th>
              <th>ANCLA</th>
              <th>LONGITUD</th>
              <th>DIAMETRO</th>
              <th>RESISTENCIA</th>
              <th>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            ${pruebasHTML}
          </tbody>
        </table>

        ${graficoHTML}

        <div class="section">
          <h3>RECOMENDACIONES GENERALES</h3>
          <p>${formData.recomendaciones}</p>
        </div>

        <div class="section">
          <h3>FOTOS</h3>
          ${fotosHTML || '<p>No se registraron fotos.</p>'}
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function sharePDF(uri: string) {
  await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
}
