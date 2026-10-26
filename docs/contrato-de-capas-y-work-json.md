# Contrato de capas visuales y work.json — versión 2 (propuesta)

**Estado:** propuesta para revisión del usuario. No está aprobada ni implementada: no existe motor, validador ni capas finales. Sustituye al borrador inicial (que usaba `schemaVersion: 1` solo como ejemplo, nunca consumido por código). El esquema formal es [`works/work.schema.json`](../works/work.schema.json); este documento explica las reglas y el esquema las comprueba en lo que puede expresar. Las reglas entre campos están en [`plan-de-validacion-automatica.md`](plan-de-validacion-automatica.md).

Los números de límites (márgenes, amplitudes, velocidades) son **valores iniciales propuestos**. No se han probado en iPad ni en televisor y solo cambian con aprobación del usuario.

## 1. Principios

- Obra: `Mountains That Breathe`. Lienzo de referencia 3840×2160 (16:9). Origen (0,0) arriba a la izquierda; X crece a la derecha, Y hacia abajo. Todas las coordenadas son enteros en píxeles del lienzo maestro.
- La imagen maestra no se modifica ni se mueve. Se declara en `master` con su `sha256`.
- Componer de fondo a frente por `zIndex`; el marco va siempre arriba y fijo.
- No se añaden elementos que no existan en la maestra aprobada.
- Ningún recurso pasa a `aprobado` sin revisión visual explícita del usuario.

## 2. Coordenadas: siempre medidas sobre la maestra original

1. Toda coordenada (`placement`, `alphaBounds`, `pivot`, `region` de zonas, `frame.visibleWindow`) se **mide de nuevo sobre la imagen maestra original** de este repositorio.
2. Las coordenadas del paquete preliminar v0.1 (documentadas en `auditoria-capas-v0-1.md`) **no se reutilizan, ni siquiera como punto de partida automático**. Una comprobación visual contra la maestra mostró que al menos las del sol y las aves no coinciden con ella (ver esa auditoría).
3. Cada medición queda registrada en un objeto `measurement`: `basis` (siempre `master-original`), `masterSha256` (hash de la maestra usada), `date`, `by` y `method`. Si el hash no coincide con el de `master.sha256`, la medición no es válida.
4. Honestidad sobre el alcance: el hash es una declaración, no una prueba. La protección real es la combinación de ese registro, la comprobación de píxeles (`alphaBounds` contra el PNG real) y la comparación de la composición con la maestra (ver plan de validación).
5. `alphaBounds` es el rectángulo mínimo que contiene todos los píxeles con alfa > 0 de la capa, ya colocada en coordenadas maestras.

## 3. Dimensiones, posición y escala

Cada capa declara `layout`, `size` (píxeles del archivo PNG), `scale`, `placement` (rectángulo que ocupa en el lienzo maestro) y `alphaBounds`.

| | `fullCanvas` | `cropped` |
|---|---|---|
| `size` | exactamente 3840×2160 | tamaño del recorte |
| `placement` | `{0,0,3840,2160}` | rectángulo entero dentro del lienzo |
| `scale` | 1 | 1 por defecto |
| Uso | alineación trivial; preferible para producción inicial y para el marco | optimiza memoria en elementos pequeños (ciervo, aves, sol) |

**Reglas comunes**
- PNG RGBA de 8 bits, alfa real, sin fondo falso. La maestra no tiene perfil de color incrustado (PNG RGB de 8 bits sin sRGB/iCCP/gAMA), así que las capas tampoco deben incluir perfil: se evita que el navegador convierta colores de forma distinta a la maestra.
- `placement.width = size.width × scale` y `placement.height = size.height × scale`, ambos enteros.
- `scale` es uniforme (un solo valor) y vale 1 mientras no se apruebe otra cosa. Se admite ≠ 1 solo si se justifica en `notes` y el usuario lo aprueba; nunca para corregir una medición mal hecha.
- El archivo se guarda en reposo: no se incorporan desplazamientos al PNG. Todo movimiento se aplica en tiempo de ejecución respecto a `placement`.
- Con todos los desplazamientos en cero, la composición debe reproducir la posición de la maestra.

