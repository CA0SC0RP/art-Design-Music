# Plan de validación automática

**Estado:** plan propuesto. **No hay validador implementado, ni CI, ni fixtures.** Describe qué comprobará el validador cuando el usuario apruebe el contrato v2 y este plan. Hasta entonces, cualquier afirmación de «validado» debe indicar exactamente qué se ejecutó (por ejemplo, «el JSON cumple el esquema», no «la obra está validada»).

Documentos relacionados: [contrato](contrato-de-capas-y-work-json.md), [`works/work.schema.json`](../works/work.schema.json), [`works/index.json`](../works/index.json).

## 1. Alcance y límites

La automatización comprueba coherencia técnica. **No puede** juzgar la calidad visual, confirmar que el usuario aprobó algo, ni sustituir las pruebas en iPad (Safari) y en el TCL 55Q650G. Esas puertas siguen siendo humanas.

## 2. Herramienta propuesta (a decidir)

- Un único script `tools/validate_works.py` (Python 3, `jsonschema` y `Pillow`), ejecutable en local y en GitHub Actions. Alternativa: Node con Ajv.
- Entradas: `works/index.json`, cada `works/<id>/work.json` y los archivos que citan.
- Salida: lista de reglas con identificador, gravedad y ubicación del fallo; código de salida distinto de cero si hay algún `ERROR`.
- Gravedades: `ERROR` bloquea; `WARN` se informa sin bloquear; `INFO` es solo informe.

## 3. Catálogo de reglas

### Índice y esquema
| ID | Grav. | Regla |
|---|---|---|
| IDX-1 | ERROR | `index.json` es JSON válido, `schemaVersion` soportado, `id` únicos (minúsculas con guiones) y `order` enteros únicos. |
| IDX-2 | ERROR | `status` ∈ `planificada`, `en_preparacion`, `en_revision`, `aprobada`. |
| IDX-3 | ERROR | `workFile` es `null` o un archivo existente `works/<id>/work.json` (mayúsculas y minúsculas exactas). Con `null`, el estado es `planificada` o `en_preparacion`. |
| IDX-4 | ERROR | Si existe `work.json`: su `id` coincide con el del índice y con el nombre del directorio, y su `status` coincide con el del índice. |
| IDX-5 | WARN | Directorio en `works/` (salvo `_demo`) sin entrada en el índice. |
| ESQ-1 | ERROR | Cada `work.json` valida contra `work.schema.json` (JSON Schema 2020-12). |
| ESQ-2 | ERROR | `work.schema.json` es a su vez un esquema válido (metaesquema). |
| ESQ-3 | ERROR | Ningún JSON tiene claves duplicadas (los analizadores estándar las aceptan sin avisar). |

### Maestra
| ID | Grav. | Regla |
|---|---|---|
| MST-1 | ERROR | `master.file` existe, es PNG de 3840×2160 y su SHA-256 es `master.sha256`. |
| MST-2 | ERROR | Toda `measurement.masterSha256` (capas, zonas, `frame.measurement`) es igual a `master.sha256`. |
| MST-3 | ERROR | En una rama, la maestra no aparece modificada, renombrada ni eliminada respecto a la rama base (`git diff --name-status`). |

