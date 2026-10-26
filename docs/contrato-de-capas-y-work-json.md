# Contrato de capas visuales y work.json

**Estado:** borrador inicial para revisión; no es aprobación de implementación. Los valores de ejemplo son provisionales.

## Principios visuales
- Obra: `Mountains That Breathe`; lienzo de referencia 3840×2160, 16:9.
- Origen (0,0) en la esquina superior izquierda; X crece a la derecha, Y hacia abajo.
- Preferir PNG RGBA de lienzo completo 3840×2160 para alinear sin ajustes manuales. Si se optimiza mediante recorte, declarar su rectángulo dentro del lienzo maestro y conservar coordenadas globales.
- Transparencia alfa real; no usar fondo negro/blanco falso.
- Componer de fondo a frente mediante `zIndex`; el marco completo va arriba y permanece fijo.
- La maestra se conserva intacta. No añadir elementos ausentes en la referencia aprobada.
- Reconstruir el fondo detrás de elementos móviles. Si no puede reconstruirse fielmente, limitar el movimiento o mantener el elemento fijo.
- Estado del recurso: `provisional`, `en_revision` o `aprobado`.

## Campos por capa
- `id`: identificador estable, minúsculas con guiones.
- `name`: nombre legible.
- `file`: ruta relativa al directorio de la obra.
- `status`: estado de revisión.
- `canvas`: ancho y alto de origen.
- `placement`: rectángulo en coordenadas del lienzo maestro.
- `zIndex`: orden de composición; mayor significa más al frente.
- `motion`: tipo, amplitud en píxeles del lienzo maestro, velocidad en ciclos/segundo, fase en radianes, profundidad, banda de audio y cantidad de respuesta.
- `safeBounds`: límites conservadores de desplazamiento en píxeles X/Y; cero significa que no se ha autorizado movimiento.
- `notes`: detalles de reconstrucción, bordes y restricciones.

Tipos iniciales propuestos: `none`, `sway`, `float`, `parallax`, `mist-drift`, `water-flow`, `audio-pulse`. Si un tipo no está implementado, el motor debe tratarlo como `none` en vez de fallar.

## Ejemplo provisional de work.json
```json
{
  "schemaVersion": 1,
  "id": "mountains-that-breathe",
  "title": "Mountains That Breathe",
  "status": "prototype",
  "canvas": { "width": 3840, "height": 2160, "aspectRatio": "16:9" },
  "frame": { "layerId": "frame", "fixed": true },
  "audio": {
    "src": "audio/mountains-that-breathe.wav",
    "status": "provisional",
    "analysis": {
      "mode": "realtime-with-precomputed-fallback",
      "precomputedSrc": null,
      "smoothing": 0.82
    }
  },
  "layers": [
    {
      "id": "sky",
      "name": "Cielo (marcador)",
      "file": "layers/sky.png",
      "status": "provisional",
      "canvas": { "width": 3840, "height": 2160 },
      "placement": { "x": 0, "y": 0, "width": 3840, "height": 2160 },
      "zIndex": 10,
      "motion": { "type": "none", "amplitudePx": 0, "speedHz": 0, "phaseRad": 0, "depth": 0, "audioBand": "none", "audioAmount": 0 },
      "safeBounds": { "xPx": 0, "yPx": 0 },
      "notes": "Ejemplo de esquema; no es una capa artística final."
    },
    {
      "id": "frame",
      "name": "Marco ornamental fijo (marcador)",
      "file": "layers/frame.png",
      "status": "provisional",
      "canvas": { "width": 3840, "height": 2160 },
      "placement": { "x": 0, "y": 0, "width": 3840, "height": 2160 },
      "zIndex": 1000,
      "motion": { "type": "none", "amplitudePx": 0, "speedHz": 0, "phaseRad": 0, "depth": 0, "audioBand": "none", "audioAmount": 0 },
      "safeBounds": { "xPx": 0, "yPx": 0 },
      "notes": "Debe permanecer completo e inmóvil."
    }
  ],
  "render": { "internalResolution": "adaptive", "backgroundColor": "#101820", "preload": "on-demand" }
}
```

El ejemplo no afirma que existan los archivos citados. Deben sustituirse por recursos reales o marcadores de demostración identificados.

## Entrega de cada capa
1. PNG RGBA sin pérdida.
2. Vista previa sobre fondo claro y oscuro.
3. Metadatos de posición, zIndex, estado, movimiento propuesto y límites seguros.
4. Notas sobre áreas reconstruidas, bordes delicados y restricciones de movimiento.
5. Comparación de la composición montada contra la maestra, lado a lado o superpuesta, con diferencias pendientes.
6. Verificación de dimensiones, perfil de color y alfa real.

## Calidad y rendimiento
- El motor puede escalar la resolución interna sin modificar destructivamente los archivos fuente.
- No es obligatorio mantener todas las capas decodificadas a tamaño completo; medir memoria y rendimiento.
- `safeBounds` debe ser conservador y validarse en movimiento. Si vale cero, no animar esa capa.
- La respuesta musical debe ser sutil y configurable; no mover todas las capas simultáneamente.
- Ningún recurso se marca `aprobado` sin revisión visual explícita del usuario.