**Reglas de `cropped`**
- `alphaBounds` queda dentro de `placement` con al menos 16 px de margen transparente por lado (propuesto, para el filtrado al dibujar con posiciones fraccionarias), salvo en los lados donde `placement` coincide con el borde del lienzo.
- `placement` nunca se sale del lienzo.
- Si la capa gira o respira, se declara `pivot` en coordenadas maestras. Si es `null`, se usa el centro de `alphaBounds`.

**Costo de memoria (aritmética, no medición en dispositivo):** una capa de 3840×2160 RGBA decodificada ocupa 33 177 600 bytes (≈31,6 MiB). Con 14 capas a lienzo completo serían ≈443 MiB, de ahí el interés de recortar los elementos pequeños. El presupuesto real se fija tras medir en el iPad y el televisor.

## 4. Estados de revisión y aprobación

Un solo vocabulario para capas, zonas de reconstrucción y audio:

| Estado | Significado |
|---|---|
| `pendiente` | Declarado, sin recurso. Puede tener `file`, `placement`, etc. en `null`: no se inventan coordenadas. |
| `provisional` | Borrador, marcador o relleno automático. No sirve para evaluar movimiento final. |
| `en_revision` | Entregado para revisión. |
| `cambios_solicitados` | Revisado; los defectos están registrados y vuelve a producción. |
| `aprobado` | Aprobado explícitamente por el usuario. Exige `approval`. |

- Flujo: `pendiente → provisional → en_revision → (cambios_solicitados ↔ provisional/en_revision) → aprobado`.
- Solo el usuario aprueba. `approval` = `{ by: "usuario", date, evidence, fileSha256 }`; `evidence` apunta a la prueba (mensaje, comentario del PR, imagen de comparación). Las zonas usan la variante sin `fileSha256`; capas y audio sí lo llevan.
- `fileSha256` ata la aprobación a los bytes aprobados. Si el archivo cambia, la aprobación deja de ser válida y el estado vuelve a `en_revision`.
- Un recurso que no está `aprobado` no puede llevar `approval`.
- Estado de la obra (`planificada`, `en_preparacion`, `en_revision`, `aprobada`): `aprobada` solo si todas las capas, zonas y el audio (si existe) están `aprobado`.
- Limitación: el validador comprueba que la aprobación esté registrada y coherente, no puede comprobar que el usuario la dio. Esa garantía es humana.

## 5. Reconstrucción de zonas ocultas

Mover un elemento deja al descubierto lo que había detrás. Cada capa que se pretenda desplazar, girar o escalar declara `reconstruction` con `required: true` y una lista de zonas. Hay dos tipos:

**`behind-element`** — píxeles ocultos detrás de un elemento móvil (el ciervo oculta bosque, una montaña oculta cielo).
- `region`: rectángulo que contiene `alphaBounds` ampliado al menos 4 px por lado (para halos y máscaras imperfectas). `maskFile` opcional con la máscara exacta (`reconstruction/<nombre>.png`).
- `paintedIn`: ids de las capas **inferiores** que deben contener los píxeles reconstruidos.

**`frame-bleed`** — contenido de la propia capa que queda oculto bajo el marco y que un desplazamiento haría visible (ver §7).
- `side`: `left`, `right`, `top` o `bottom`.
- `coveragePx`: cuántos píxeles de contenido reconstruido se extienden bajo el marco.
- `paintedIn`: la propia capa.

