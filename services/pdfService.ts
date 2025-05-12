// src/services/pdfService.ts

import * as Print from "expo-print";
import { FormData, FotoInspeccion } from "../types/types";
import { shareAsync } from "expo-sharing";

export async function createPDF(
  formData: FormData,
  chartBase64?: string
): Promise<string> {
  const {
    emina,
    tecnico,
    auxiliar,
    ubicacionPrueba,
    calidadRoca,
    equipoBarrenacion,
    temperaturaAmbiente,
    unidadMinera,
    fechaDescenso,
    tipoAncla,
    largo,
    diametro,
    brocaUsada,
    tempAgua,
    pruebas,
    fotos,
    recomendaciones
  } = formData;

  // Construir filas de la tabla de pruebas
  const pruebasHTML = pruebas
    .map(
      (p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${tipoAncla}</td>
      <td>${largo}</td>
      <td>${diametro}</td>
      <td>${p.resistencia || "-"}</td>
      <td>${p.observaciones || "-"}</td>
    </tr>`
    )
    .join("");

  // Gráfico ancho completo
  const graficoHTML = chartBase64
    ? `
    <div class="section">
      <h3>RESISTENCIA</h3>
      <div class="grafico-container">
        <img class="grafico" src="data:image/png;base64,${chartBase64}" />
      </div>
    </div>`
    : "";

  // Dividir fotos en páginas de 3
  const photoChunks: FotoInspeccion[][] = [];
  for (let i = 0; i < fotos.length; i += 3) {
    photoChunks.push(fotos.slice(i, i + 3));
  }
  const fotosPagesHTML = photoChunks
    .map((chunk, pageIndex) => {
      const separator = pageIndex > 0 ? `<div class="page-break"></div>` : "";
      const fotosHTML = chunk
        .map(
          f => `
        <div class="foto-section">
          <div class="foto-img">
            <img src="data:image/jpeg;base64,${f.base64}" />
          </div>
          <div class="comentarios">
            <div class="obs">
              <p><strong>Observación Detallada</strong></p>
              <p>${f.observaciones || "-"}</p>
            </div>
            <div class="rec">
              <p><strong>Recomendación Individual</strong></p>
              <p>${f.recomendacionIndividual || "-"}</p>
            </div>
          </div>
        </div>`
        )
        .join("");
      return `
      ${separator}
      <h3>FOTOS DE INSPECCIÓN</h3>
      ${fotosHTML}`;
    })
    .join("");

  // HTML completo
  const html = `
  <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        @page { margin: 24px; }
        html, body { margin:0; padding:0; font-family: Arial, sans-serif; color:#000; }

        h1 { text-align:center; font-size:22px; text-transform:uppercase; margin-bottom:16px; }
        h3 { font-size:16px; margin:16px 0 8px; border-bottom:1px solid #000; padding-bottom:4px; }

        .header-table { width:100%; border-collapse:collapse; margin-bottom:16px; }
        .header-table td { border:1px solid #000; padding:4px 6px; font-size:12px; }

        .prueba-table { width:100%; border-collapse:collapse; margin-bottom:16px; }
        .prueba-table th, .prueba-table td { border:1px solid #000; padding:4px; text-align:center; font-size:12px; }
        .prueba-table th { background:#eee; }

        /* Gráfico ancho completo, altura fija */
        .grafico-container { width:100%; height:200px; overflow:hidden; border:1px solid #ccc; margin-bottom:16px; }
        .grafico-container .grafico { width:100%; height:100%; object-fit:contain; }

        /* Recomendaciones ancho completo SIN CAJA */
        .rec-section { margin-bottom:24px; font-size:12px; line-height:1.3; }
        .rec-section h3 { margin-bottom:8px; }
        .rec-section p { margin:4px 0; }

        /* Foto sección */
        .foto-section { display:flex; width:100%; border:1px solid #000; margin-bottom:16px; height:200px; }
        .foto-img { flex:0 0 200px; border-right:1px solid #000; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .foto-img img { max-width:100%; max-height:100%; }
        .comentarios { flex:1; display:flex; flex-direction:column; }
        .obs, .rec { flex:1; border-bottom:1px solid #000; padding:4px; box-sizing:border-box; }
        .rec { border-bottom:none; }
        .obs p, .rec p { margin:4px 0; font-size:11px; }

        /* Página 1 fijo alto */
        .page1 { display:flex; flex-direction:column; height:100vh; }
        .page1-content { flex:1; }
        .page1-signatures { display:flex; justify-content:space-between; margin-top:auto; }
        .sig-block { width:30%; text-align:center; }
        .sig-block .line { border-top:1px solid #000; margin-top:48px; }

        .page-break { page-break-after: always; }
      </style>
    </head>
    <body>
      <!-- Página 1 -->
      <div class="page1">
        <div class="page1-content">
          <h1>REPORTE TÉCNICO GIZ</h1>
          <table class="header-table">
            <tr><td><strong>E. MINA</strong></td><td>${emina}</td><td><strong>UNIDAD MINERA</strong></td><td>${unidadMinera}</td></tr>
            <tr><td><strong>TÉCNICO</strong></td><td>${tecnico}</td><td><strong>FECHA DE DESCENSO</strong></td><td>${fechaDescenso}</td></tr>
            <tr><td><strong>AUXILIAR</strong></td><td>${auxiliar}</td><td><strong>TIPO DE ANCLA</strong></td><td>${tipoAncla}</td></tr>
            <tr><td><strong>UBICACIÓN DE PRUEBA</strong></td><td>${ubicacionPrueba}</td><td><strong>LARGO</strong></td><td>${largo}</td></tr>
            <tr><td><strong>CALIDAD DE LA ROCA</strong></td><td>${calidadRoca}</td><td><strong>DIÁMETRO</strong></td><td>${diametro}</td></tr>
            <tr><td><strong>EQUIPO DE BARRENACIÓN</strong></td><td>${equipoBarrenacion}</td><td><strong>BROCA USADA</strong></td><td>${brocaUsada}</td></tr>
            <tr><td><strong>TEMP. AMBIENTE</strong></td><td>${temperaturaAmbiente} °C</td><td><strong>TEMP. DEL AGUA</strong></td><td>${tempAgua} °C</td></tr>
          </table>

          <h3>PRUEBAS</h3>
          <table class="prueba-table">
            <thead>
              <tr>
                <th>#PRUEBA</th><th>ANCLA</th><th>LONGITUD</th><th>DIÁMETRO</th><th>RESISTENCIA</th><th>OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody>
              ${pruebasHTML}
            </tbody>
          </table>

          ${graficoHTML}

          <div class="rec-section">
            <h3>RECOMENDACIONES GENERALES</h3>
            <p>${recomendaciones || "-"}</p>
          </div>
        </div>

        <div class="page1-signatures">
          <div class="sig-block"><p>Técnico</p><div class="line">${tecnico}</div></div>
          <div class="sig-block"><p>Supervisor</p><div class="line"></div></div>
          <div class="sig-block"><p>Auxiliar</p><div class="line">${auxiliar}</div></div>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- Páginas de fotos -->
      ${fotosPagesHTML}

      <div class="page-break"></div>

      <!-- Página 3 -->
      <h3>RECOMENDACIONES DEL ANCLAJE</h3>
      <div class="rec-section">
        <p>${recomendaciones || "-"}</p>
      </div>
      <div class="signatures page1-signatures">
        <div class="sig-block"><p>Supervisor</p><div class="line"></div></div>
        <div class="sig-block"><p>Auxiliar</p><div class="line"></div></div>
      </div>
    </body>
  </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function sharePDF(uri: string) {
  await shareAsync(uri, { mimeType: "application/pdf" });
}
