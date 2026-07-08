#!/usr/bin/env node
// Actualiza data/fuentes.geojson descargando el CSV abierto de fuentes de
// agua potable del Ayuntamiento de Madrid y transformándolo al formato
// recortado que usa el mapa. Ver scripts/fetch-data.md para el procedimiento
// manual equivalente y el detalle del formato.
//
// Uso:
//   node scripts/update-data.mjs
//   node scripts/update-data.mjs --input fichero.csv   (usa un CSV local en vez de descargarlo)
//   node scripts/update-data.mjs --min 100              (baja el umbral de la salvaguarda, solo para pruebas)

import { writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CSV_URL = 'https://datos.madrid.es/egob/catalogo/300051-13-fuentes.csv';
const CLASIFICACION_OBJETIVO = 'fuentes de beber';
const MIN_FEATURES_DEFAULT = 500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'fuentes.geojson');

// --- Utilidades ---------------------------------------------------------

/** Quita acentos y pasa a minúsculas para comparaciones robustas. */
function normalizar(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Decodifica un Buffer probando UTF-8 estricto y, si falla o produce
 * caracteres de reemplazo, cae a windows-1252 (habitual en el CSV oficial).
 */
function decodificarBuffer(buffer) {
  try {
    const texto = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    if (!texto.includes('�')) return texto;
  } catch {
    // sigue abajo con windows-1252
  }
  return new TextDecoder('windows-1252').decode(buffer);
}

/**
 * Parser CSV propio: soporta separador configurable, campos entrecomillados
 * (con separadores y saltos de línea dentro), comillas escapadas ("") y
 * finales de línea CRLF o LF. Devuelve un array de arrays de strings.
 */
function parseCSV(texto, separador) {
  const filas = [];
  let fila = [];
  let campo = '';
  let dentroComillas = false;
  const len = texto.length;

  for (let i = 0; i < len; i++) {
    const c = texto[i];

    if (dentroComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          dentroComillas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') {
      dentroComillas = true;
    } else if (c === separador) {
      fila.push(campo);
      campo = '';
    } else if (c === '\r') {
      // se ignora; el \n que sigue cierra la fila
    } else if (c === '\n') {
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else {
      campo += c;
    }
  }
  // última fila sin salto final
  if (campo !== '' || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }

  return filas.filter((f) => !(f.length === 1 && f[0] === ''));
}

/** Detecta el separador (';' o ',') mirando la primera línea de cabecera. */
function detectarSeparador(texto) {
  const primeraLinea = texto.slice(0, texto.indexOf('\n') === -1 ? texto.length : texto.indexOf('\n'));
  const puntoYComa = (primeraLinea.match(/;/g) || []).length;
  const coma = (primeraLinea.match(/,/g) || []).length;
  return puntoYComa >= coma ? ';' : ',';
}

/** Quita BOM y espacios de una cabecera de columna para comparar de forma tolerante. */
function limpiarCabecera(s) {
  return String(s ?? '')
    .replace(/^﻿/, '')
    .trim();
}

/** Busca el índice de una columna por nombre exacto (tolerante a mayúsculas/espacios/BOM). */
function indiceColumna(cabeceras, nombre) {
  const objetivo = normalizar(nombre);
  return cabeceras.findIndex((h) => normalizar(limpiarCabecera(h)) === objetivo);
}

/** Convierte un string numérico (con coma o punto decimal) a float. */
function aFloat(s) {
  if (s == null) return NaN;
  const limpio = String(s).trim().replace(',', '.');
  if (limpio === '') return NaN;
  return parseFloat(limpio);
}

// --- Descarga / lectura -------------------------------------------------

async function obtenerCSVTexto(inputPath) {
  if (inputPath) {
    const buffer = readFileSync(inputPath);
    return decodificarBuffer(buffer);
  }

  const respuesta = await fetch(CSV_URL, {
    redirect: 'follow',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/csv,*/*',
    },
  });

  if (!respuesta.ok) {
    throw new Error(`Descarga fallida: ${respuesta.status} ${respuesta.statusText}`);
  }

  const buffer = Buffer.from(await respuesta.arrayBuffer());
  return decodificarBuffer(buffer);
}

// --- Transformación -------------------------------------------------------

function construirDireccion(tipoVia, nomVia, numVia) {
  const tipo = String(tipoVia ?? '').trim();
  const nom = String(nomVia ?? '').trim();
  const num = String(numVia ?? '').trim();

  const via = [tipo, nom].filter(Boolean).join(' ');
  // Si no hay ni tipo ni nombre de vía, no hay dirección (como en el dataset
  // original, donde ~68 fuentes no tienen vía asociada).
  if (via === '') return null;
  if (num === '') return via;
  return `${via}, ${num}`;
}

function transformar(filas, minFeatures) {
  if (filas.length === 0) {
    throw new Error('El CSV está vacío.');
  }

  const cabeceras = filas[0].map(limpiarCabecera);

  const idxLat = indiceColumna(cabeceras, 'LATITUD');
  const idxLon = indiceColumna(cabeceras, 'LONGITUD');
  const idxEstado = indiceColumna(cabeceras, 'ESTADO');
  const idxDistrito = indiceColumna(cabeceras, 'DISTRITO');
  const idxBarrio = indiceColumna(cabeceras, 'BARRIO');
  const idxTipoVia = indiceColumna(cabeceras, 'TIPO_VIA');
  const idxNomVia = indiceColumna(cabeceras, 'NOM_VIA');
  const idxNumVia = indiceColumna(cabeceras, 'NUM_VIA');
  const idxClasificacion = indiceColumna(cabeceras, 'DESC_CLASIFICACION');

  // Columna de id: la primera cuyo nombre contenga "ID" o "CODIGO".
  const idxId = cabeceras.findIndex((h) => {
    const n = normalizar(h);
    return n.includes('id') || n.includes('codigo');
  });

  const columnasRequeridas = {
    LATITUD: idxLat,
    LONGITUD: idxLon,
    ESTADO: idxEstado,
    DISTRITO: idxDistrito,
    BARRIO: idxBarrio,
    TIPO_VIA: idxTipoVia,
    NOM_VIA: idxNomVia,
    NUM_VIA: idxNumVia,
    DESC_CLASIFICACION: idxClasificacion,
    'ID/CODIGO': idxId,
  };
  for (const [nombre, idx] of Object.entries(columnasRequeridas)) {
    if (idx === -1) {
      throw new Error(`No se encontró la columna requerida: ${nombre} (cabeceras: ${cabeceras.join(', ')})`);
    }
  }

  const clasificacionObjetivoNorm = normalizar(CLASIFICACION_OBJETIVO);
  const features = [];
  const contadorEstados = {};

  for (let i = 1; i < filas.length; i++) {
    const fila = filas[i];
    if (fila.length === 1 && fila[0].trim() === '') continue; // línea vacía

    const clasificacion = normalizar(fila[idxClasificacion]);
    if (clasificacion !== clasificacionObjetivoNorm) continue;

    const lat = aFloat(fila[idxLat]);
    const lon = aFloat(fila[idxLon]);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < 39.5 ||
      lat > 41.5 ||
      lon < -4.5 ||
      lon > -3.0
    ) {
      continue;
    }

    const rawId = (fila[idxId] ?? '').trim();
    const idNumerico = Number(rawId);
    const id = rawId !== '' && Number.isFinite(idNumerico) && /^-?\d+(\.\d+)?$/.test(rawId) ? idNumerico : rawId;

    const estado = String(fila[idxEstado] ?? '').trim();
    const distrito = String(fila[idxDistrito] ?? '').trim();
    const barrio = String(fila[idxBarrio] ?? '').trim();
    const direccion = construirDireccion(fila[idxTipoVia], fila[idxNomVia], fila[idxNumVia]);

    contadorEstados[estado] = (contadorEstados[estado] ?? 0) + 1;

    features.push({
      type: 'Feature',
      properties: { id, estado, distrito, barrio, direccion },
      geometry: {
        type: 'Point',
        coordinates: [Number(lon.toFixed(6)), Number(lat.toFixed(6))],
      },
    });
  }

  if (features.length < minFeatures) {
    throw new Error(
      `Salvaguarda: solo se obtuvieron ${features.length} features (mínimo esperado ${minFeatures}). ` +
        'Puede que el CSV de origen esté roto o haya cambiado de formato. No se ha escrito el fichero.',
    );
  }

  return { features, contadorEstados };
}

function construirGeoJSON(features) {
  return {
    type: 'FeatureCollection',
    name: 'fuentes_agua_potable_madrid',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features,
  };
}

// --- CLI ------------------------------------------------------------------

function parseArgs(argv) {
  const args = { input: null, min: MIN_FEATURES_DEFAULT };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--input') {
      args.input = argv[++i];
    } else if (argv[i] === '--min') {
      args.min = Number(argv[++i]);
    }
  }
  return args;
}

async function main() {
  const { input, min } = parseArgs(process.argv.slice(2));

  console.log(input ? `Leyendo CSV local: ${input}` : `Descargando CSV: ${CSV_URL}`);
  const texto = await obtenerCSVTexto(input);

  const separador = detectarSeparador(texto);
  console.log(`Separador detectado: "${separador}"`);

  const filas = parseCSV(texto, separador);
  console.log(`Filas leídas (incl. cabecera): ${filas.length}`);

  const { features, contadorEstados } = transformar(filas, min);

  const geojson = construirGeoJSON(features);
  await writeFile(OUTPUT_PATH, JSON.stringify(geojson));

  console.log('--- Resumen ---');
  console.log(`Total features: ${features.length}`);
  for (const [estado, n] of Object.entries(contadorEstados).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${estado}: ${n}`);
  }
  console.log(`Escrito: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