Cada zona tiene su `status`, su `measurement` y, si está aprobada, su `approval`. Reglas:
- `safeBounds` solo puede ser mayor que cero cuando todas las zonas requeridas de la capa están `aprobado`; en `frame-bleed`, `coveragePx` debe cubrir `safeBounds` en el eje correspondiente.
- Si una zona no puede reconstruirse sin inventar detalle injustificado, `safeBounds` queda en 0 en ese eje: el elemento permanece fijo.
- El contenido reconstruido es arte nuevo: pasa por la misma revisión y aprobación que una capa.
- Si cambia el archivo de una capa en `paintedIn`, la aprobación de la zona se considera obsoleta.

## 6. Canales de movimiento y límites seguros

`motion.channels` es una lista (vacía = capa quieta) con a lo sumo un canal de cada tipo. Los movimientos son sinusoidales y suaves. Con `audio` se modula la amplitud; no se añaden saltos.

| Canal | Tipos | Parámetros | Efecto |
|---|---|---|---|
| `translate` | `parallax`, `float`, `drift` | `amplitudePx {x,y}`, `speedHz`, `phaseRad` | Desplaza la capa |
| `rotate` | `sway` | `amplitudeDeg` | Gira sobre `pivot` |
| `scale` | `breathe` | `amplitude` (fracción) | Escala uniforme sobre `pivot` |
| `opacity` | `pulse`, `shimmer` | `min`, `max` (0,5–1) | Varía la opacidad; no expone nada |

Todos incluyen `audio: { band, amount }` (`none`, `bass`, `mid`, `treble`, `energy`; `amount` ≤ 0,5).

**Reservados, no permitidos en v2:** `flow` (flujo de agua), `frames` (animación cuadro a cuadro, p. ej. aleteo), `deform` (malla). El esquema los rechaza al redactar; el motor tratará cualquier canal desconocido como inexistente en vez de fallar.

**Límites duros (los aplica el esquema):** traslación ≤ 48 px por eje; rotación ≤ 1°; escala ≤ 1 %; opacidad mínima ≥ 0,5; velocidad ≤ 0,5 Hz; `amount` de audio ≤ 0,5.

**Límites por tipo de capa (los aplicará el validador; propuestos):**

| `kind` | Traslación x / y (px) | Rotación | Escala | Opacidad mín. | Velocidad máx. |
|---|---|---|---|---|---|
| `sky` | 4 / 2 | — | — | — | 0,05 Hz |
| `mountain` | 14 / 6 | — | — | — | 0,10 Hz |
| `sun` | — | — | 1,0 % | 0,85 | 0,10 Hz |
| `forest` | 8 / 3 | 0,30° | — | — | 0,15 Hz |
| `water` | 10 / 2 | — | — | 0,90 | 0,15 Hz |
| `mist` | 40 / 6 | — | — | 0,60 | 0,03 Hz |
| `foliage` | 10 / 4 | 0,80° | — | — | 0,15 Hz |
| `figure` | 2 / 3 | 0,30° | 0,4 % | — | 0,25 Hz |
| `bird` | 20 / 10 | 1,00° | — | — | 0,08 Hz |
| `static`, `frame` | 0 | 0 | 0 | — | 0 |

**Presupuesto de desplazamiento.** `safeBounds {xPx, yPx}` es el desplazamiento máximo autorizado de cualquier píxel opaco. Debe cubrir la suma de los canales convertidos a píxeles: `A_traslación + r_max·θ + r_max·ΔS`, con θ en radianes y `r_max` la distancia del `pivot` a la esquina más lejana de `alphaBounds`. `safeBounds` es lo que el usuario autoriza; los canales son lo que se propone. Capa con `safeBounds` 0 = capa quieta aunque declare canales.

**Velocidad pico.** `2π·f·A` (con rotación y escala convertidas a píxeles igual que arriba) no debe superar 12 px/s.

**Audio sobre amplitud.** Amplitud efectiva = `A·((1−a) + a·e)`, con `a` = `amount` y `e` ∈ [0,1] la energía suavizada de la banda. La música nunca supera la amplitud declarada, así que nunca rebasa `safeBounds`. Sin análisis disponible, `e = 1`: la obra se anima con su amplitud declarada.

