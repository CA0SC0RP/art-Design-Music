# Plan de validación automática

**Estado:** plan propuesto. **No hay validador implementado ni CI.** Sí existe `tests/test_contrato_v2.py`, que prueba el esquema y fija con comprobaciones de referencia el comportamiento esperado de dos reglas que el esquema no puede expresar; **no es el validador** (ver §4, que separa lo ejecutado de lo pendiente). Describe qué comprobará el validador cuando el usuario apruebe el contrato v2 y este plan. Hasta entonces, cualquier afirmación de «validado» debe indicar exactamente qué se ejecutó (por ejemplo, «el JSON cumple el esquema», no «la obra está validada»).

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

### Geometría y fechas
| ID | Grav. | Regla | Quién la impone |
|---|---|---|---|
| GEO-1 | ERROR | **Todo rectángulo** (`placement` y `alphaBounds` de cualquier capa, `region` de cualquier zona, `frame.visibleWindow`) cumple `x + width ≤ 3840` e `y + height ≤ 2160`. El esquema solo limita cada campo por separado (`x ≤ 3839`, `width ≤ 3840`), por lo que `x=3700, width=300` pasa el esquema y debe fallar aquí. | Validador (**pendiente**); referencia en pruebas |
| FEC-1 | ERROR | `measurement.date` y `approval.date` son fechas reales de calendario AAAA-MM-DD (se rechazan `2026-02-30`, `2026-04-31`, `2026-02-29`, `2100-02-29`; se aceptan `2028-02-29`, `2000-02-29`), sin espacios ni saltos de línea. | Esquema (**ejecutado en pruebas**) |

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
| CAP-5 | ERROR | Cubierta por GEO-1, que aplica al `placement` de cualquier capa, no solo de las `cropped`. |
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
| MOV-3 | ERROR | Presupuesto: traslación + `r_max·θ` + `r_max·ΔS` ≤ `safeBounds` en cada eje. (La regla de opacidad `min ≤ max` es MOV-10.) |
| MOV-4 | ERROR | Velocidad pico `2π·f·A` ≤ 12 px/s (rotación y escala convertidas a píxeles). |
| MOV-5 | ERROR | **Toda capa móvil declara la reconstrucción necesaria:** con un canal `translate`, `rotate` o `scale`, `reconstruction.required` es `true` y la capa lista al menos una zona. Un canal solo de `opacity` no la exige. (Esquema, **ejecutado en pruebas**.) |
| MOV-6 | ERROR | Capa cuyo `placement` alcanza un lado de `frame.visibleWindow`, con `safeBounds` > 0 en el eje de ese lado ⇒ tiene una zona `frame-bleed` para ese lado. |
| MOV-7 | ERROR | `behind-element`: `paintedIn` existe y con `zIndex` menor que la capa; `region` dentro del lienzo y contiene `alphaBounds` ampliado 4 px (recortado al lienzo). `frame-bleed`: `paintedIn` es la propia capa. |
| MOV-8 | ERROR | A lo sumo 4 capas con `audio.amount` > 0; ninguna `frame` ni `static`. |
| MOV-9 | WARN | Paralaje cuya amplitud disminuye al subir el `zIndex`; capas vecinas con el mismo `speedHz` y `phaseRad`; banda de audio asignada con `audio` de la obra nulo. |
| MOV-10 | ERROR | En todo canal `opacity`, `min ≤ max` (pueden ser iguales). El esquema solo limita cada campo a 0,5–1 y no puede compararlos, por lo que `min=0.9, max=0.7` pasa el esquema y debe fallar aquí. (Validador **pendiente**; referencia en pruebas.) |
| MOV-11 | ERROR | **`safeBounds` no puede autorizar movimiento si las zonas requeridas no están aprobadas:** `xPx` o `yPx` > 0 ⇒ `reconstruction.required: true`, al menos una zona y **todas** las zonas en `aprobado` con su `approval`. (Esquema, **ejecutado en pruebas**.) Parte entre campos, **pendiente** en el validador: `frame.visibleWindow` no nulo, `coveragePx` ≥ `safeBounds` en su eje (x para `left`/`right`, y para `top`/`bottom`) y aprobaciones de zona vigentes (EST-5). |

### Documentación
| ID | Grav. | Regla |
|---|---|---|
| DOC-1 | ERROR | Los enlaces relativos de todos los `.md` apuntan a archivos existentes. |

## 4. Estado de implementación y pruebas

**Comando:** `python3 -I tests/test_contrato_v2.py -v` (Python 3 y `jsonschema`; unos 6 s; sin imágenes ni red).
**Última ejecución (2026-10-27, `jsonschema` 4.26.0):** 45 pruebas; 30 ejecutadas y superadas; 15 omitidas por pendientes de implementar; 0 fallos.

`tests/test_contrato_v2.py` **no es el validador**. Sus pruebas `test_esquema_*` ejecutan el esquema real. Sus pruebas `test_ref_*` usan una comprobación de referencia mínima, escrita solo para fijar el comportamiento que el futuro validador debe cumplir; cuando exista, deberá pasar las mismas pruebas.

### 4.1 Ejecutado y superado

