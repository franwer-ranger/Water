# Cómo actualizar los datos de fuentes

> **La actualización ahora es automática.** El workflow
> [`update-data.yml`](../.github/workflows/update-data.yml) se ejecuta a diario a
> las 05:00 UTC (también se puede lanzar a mano desde la pestaña *Actions* de
> GitHub, vía `workflow_dispatch`), descarga el CSV oficial, regenera
> `public/data/fuentes.geojson` y, si hay cambios, hace commit y dispara el
> despliegue en GitHub Pages. El script que hace el trabajo es
> [`scripts/update-data.mjs`](./update-data.mjs) (Node 22, sin dependencias).
>
> Uso local:
>
> ```sh
> node scripts/update-data.mjs                        # descarga el CSV oficial y actualiza public/data/fuentes.geojson
> node scripts/update-data.mjs --input fichero.csv     # usa un CSV local en vez de descargarlo (útil para depurar)
> node scripts/update-data.mjs --min 100               # baja el umbral de la salvaguarda anti-CSV-roto (solo pruebas)
> ```
>
> El resto de este documento describe el procedimiento **manual** y sirve
> sobre todo como referencia del formato de origen y de salida.

Los datos provienen del conjunto de datos abierto **"Fuentes de agua para beber"**
del Ayuntamiento de Madrid:

- Ficha del dataset: https://datos.madrid.es/dataset/300051-0-fuentes
- CSV oficial: https://datos.madrid.es/egob/catalogo/300051-13-fuentes.csv
- Licencia: datos abiertos del Ayuntamiento de Madrid (atribución requerida).
- Actualización en origen: diaria.

El fichero `public/data/fuentes.geojson` incluido en el repo es una versión **recortada y
reproyectada a WGS84 (EPSG:4326)** de ese dataset, conservando solo las propiedades
útiles para el mapa: `id`, `estado`, `distrito`, `barrio`, `direccion`.

## Procedimiento de actualización

1. Descargar el CSV oficial (columnas relevantes: `LATITUD`, `LONGITUD`,
   `ESTADO`, `DISTRITO`, `BARRIO`, `TIPO_VIA`, `NOM_VIA`, `NUM_VIA`,
   `DESC_CLASIFICACION`).

   > ⚠️ El CSV trae también coordenadas en UTM ETRS89 zona 30N (EPSG:25830) en
   > `COORD_GIS_X` / `COORD_GIS_Y`. Si solo dispones de UTM, reproyecta a
   > EPSG:4326 (lon/lat) con `ogr2ogr` o `proj4`. Las columnas `LATITUD`/`LONGITUD`
   > ya vienen en WGS84 y son las que usamos.

2. Filtrar a `DESC_CLASIFICACION == "Fuentes de beber"` (fuentes para personas).

3. Generar el GeoJSON recortado con propiedades: `id`, `estado`, `distrito`,
   `barrio`, `direccion` (compuesta como `TIPO_VIA NOM_VIA, NUM_VIA`) y geometría
   `Point [lon, lat]`.

4. Guardar como `public/data/fuentes.geojson` (sin indentar, para minimizar tamaño).

El estado (`estado`) puede ser `OPERATIVO`, `CERRADA_TEMPORALMENT`,
`FUERA_DE_SERVICIO`, `NO_OPERATIVO` o `NO_PREPARADO`; el mapa los agrupa en
operativa (verde), cerrada temporalmente (naranja) y fuera de servicio (rojo).