**Que se sienta pictórico, no un ecualizador.** A lo sumo 4 capas con `amount > 0`; `speedHz` y `phaseRad` distintos entre capas vecinas; en paralaje, la amplitud no disminuye al acercarse al frente; ninguna capa rebota ni pulsa de forma llamativa.

## 7. Aves, marco fijo, contenido oculto por el marco y audio

**Aves** (`kind: bird`)
- Cada ave, o grupo que se mueva como unidad, es una capa independiente. Cuántas hay y dónde se determina midiendo la maestra, no a partir del paquete v0.1 (que dejó fuera aves visibles).
- Canales permitidos: `translate` (planeo corto) y `rotate`. Sin `scale`, sin `opacity`, sin aleteo (`frames` está reservado hasta aprobar fotogramas reales).
- `alphaBounds` ampliado por `safeBounds` debe quedar dentro de `frame.visibleWindow` con 16 px de margen: ningún ave se acerca al marco.
- Reconstruir el cielo detrás de cada una (`behind-element`). Por defecto sin respuesta al audio.

**Marco fijo** (`kind: frame`)
- Exactamente una capa `frame`, la misma que `frame.layerId`, siempre `fullCanvas`, con el `zIndex` más alto de toda la obra.
- Sin canales, `safeBounds` 0, sin audio, sin reconstrucción, sin filtros ni opacidad menor de 1. Su aprobación lleva `fileSha256`.
- `render.fit` es siempre `contain`: el visor muestra el lienzo entero y nunca recorta ninguno de los cuatro lados del marco. Los controles de la interfaz quedan fuera de la escena.

**Contenido oculto por el marco**
- En la maestra el marco tapa la banda exterior de la pintura: no se sabe qué hay debajo. Si una capa que llega hasta el borde de la ventana visible se desplaza, el desplazamiento trae a la vista contenido que no existe.
- `frame.visibleWindow` (medida sobre la maestra) permite calcular qué capas tocan cada lado: las que lo alcanzan necesitan zonas `frame-bleed` aprobadas en cada lado que el movimiento pueda exponer; si no, `safeBounds` es 0 en ese eje.
- Es una decisión creativa: esa extensión es arte nuevo y la aprueba el usuario.

**Audio** (`audio` puede ser `null`)
- La obra debe mostrarse y animarse sin audio ni análisis. La reproducción empieza con una acción del usuario.
- `src`: `audio/<nombre>.m4a|.mp3|.wav` (formatos que Safari admite; propuesto). `credit` obligatorio cuando el estado no es `pendiente`. No se afirma que exista la pista hasta que el archivo esté en el repositorio.
- `analysis.mode`: `none`, `realtime`, `precomputed` o `realtime-with-precomputed-fallback`; `smoothing` 0–0,99 (0,82 propuesto).
- Bandas por defecto propuestas: graves 20–250 Hz, medios 250–2000 Hz, agudos 2000–12000 Hz.
- Datos precalculados (`audio/<nombre>.json`): `{ "version": 1, "frameRate": 30, "durationSec": n, "sourceSha256": "…", "bands": { "bass": [0..1], "mid": [0..1], "treble": [0..1], "energy": [0..1] } }`. El hash de origen impide usar datos de otra pista.
- El audio no actúa sobre el marco ni sobre capas `static`.

## 8. Referencia de campos

La referencia completa y obligatoria es `works/work.schema.json`. Resumen de una capa:

`id`, `name`, `kind` (`sky`, `mountain`, `sun`, `forest`, `water`, `mist`, `foliage`, `figure`, `bird`, `static`, `frame`), `file` (`layers/<nombre>.png`, minúsculas), `status`, `layout`, `size`, `scale`, `placement`, `alphaBounds`, `zIndex` (único, 0–1000; se sugieren saltos de 10), `pivot`, `measurement`, `motion`, `safeBounds`, `reconstruction`, `approval` (solo si `aprobado`) y `notes`.