### Archivos faltantes y formato
| ID | Grav. | Regla |
|---|---|---|
| ARC-1 | ERROR | Cada `file`, `maskFile`, `audio.src` y `precomputedSrc` no nulo existe, es un archivo regular dentro del directorio de la obra (sin `..`, sin enlaces simbólicos que salgan) y coincide en mayúsculas y minúsculas (GitHub Pages y Android las distinguen). |
| ARC-2 | ERROR | Capa PNG: firma válida, decodifica, 8 bits RGBA (color type 6), sin chunks `iCCP`, `sRGB`, `gAMA` ni `cHRM` (la maestra no los tiene), y sus dimensiones reales son `size`. |
| ARC-3 | ERROR | Una capa con estado distinto de `pendiente` tiene archivo presente. |
| ARC-4 | WARN | PNG en `layers/` que ninguna capa referencia; capa `pendiente` cuyo archivo ya existe. |
| ARC-5 | WARN | Memoria decodificada estimada (suma de ancho×alto×4 de las capas) por encima de `maxDecodedMiB`, parámetro a fijar tras medir en dispositivos. |
| ARC-6 | ERROR | Si hay `precomputedSrc`: JSON válido con `version`, `frameRate`, `durationSec`, `sourceSha256` igual al hash de `audio.src`, bandas `bass`, `mid`, `treble`, `energy` con valores 0–1 y longitud ≈ `durationSec×frameRate` (±1). |
| ARC-7 | ERROR | Audio con estado distinto de `pendiente` tiene `credit` no nulo y `src` presente. |

### Estados permitidos y aprobaciones
| ID | Grav. | Regla |
|---|---|---|
| EST-1 | ERROR | Estados dentro del vocabulario del contrato (lo impone el esquema). |
| EST-2 | ERROR | `aprobado` lleva `approval` completo; en capas y audio, `approval.fileSha256` coincide con el SHA-256 real del archivo (si no, la aprobación está obsoleta). |
| EST-3 | ERROR | Un recurso no aprobado no lleva `approval` (lo impone el esquema). |
| EST-4 | ERROR | Obra `aprobada` ⇒ todas las capas, todas las zonas y el audio (si existe) están `aprobado`. |
| EST-5 | ERROR | Capa `aprobado` ⇒ sus zonas requeridas están `aprobado`; zona `aprobado` ⇒ las capas de `paintedIn` tienen su aprobación vigente. |
| EST-6 | ERROR | Obra `en_revision` o `aprobada` ⇒ ninguna capa `pendiente` y `frame.visibleWindow` no es `null`. |

### Capas, `zIndex` y marco
| ID | Grav. | Regla |
|---|---|---|
| CAP-1 | ERROR | `id` de capa único; `id` de zona único en toda la obra. |
| CAP-2 | ERROR | `zIndex` único entre todas las capas. |
| CAP-3 | ERROR | Exactamente una capa `kind: frame`; es la de `frame.layerId`; su `zIndex` es estrictamente mayor que el de todas las demás (marco en primer plano). |
| CAP-4 | ERROR | La capa marco es `fullCanvas`, sin canales, `safeBounds` 0 y sin zonas (lo impone el esquema), y ninguna capa de otro `kind` repite `file` con ella. |
| CAP-5 | ERROR | `cropped`: `placement` entero dentro del lienzo (`x+width ≤ 3840`, `y+height ≤ 2160`). |
| CAP-6 | ERROR | `placement.width = size.width × scale` y `placement.height = size.height × scale`, enteros. |
| CAP-7 | ERROR | `alphaBounds` dentro de `placement`; en `cropped`, margen ≥ 16 px por lado salvo en los lados que coinciden con el borde del lienzo. |
| CAP-8 | ERROR | Píxeles: el rectángulo mínimo de alfa > 0 del PNG, desplazado por `placement`, es igual a `alphaBounds` (tolerancia 0 px). |
| CAP-9 | ERROR | `bird` y `figure`: `alphaBounds` ampliado por `safeBounds` queda dentro de `frame.visibleWindow` con 16 px de margen. |
| CAP-10 | WARN | Capa totalmente transparente, o capa totalmente opaca que no sea `sky`. |
| CAP-11 | INFO | Composición en reposo de todas las capas frente a la maestra: diferencia media y máxima por píxel y mapa de diferencias como artefacto. No bloquea hasta que el usuario apruebe umbrales. Es el informe que se adjunta como `evidence` al aprobar la obra. |