| Regla | Quién la impone hoy | Qué se probó (pruebas) |
|---|---|---|
| FEC-1 fechas reales | Esquema | Patrón contra `datetime.date` para todos los días de los años 0001 a 9999 (sin discrepancias); febrero bisiesto y siglos (2000 sí, 2100 no); mes 13, día 0 o 32, 30/31 de meses cortos; formatos `2026-1-5`, `20261026`, hora, espacios y salto de línea final; aplicado a `measurement.date` de capa, zona y marco, y a `approval.date`. 5 pruebas |
| GEO-1 rectángulos en el lienzo | Solo la comprobación de referencia (el esquema **no** puede) | El esquema acepta `x=3700, width=300` (limitación documentada); la referencia lo rechaza; límite exacto (`3840`, `2160`) válido y +1 px inválido; aplicado a `placement`, `alphaBounds`, `region` y `visibleWindow`. 4 pruebas |
| MOV-10 `opacity.min ≤ max` | Solo la comprobación de referencia (el esquema **no** puede) | El esquema acepta `min=0.9, max=0.7` (limitación documentada); la referencia lo rechaza; `0.7/0.9`, `0.8/0.8` y `0.5/1` válidos; el esquema sigue limitando cada campo a 0,5–1. 4 pruebas |
| MOV-5 y MOV-11 (parte del esquema) | Esquema | Canal `translate`, `rotate` o `scale` sin reconstrucción requerida, o con ella pero sin zonas, se rechaza; con zona se acepta; canal solo de opacidad no la exige. `safeBounds` > 0 en X, en Y o en ambos, o con 0,5 px, con zona `en_revision` se rechaza; sin reconstrucción requerida o sin zonas se rechaza; basta una zona sin aprobar entre varias; zona `aprobado` sin `approval` se rechaza; con todas las zonas aprobadas se acepta; `safeBounds` 0 con zonas sin aprobar es válido; el marco no puede autorizar movimiento. 11 pruebas |
| Regresión del esquema de la primera entrega | Esquema | 24 casos negativos rechazados y 5 positivos aceptados (estados, `approval`, lienzo completo, rutas, canales reservados, límites duros, marco, medición, zonas, audio); el esquema es válido en 2020-12. 3 pruebas |
| Archivos del repositorio | Pruebas | SHA-256 de la maestra igual al documentado; JSON sin claves duplicadas; `works/index.json` coherente. 3 pruebas |

**Comprobación de que las pruebas detectan fallos** (hecha en una copia temporal, no en el repositorio): con el patrón de fecha antiguo (solo forma) fallan 10 pruebas; sin la regla de `safeBounds` fallan 6. Con el esquema actual todas pasan.

### 4.2 Pendiente de implementar (no ejecutado)

Las 15 pruebas omitidas del mismo archivo muestran esta lista como `skipped`:

- El **validador real** de GEO-1 y MOV-10 (hoy solo hay referencia en pruebas).
- CAP-1 (ids únicos de capa y de zona), CAP-2 (zIndex únicos) y CAP-3 (marco único y con el zIndex más alto).
- ARC-1 (archivos citados existen, mayúsculas exactas), ARC-2 y CAP-8 (PNG reales: modo, dimensiones y `alphaBounds`): requieren además capas reales.
- MST-2 (hash de la maestra en cada medición) y EST-2 (hash real del archivo aprobado).
- EST-4, EST-5 y EST-6 (coherencia de estados entre campos).
- MOV-2 (límites por tipo de capa), MOV-3 y MOV-4 (presupuesto de desplazamiento y velocidad pico).
- La parte entre campos de MOV-5 y MOV-11: `coveragePx`, `visibleWindow` y aprobaciones de zona vigentes.
- CAP-11 (composición contra la maestra), integración continua y fixtures de PNG.
- **Pruebas visuales y de rendimiento** en iPad Safari y TCL 55Q650G: los límites de movimiento siguen siendo propuestos hasta entonces.

### 4.3 Criterios para el validador futuro

- Cada regla `ERROR` tiene al menos un caso negativo (un `work.json` mínimo que viola solo esa regla) y hay un caso positivo completo.
- Los PNG de prueba se generan en tiempo de ejecución en un directorio temporal; no se versionan binarios.
- Una regla no se marca como implementada hasta que su prueba negativa falle al quitar la regla.

## 5. Integración continua (a decidir)

- Un flujo de GitHub Actions que ejecute el validador en cada pull request que toque `works/**`, `docs/**` o el propio script, y publique el informe CAP-11 como artefacto.
- Exigir que pase antes de fusionar es un ajuste de protección de rama que corresponde al usuario.

## 6. Fases

| Fase | Contenido | Requiere |
|---|---|---|
| 0 | ESQ-1 y ESQ-2, FEC-1, MOV-5 y la parte de esquema de MOV-11, más pruebas de referencia de GEO-1 y MOV-10: ejecutadas en esta rama con `tests/test_contrato_v2.py` (ver §4). | Hecho; pendiente de revisión |
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
- Si `tests/test_contrato_v2.py` se conserva en el repositorio como base de las pruebas del validador.
- Los límites de movimiento (MOV-2 a MOV-4) siguen siendo valores propuestos hasta tener pruebas visuales y de rendimiento.