Con `status: pendiente`, `file`, `size`, `placement`, `alphaBounds` y `measurement` pueden ser `null`. Con cualquier otro estado son obligatorios.

El índice de obras es [`works/index.json`](../works/index.json): `id`, `title`, `order`, `status`, `workFile` (`null` si todavía no existe `work.json`) y `notes`.

## 9. Ejemplo ilustrativo

**No es una obra real:** las coordenadas, fechas y hashes (ceros) son inventados para mostrar la forma. Los archivos citados no existen. En este ejemplo el ciervo tiene movimiento *propuesto* pero `safeBounds` 0 porque su zona aún está en revisión.

```json
{
  "schemaVersion": 2,
  "id": "ejemplo-ilustrativo",
  "title": "Ejemplo ilustrativo (no es una obra)",
  "status": "en_preparacion",
  "canvas": { "width": 3840, "height": 2160, "aspectRatio": "16:9" },
  "master": {
    "file": "cuadro_vivo_mountains_that_breathe_master_4k.png",
    "width": 3840,
    "height": 2160,
    "sha256": "0000000000000000000000000000000000000000000000000000000000000000"
  },
  "frame": { "layerId": "frame", "fixed": true, "visibleWindow": null, "measurement": null },
  "audio": {
    "src": null,
    "status": "pendiente",
    "durationSec": null,
    "loop": true,
    "credit": null,
    "analysis": {
      "mode": "realtime-with-precomputed-fallback",
      "precomputedSrc": "audio/ejemplo.json",
      "smoothing": 0.82,
      "bands": {
        "bass": { "minHz": 20, "maxHz": 250 },
        "mid": { "minHz": 250, "maxHz": 2000 },
        "treble": { "minHz": 2000, "maxHz": 12000 }
      }
    }
  },
  "layers": [
    {
      "id": "sky",
      "name": "Cielo (ilustrativo)",
      "kind": "sky",
      "file": "layers/sky.png",
      "status": "en_revision",
      "layout": "fullCanvas",
      "size": { "width": 3840, "height": 2160 },
      "scale": 1,
      "placement": { "x": 0, "y": 0, "width": 3840, "height": 2160 },
      "alphaBounds": { "x": 0, "y": 0, "width": 3840, "height": 2160 },
      "zIndex": 10,
      "pivot": null,
      "measurement": { "basis": "master-original", "masterSha256": "0000000000000000000000000000000000000000000000000000000000000000", "date": "2000-01-01", "by": "EJEMPLO", "method": "ejemplo" },
      "motion": { "channels": [] },
      "safeBounds": { "xPx": 0, "yPx": 0 },
      "reconstruction": { "required": false, "zones": [] },
      "notes": "Capa quieta."
    },
    {
      "id": "forest-mid",
      "name": "Bosque intermedio (pendiente)",
      "kind": "forest",
      "file": null,
      "status": "pendiente",
      "layout": "fullCanvas",
      "size": null,
      "scale": 1,
      "placement": null,
      "alphaBounds": null,
      "zIndex": 40,
      "pivot": null,
      "measurement": null,
      "motion": { "channels": [] },
      "safeBounds": { "xPx": 0, "yPx": 0 },
      "reconstruction": { "required": false, "zones": [] },
      "notes": "Sin recurso: no se inventan coordenadas."
    },
    {
      "id": "deer",
      "name": "Ciervo (ilustrativo)",
      "kind": "figure",
      "file": "layers/deer.png",
      "status": "en_revision",
      "layout": "cropped",
      "size": { "width": 300, "height": 380 },
      "scale": 1,
      "placement": { "x": 1000, "y": 1000, "width": 300, "height": 380 },
      "alphaBounds": { "x": 1030, "y": 1030, "width": 240, "height": 320 },
      "zIndex": 120,
      "pivot": { "x": 1150, "y": 1350 },
      "measurement": { "basis": "master-original", "masterSha256": "0000000000000000000000000000000000000000000000000000000000000000", "date": "2000-01-01", "by": "EJEMPLO", "method": "ejemplo" },
      "motion": {
        "channels": [
          { "channel": "scale", "type": "breathe", "amplitude": 0.003, "speedHz": 0.2, "phaseRad": 0, "audio": { "band": "none", "amount": 0 } }
        ]
      },
      "safeBounds": { "xPx": 0, "yPx": 0 },
      "reconstruction": {
        "required": true,
        "zones": [
          {
            "id": "behind-deer",
            "type": "behind-element",
            "side": null,
            "region": { "x": 1026, "y": 1026, "width": 248, "height": 328 },
            "maskFile": null,
            "paintedIn": ["forest-mid"],
            "coveragePx": null,
            "status": "en_revision",
            "measurement": { "basis": "master-original", "masterSha256": "0000000000000000000000000000000000000000000000000000000000000000", "date": "2000-01-01", "by": "EJEMPLO", "method": "ejemplo" },
            "notes": "Reconstruir bosque detrás del ciervo."
          }
        ]
      },
      "notes": "Movimiento propuesto, aún no autorizado (safeBounds 0)."
    },
    {
      "id": "frame",
      "name": "Marco ornamental fijo (ilustrativo)",
      "kind": "frame",
      "file": "layers/frame.png",
      "status": "en_revision",
      "layout": "fullCanvas",
      "size": { "width": 3840, "height": 2160 },
      "scale": 1,
      "placement": { "x": 0, "y": 0, "width": 3840, "height": 2160 },
      "alphaBounds": { "x": 0, "y": 0, "width": 3840, "height": 2160 },
      "zIndex": 1000,
      "pivot": null,
      "measurement": { "basis": "master-original", "masterSha256": "0000000000000000000000000000000000000000000000000000000000000000", "date": "2000-01-01", "by": "EJEMPLO", "method": "ejemplo" },
      "motion": { "channels": [] },
      "safeBounds": { "xPx": 0, "yPx": 0 },
      "reconstruction": { "required": false, "zones": [] },
      "notes": "Completo, fijo y en primer plano."
    }
  ],
  "render": { "fit": "contain", "internalResolution": "adaptive", "backgroundColor": "#101820", "preload": "on-demand" }
}
```