### Movimiento, reconstrucción, marco y audio
| ID | Grav. | Regla |
|---|---|---|
| MOV-1 | ERROR | A lo sumo un canal de cada tipo por capa y canal permitido para su `kind` (contrato §6). |
| MOV-2 | ERROR | Amplitudes, `speedHz` y opacidad mínima dentro de los límites del `kind`. |
| MOV-3 | ERROR | Presupuesto: traslación + `r_max·θ` + `r_max·ΔS` ≤ `safeBounds` en cada eje; en `opacity`, `min ≤ max`. |
| MOV-4 | ERROR | Velocidad pico `2π·f·A` ≤ 12 px/s (rotación y escala convertidas a píxeles). |
| MOV-5 | ERROR | `safeBounds` > 0 ⇒ `reconstruction.required`, zonas requeridas `aprobado`, `frame.visibleWindow` no nulo y, en `frame-bleed`, `coveragePx` ≥ `safeBounds` en su eje (x para `left`/`right`, y para `top`/`bottom`). |
| MOV-6 | ERROR | Capa cuyo `placement` alcanza un lado de `frame.visibleWindow`, con `safeBounds` > 0 en el eje de ese lado ⇒ tiene una zona `frame-bleed` para ese lado. |
| MOV-7 | ERROR | `behind-element`: `paintedIn` existe y con `zIndex` menor que la capa; `region` dentro del lienzo y contiene `alphaBounds` ampliado 4 px (recortado al lienzo). `frame-bleed`: `paintedIn` es la propia capa. |
| MOV-8 | ERROR | A lo sumo 4 capas con `audio.amount` > 0; ninguna `frame` ni `static`. |
| MOV-9 | WARN | Paralaje cuya amplitud disminuye al subir el `zIndex`; capas vecinas con el mismo `speedHz` y `phaseRad`; banda de audio asignada con `audio` de la obra nulo. |

### Documentación
| ID | Grav. | Regla |
|---|---|---|
| DOC-1 | ERROR | Los enlaces relativos de todos los `.md` apuntan a archivos existentes. |

## 4. Pruebas del propio validador

- Cada regla `ERROR` tiene al menos un caso negativo (un `work.json` mínimo que viola solo esa regla) y hay un caso positivo completo.
- Los PNG de prueba se generan en tiempo de ejecución en un directorio temporal; no se versionan binarios.
- Los casos se guardarán en `tests/fixtures/` solo cuando se autorice implementar el validador.

## 5. Integración continua (a decidir)

- Un flujo de GitHub Actions que ejecute el validador en cada pull request que toque `works/**`, `docs/**` o el propio script, y publique el informe CAP-11 como artefacto.
- Exigir que pase antes de fusionar es un ajuste de protección de rama que corresponde al usuario.

## 6. Fases

| Fase | Contenido | Requiere |
|---|---|---|
| 0 | ESQ-1 y ESQ-2 con cualquier validador de JSON Schema 2020-12; revisión visual. Posible hoy, sin código del proyecto. | Nada |
| 1 | Reglas sin imágenes: IDX, ESQ-3, MST-1 a MST-3, ARC-1, ARC-3, EST, CAP-1 a CAP-7, MOV, DOC-1. | Aprobar contrato y plan |
| 2 | Reglas con píxeles: ARC-2, ARC-4 a ARC-7, CAP-8 a CAP-10. | Capas reales |
| 3 | CAP-11 y CI. | Umbrales aprobados |

## 7. Qué no cubre

Calidad de bordes y reconstrucciones, estética de papel recortado, sensación del movimiento, rendimiento y compatibilidad de audio, y la validez de una aprobación. Todo eso requiere la revisión del usuario y las pruebas en iPad Safari y en el televisor.

## 8. Decisiones pendientes

- Lenguaje y herramientas del validador (Python con `jsonschema` y `Pillow`, o Node con Ajv).
- Si se activa CI y si pasa a ser requisito para fusionar.
- Valor de `maxDecodedMiB` y umbrales de CAP-11, tras medir en dispositivos.
- Si DOC-1 y las reglas MOV-9 (advertencias) deben subir a `ERROR`.