## 10. Entrega de cada capa

1. PNG RGBA de 8 bits sin pérdida y sin perfil de color incrustado.
2. Vista previa sobre fondo claro y oscuro.
3. Metadatos del esquema: posición, escala, `alphaBounds`, `zIndex`, estado, movimiento propuesto, `safeBounds` y `measurement`.
4. Notas sobre áreas reconstruidas, bordes delicados y restricciones de movimiento.
5. Comparación de la composición montada contra la maestra (lado a lado y superpuesta al 50 %) con las diferencias pendientes.
6. Verificación de dimensiones, modo RGBA y alfa real.

## 11. Pendiente de aprobación del usuario

- Pasar a `schemaVersion: 2` (cambia el borrador: `motion` pasa a lista de canales, se eliminan `depth` y `amplitudePx` global, se añaden `layout`, `scale`, `alphaBounds`, `measurement`, `reconstruction` y `approval`).
- Valores propuestos: márgenes (16 px y 4 px), límites duros y por tipo de capa, velocidad pico de 12 px/s, máximo de 4 capas reactivas al audio.
- Formatos de audio admitidos, bandas por defecto y formato de datos precalculados.
- Si se admite `scale` ≠ 1 en alguna capa.
- Ruta canónica de la maestra (hoy en la raíz del repositorio).
- Que la extensión de capas bajo el marco (`frame-bleed`) sea arte nuevo sujeto a aprobación.
