# Auditoría técnica del estado actual — 2026-10-29

**Rama:** `auditoria/estado-2026-10-29`, creada desde `main` en `e2c7399`.
**Alcance:** lectura, ejecución de pruebas y mediciones. No se modificaron el contrato, el esquema, las pruebas existentes, la imagen maestra ni ningún recurso visual. No se construyó motor, visor ni validador.
**Convención:** *Verificado* = comprobado en esta sesión con un comando o una consulta a GitHub. *Propuesta* = existe solo como texto. *Inferido* = deducción que indico como tal.

## 0. Resumen

1. **`main` cambió desde mi última entrega.** El PR #2 (fusionado el 27-10 a las 14:18 -0600 por `CA0SC0RP`) llevó a `main` mi contrato v2, el esquema, el índice, el plan y las pruebas, más cuatro commits de dirección artística. `ESTADO_PROYECTO.md` y `BITACORA.md` dentro de `main` registran `main` en `f81b03c` y describen esas ramas como no fusionadas. Ya no es cierto (§4, P1).
2. **Las 45 pruebas dan el mismo resultado sobre `main`:** 30 superadas, 15 omitidas, 0 fallos. Pero los 15 marcadores no son la lista completa de lo pendiente: 18 reglas del catálogo no tienen ni prueba ni marcador (§5).
3. **La dirección creativa del 27-10 no cabe en el contrato v2** (sprites, ciclos de río, aleteo, eventos musicales, negro OLED, casas y nubes). Hay conflictos concretos con cláusulas escritas (§4, P3).
4. **El esquema no compila en Ajv en modo estricto**, que es el modo por defecto de Ajv. El plan nombra a Ajv como alternativa de validador (§4, P4).
5. **La maestra está intacta** (mismo blob Git en `f81b03c`, `b137906` y `e2c7399`; hash SHA-256 coincide). Hay una pregunta abierta sobre si sigue siendo la maestra (§4, P2).
6. **No existe todavía:** obra real (`work.json`), validador, CI, motor, visor, capas, sprites, música ni pruebas en dispositivos.

## 1. Estado verificado del repositorio

| Elemento | Hecho | Cómo se verificó |
|---|---|---|
| `main` | `e2c7399`, fusión del PR #2, 2026-10-27 14:18:29 -0600, autor `CA0SC0RP`. Antes estaba en `f81b03c` | `git ls-remote`, `git log` |
| PR #2 | `merged: true`, 7 commits, 15 archivos; rama `direccion-artistica-musica-sprites-2026-10-27` → `main` | `gh api repos/.../pulls/2` |
| PR #1 | `merged: true` | `gh api repos/.../pulls` |
| Rama `contrato/capas-v2-esquema-y-validacion` | `b137906`; **contenida en `main`** (no tuvo PR propio; entró dentro del #2) | `git merge-base --is-ancestor` |
| Rama `direccion-artistica-musica-sprites-2026-10-27` | `1fc7bea`; contenida en `main` | ídem |
| Rama `preparacion/contrato-datos-y-protocolo` | `cebbe47`; contenida en `main` | ídem |
| Cambios de `b137906` a `main` | solo 4 archivos: `BITACORA.md`, `ESTADO_PROYECTO.md`, `INSTRUCCIONES_PARA_IA.md` y el nuevo `docs/direccion-artistica-y-partitura-audiovisual.md` | `git diff --stat` |
| Contrato, plan, esquema, índice, pruebas, README y ARQUITECTURA en `main` | idénticos a mi rama del 27-10 | `git diff --quiet` |
| Imagen maestra | mismo blob (`4882acc…`) en `f81b03c`, `b137906` y `e2c7399`; 13 640 594 bytes; SHA-256 igual al documentado | `git rev-parse`, prueba de hash |
| Árbol de trabajo | limpio antes y después de ejecutar pruebas | `git status` |
| Existen en `main` | 5 documentos en la raíz (`README`, `ESTADO_PROYECTO`, `INSTRUCCIONES_PARA_IA`, `ARQUITECTURA`, `BITACORA`), 8 en `docs/`, `works/index.json`, `works/work.schema.json`, `tests/test_contrato_v2.py` y la maestra | `git ls-tree` |
| No existen en `main` | `src/`, `tools/`, `.github/`, `.gitignore`, `requirements*`, `works/mountains-that-breathe/`, capas, audio, sprites | `git ls-tree`, `ls` |

## 2. Implementado y comprobado

Todo con resultados reales de esta sesión (Python 3.13.17, `jsonschema` 4.26.0, Node 22.23.4, Ajv 8.18.0 preinstalado).

| # | Qué | Evidencia |
|---|---|---|
| 1 | Las 45 pruebas de `tests/test_contrato_v2.py` sobre `e2c7399` | 45 ejecutadas; 30 superadas; 15 omitidas; 0 fallos; 4,05 s |
| 2 | `work.schema.json` es un esquema válido 2020-12 | prueba incluida en el archivo |
| 3 | El ejemplo del contrato valida contra el esquema | prueba incluida |
| 4 | FEC-1 (fechas reales) en el esquema | patrón contra `datetime.date` en todos los días de 0001 a 9999 (prueba incluida) **y**, nuevo, contra el calendario de JavaScript con el patrón compilado como ECMAScript (flag `u`): 3 719 628 fechas, 0 discrepancias |
| 5 | Reglas de esquema: `safeBounds` > 0 exige reconstrucción con todas las zonas aprobadas; canales móviles exigen reconstrucción; estados y `approval`; marco fijo | pruebas incluidas |
| 6 | **Concordancia entre dos motores:** 69 casos (ejemplo, 24 negativos, 5 positivos, 22 fechas, safeBounds, opacidad, rectángulo) dan el mismo veredicto en `jsonschema` y en Ajv | 0 discrepancias |
| 7 | Hash de la maestra, JSON sin claves duplicadas y coherencia de `works/index.json` | pruebas incluidas |
| 8 | GEO-1 y MOV-10 | **solo comprobaciones de referencia dentro de las pruebas**, no un validador. Las pruebas confirman que el esquema deja pasar ambos casos |

**Qué no significa lo anterior:** no hay `work.json` de ninguna obra, así que ESQ-1 solo se ejecuta contra el ejemplo ilustrativo. Nada de lo anterior valida arte, movimiento ni rendimiento.

### Cobertura del catálogo de 49 reglas del plan

| Grupo | Reglas | N |
|---|---|---|
| A. Impuestas por el esquema y probadas | ESQ-2, EST-1, EST-3, FEC-1, MOV-5, MOV-11 (parte de esquema), CAP-4 (parte de esquema) | 7 |
| B. Probadas solo en parte | ESQ-1 (solo el ejemplo), ESQ-3 (solo 3 archivos y el bloque del contrato), MST-1 (solo el hash de la maestra, sin dimensiones ni `master.sha256`), IDX-1, IDX-2, IDX-3 (sobre el `index.json` actual) | 6 |
| C. Solo comprobación de referencia, sin validador | GEO-1, MOV-10, CAP-5 (cubierta por GEO-1) | 3 |
| D. Con marcador omitido, sin implementar | MST-2, EST-2, EST-4, EST-5, EST-6, CAP-1, CAP-2, CAP-3, CAP-8, ARC-1, ARC-2, MOV-2, MOV-3, MOV-4, CAP-11 | 15 |
| E. **Sin prueba ni marcador** | IDX-4, IDX-5, MST-3, ARC-3, ARC-4, ARC-5, ARC-6, ARC-7, CAP-6, CAP-7, CAP-9, CAP-10, MOV-1, MOV-6, MOV-7, MOV-8, MOV-9, DOC-1 | 18 |

DOC-1 (enlaces) y la búsqueda de frases obsoletas se ejecutaron a mano en la entrega del 26-10, pero esos scripts no se guardaron en el repositorio; hoy no son reproducibles por otra persona.

## 3. Existe solo como documentación o propuesta

- **Contrato v2 completo:** capas `fullCanvas`/`cropped`, estados y aprobaciones, zonas de reconstrucción, canales de movimiento, límites por tipo de capa, presupuesto de desplazamiento, velocidad pico, reglas de aves y marco, audio y formato de datos precalculados. ESTADO lo mantiene como «propuesta pendiente de revisión», aunque está en `main`.
- **Todos los valores numéricos** (16 px, 4 px, 12 px/s, 48 px, 0,5 Hz, máximo 4 capas reactivas, límites por `kind`, bandas de audio, `smoothing`): propuestos, sin prueba visual ni de rendimiento.
- **Plan de validación:** las 49 reglas, el validador, la CI y las fases 1 a 3.
- **ARQUITECTURA:** estructura de carpetas, Canvas 2D, Web Audio, GitHub Pages, Android TV.
- **Dirección artística y partitura audiovisual** (`docs/direccion-artistica-y-partitura-audiovisual.md`): decisiones creativas acordadas el 27-10. No hay modelo de datos ni formato técnico para sprites, ciclos, eventos musicales ni partitura.
- **No existen en el repositorio** (verificado): motor, visor, validador, capas, sprites, música, partitura, tempo de 72 BPM como pista, `work.json`, CI.

## 4. Problemas técnicos a resolver antes de continuar

### P1. Los documentos de estado contradicen el repositorio (alta)

| Archivo | Texto actual | Realidad verificada |
|---|---|---|
| `ESTADO_PROYECTO.md:16` | «`main` se registró previamente en `f81b03c`» (lo presenta como registro previo) | `main` está en `e2c7399`; el dato quedó desactualizado |
| `ESTADO_PROYECTO.md:17` | la rama del contrato «no debe considerarse fusionada a `main`» | contenida en `main` |
| `ESTADO_PROYECTO.md:18` | la rama de dirección artística «No fusionar sin aprobación» | fusionada (PR #2) |
| `BITACORA.md:44` | «Esta rama no está fusionada» | fusionada |
| `README.md:43` | `tests/test_contrato_v2.py` «no en `main`» | está en `main` |
| `docs/plan-de-validacion-automatica.md:150` | «ejecutadas en esta rama» | rama ya fusionada |

`BITACORA.md:16` («nada se ha integrado en `main`») era cierto cuando se escribió y debe leerse como entrada histórica.
Hay además una pregunta que no puedo resolver: **la fusión integró los archivos, pero no consta que el usuario haya aprobado el contrato v2.** Los documentos lo siguen llamando propuesta.

### P2. Incertidumbre sobre la maestra canónica (alta)

- `README.md` llama «aprobada» a la pieza actual. `ESTADO_PROYECTO.md` (paso 2) pide «preparar/aprobar una imagen maestra limpia» antes de cortar capas y dice que la lámina conceptual con paneles no es la maestra final. Esa lámina no está en el repositorio.
- Si se reemplaza la maestra cambia su hash. Eso invalida toda medición registrada, el valor fijo de `tests/test_contrato_v2.py` y `master.sha256`.
- **Resolución efectiva (indicativo, no prueba):** solo el 0,15 % de la potencia espectral horizontal y vertical está por encima de la frecuencia que corresponde a 1672 × 941. Ida y vuelta a 1672 × 941 da 37,2 dB y a 2560 × 1440 da 43,4 dB (inferido: el enfoque moderado de la ampliación añade algo de energía en altas frecuencias, por eso 37 dB no es más alto). Es coherente con la nota del README de que la maestra es una ampliación de 1672 × 941. No sustituye una comprobación con la fuente.
- **Negro OLED:** el anillo exterior de la maestra (16 px) tiene RGB medio ≈ (58, 38, 23), con un 28 % de píxeles exactamente negros y luminancia máxima 255. Es madera oscura del marco, no #000000. No puedo saber si la regla «exterior negro OLED» se refiere a los píxeles de la maestra o al fondo de la pantalla alrededor del lienzo (`render.backgroundColor`).

### P3. El contrato v2 choca con la dirección creativa del 27-10 (alta)

| Dirección creativa | Contrato v2 / esquema |
|---|---|
| Sprites, hojas de poses y ciclos largos | `frames` está «reservado, no permitido» y el esquema lo rechaza |
| Río con ciclo continuo | `flow` está reservado y rechazado |
| Aves y murciélagos con ciclos de aleteo | §7: aves «sin aleteo» |
| Eventos y marcas temporales compuestos con la música, más análisis suavizado | solo existe `audio.analysis` por bandas; no hay formato de eventos ni de partitura |
| «Todo elemento visible tiene vida» + eventos musicales | MOV-8: a lo sumo 4 capas con `audio.amount > 0`; el esquema solo conoce bandas |
| Casas, nubes, rocas, luna, murciélagos | el `kind` solo admite 11 valores (sin casa, nube, roca, luna ni murciélago); el esquema los rechaza |
| Exterior negro OLED (#000000) | el ejemplo usa `#101820` y el esquema acepta cualquier `#rrggbb` |
| Ciclos de sprites a 3840 × 2160 | límites de 48 px y 12 px/s pensados para paralaje; presupuesto de memoria calculado solo para capas estáticas |

El propio contrato anticipa la ampliación («reservado hasta aprobar fotogramas reales»), pero activarla cambia el contrato y requiere tu aprobación.

### P4. El esquema no compila en Ajv en modo estricto (media)

- Ajv 8.18.0 con la configuración por defecto (`strict: true`) falla: *required property "approval" is not defined* (`strictRequired`).
- En modo `log` compila con 31 avisos: 6 de `strictRequired` y 25 de `strictTypes`. Con esas dos clases desactivadas compila, así que no hay otros problemas de modo estricto.
- Con `jsonschema` de Python no ocurre; los dos motores dan el mismo veredicto en los 69 casos.
- Arreglo previsto: añadir `type` y declarar `approval` en los subesquemas condicionales, sin cambio de significado. Se comprobaría con los mismos 69 casos y las 45 pruebas. Toca `works/work.schema.json`, por eso lo pongo en decisiones.

### P5. Lo que el esquema acepta hoy (media; todo son reglas del plan sin implementar)

Probado con el esquema real; cada fila **ACEPTA** un documento que viola una regla del contrato:

| Caso aceptado por el esquema | Regla |
|---|---|
| Obra `aprobada` con capas `en_revision` y `pendiente` | EST-4 |
| Marco con `zIndex` menor que otras capas | CAP-3 |
| Dos capas con el mismo `zIndex` o el mismo `id` | CAP-2, CAP-1 |
| `frame.layerId` que apunta a una capa inexistente | CAP-3 |
| `measurement.masterSha256` distinto de `master.sha256` | MST-2 |
| `paintedIn` hacia una capa inexistente | MOV-7 |
| `kind: bird` con canal `scale` | MOV-1 |
| `alphaBounds` fuera de `placement`; `placement` incoherente con `size × scale` | CAP-7, CAP-6 |
| Amplitud de 40 px con `safeBounds` autorizado de 0,5 px | MOV-3 |
| Traslación de 48 px a 0,5 Hz en `kind: figure` (límite del tipo: 2 / 3 px) | MOV-2, MOV-4 |
| `render.backgroundColor` distinto de #000000 | regla creativa nueva |

### P6. El contrato no da una matriz explícita de canales por tipo (media)

MOV-1 exige «canal permitido para su `kind` (contrato §6)», pero §6 solo da límites numéricos con «—». No dice si «—» significa «no permitido» o «sin límite propuesto». Hay que explicitarlo antes de implementar MOV-1 y MOV-2.

### P7. Otros puntos técnicos

- `works/index.json` no tiene esquema propio; IDX-1 habla de «schemaVersion soportado» sin definirlo.
- No hay `.gitignore`: ejecutar las pruebas crea `tests/__pycache__`, que un `git add -A` incluiría.
- No hay `requirements`: las pruebas dependen de `jsonschema`, versión sin fijar.
- Las pruebas dependen del **primer bloque `json`** del contrato (el ejemplo) y de un hash escrito a mano; reordenar el documento o cambiar la maestra las rompe.
- Los 15 marcadores omitidos son funciones vacías con una lista escrita a mano; pueden desviarse del catálogo (de hecho ya lo hacen, P5/§2).
- Peso: 14 capas a lienzo completo ocuparían ≈ 443 MiB decodificadas (cálculo del contrato). Un río con N fotogramas lo multiplica. No se ha medido nada. No hay decisión sobre Git LFS; la maestra pesa 13,6 MB.
- **Reglas de proceso en conflicto:** `INSTRUCCIONES_PARA_IA.md` permite «pruebas de concepto con recursos provisionales», mientras que tus instrucciones actuales piden no inventar capas ni recursos. `ARQUITECTURA.md` prevé `works/_demo/`. El formato de entrada de bitácora que ahora exiges (fecha y objetivo, rama y commit de partida, archivos, cambios, pruebas, problemas) no está en las instrucciones, y algunas entradas previas no indican el commit de partida (por ejemplo, la corrección del 27-10, que dice solo «misma rama»).

## 5. Las 15 pruebas omitidas

Los 15 marcadores del archivo de pruebas son `@unittest.skip` sin cuerpo: **no ejecutan nada**. Clasificación:

| # | Marcador | Reglas | ¿Validación sin implementar? | Cómo cubrirla | ¿Necesita recursos reales? |
|---|---|---|---|---|---|
| 1 | GEO-1, validador real | GEO-1 | Sí | Implementar en el validador y ejecutar contra él las pruebas de referencia actuales | No |
| 2 | MOV-10, validador real | MOV-10 | Sí | Igual | No |
| 3 | `zIndex` únicos | CAP-2 | Sí | Fixtures JSON mínimos, positivos y negativos | No |
| 4 | Marco único y más alto | CAP-3 | Sí | Fixtures JSON | No |
| 5 | Ids únicos | CAP-1 | Sí | Fixtures JSON | No |
| 6 | Archivos citados existen | ARC-1 | Sí | Directorio temporal con archivos de prueba; comprobar mayúsculas contra el listado real del sistema | No |
| 7 | PNG: modo, dimensiones, `alphaBounds` | ARC-2, CAP-8 | Sí | PNG **sintéticos generados al ejecutar** en un directorio temporal, con alfa conocido (nunca versionados) | No, pero requiere D5 |
| 8 | `masterSha256` = `master.sha256` | MST-2 | Sí | Fixtures JSON | No |
| 9 | `fileSha256` = hash real | EST-2 | Sí | Archivo temporal con hash conocido | No |
| 10 | Coherencia de estados | EST-4, EST-5, EST-6 | Sí | Fixtures JSON | No |
| 11 | Presupuesto y velocidad pico | MOV-3, MOV-4 | Sí | Fixtures numéricos con las fórmulas del contrato | No |
| 12 | Límites por tipo | MOV-2 | Sí, **bloqueada** | Antes hay que cerrar P6 (matriz explícita) | No |
| 13 | Parte entre campos de MOV-5 y MOV-11 | MOV-5, MOV-11 | Sí | Fixtures JSON (`coveragePx`, `visibleWindow`, aprobaciones vigentes) | No |
| 14 | Composición contra la maestra | CAP-11 | Parcial | La lógica de comparación se prueba con imágenes sintéticas; los **umbrales** solo con capas reales y tu aprobación | Sí, para umbrales |
| 15 | iPad Safari y TCL 55Q650G | dispositivos | No automatizable | Protocolo manual con criterios acordados antes | Sí, dispositivos |

**Resumen:** 12 de los 15 se pueden cubrir ya con las reglas actuales y fixtures sin capas reales (el #7 necesita que apruebes imágenes sintéticas de prueba); 1 depende de aclarar el contrato (#12); 1 es parcial (#14); 1 no es automatizable (#15). Además faltan los 18 de la categoría E.

## 6. Archivos que cambiarían en la siguiente fase

**Fase A, con las reglas actuales (sin tocar el contrato)**

| Archivo | Acción |
|---|---|
| `tools/validate_works.py` | nuevo: validador (reglas sin imágenes primero) |
| `tests/test_contrato_v2.py` | cambia: marcadores generados desde el catálogo; pruebas contra el validador |
| `tests/test_validador.py` y utilidades de fixtures | nuevos |
| `works/index.schema.json` | nuevo |
| `.gitignore`, `requirements-dev.txt` | nuevos |
| `README.md`, `ESTADO_PROYECTO.md`, `BITACORA.md`, `docs/plan-de-validacion-automatica.md` | corregir textos obsoletos (P1) |
| `INSTRUCCIONES_PARA_IA.md` | añadir el formato de bitácora por fase y la política de recursos de prueba |
| `works/work.schema.json` | **solo si apruebas D4**: ajuste de modo estricto sin cambio semántico |
| `.github/workflows/*` | **solo si apruebas CI** |

**Fase B, requiere aprobar cambios de contrato**

`docs/contrato-de-capas-y-work-json.md`, `works/work.schema.json`, un esquema nuevo para sprites/ciclos y partitura (por ejemplo `works/score.schema.json`), `docs/plan-de-validacion-automatica.md`, `ARQUITECTURA.md` y pruebas asociadas.

**No tocar en ninguna fase de esta etapa:** la imagen maestra, `src/`, capas, audio.

**Dependencias de recursos que solicito (no existen y no las voy a inventar):**
1. Imagen maestra limpia aprobada, con su dimensión nativa (P2).
2. Inventario de elementos del primer cuadro con tipo de movimiento deseado.
3. Primera versión de la partitura audiovisual (tempo, secciones, eventos).
4. Cualquier capa o sprite real, solo cuando exista y esté en revisión.

## 7. Pruebas propuestas y criterios de aceptación

**Fase A**

| # | Prueba | Criterio de aceptación |
|---|---|---|
| A1 | `python3 -I tests/test_contrato_v2.py` | 0 fallos; ninguna de las 45 pruebas actuales cambia de resultado |
| A2 | Por cada regla `ERROR` del plan | un caso negativo que falla **por esa regla** (el mensaje cita su ID) y un caso positivo |
| A3 | Prueba de mutación | quitar la regla hace fallar su prueba negativa (criterio ya escrito en el plan, §4.3) |
| A4 | Validador sobre fixtures | código de salida ≠ 0 con algún `ERROR`; cada mensaje lleva ID, ruta JSON y valor |
| A5 | Concordancia entre motores | los mismos casos (≥ 69) en `jsonschema` y en Ajv, **en modo estricto tras el ajuste**: 0 discrepancias |
| A6 | Fechas | exhaustivo en Python y en JavaScript: 0 discrepancias |
| A7 | Protección | maestra con blob y SHA-256 sin cambio; `git status` limpio tras ejecutar; ningún binario nuevo versionado |
| A8 | Documentos | 0 enlaces rotos y 0 frases de estado contradictorias con `git ls-remote` |
| A9 | Reproducibilidad | comando documentado, versiones fijadas, tiempo razonable (hoy ≈ 6 s) |

**Fase B**: ejemplos válidos e inválidos del modelo de sprites/ciclos/eventos que el esquema nuevo acepte y rechace según lo esperado, sin motor ni recursos finales.

**Fuera de esta etapa:** pruebas visuales y de rendimiento en iPad Safari y TCL 55Q650G, y composición contra la maestra con capas reales.

## 8. Propuesta ordenada

### 8.1 Decisiones que necesitan tu aprobación

| ID | Decisión | Recomendación |
|---|---|---|
| D1 | ¿La fusión del PR #2 significa que el contrato v2, el esquema, el plan y las pruebas quedan aprobados, o siguen siendo propuesta? | Registrar el estado que elijas en `ESTADO_PROYECTO.md` |
| D2 | **Maestra canónica:** ¿sigue siendo la imagen actual o se sustituirá por una maestra limpia? ¿La regla «exterior negro OLED» cambia píxeles de la maestra o solo el fondo de pantalla? | Congelar mediciones hasta decidir |
| D3 | **Cómo crece el modelo de datos** para sprites, ciclos de río, aleteo y eventos musicales: (a) enmienda aditiva del contrato v2; (b) esquema y documento aparte para ciclos y partitura, dejando v2 intacto; (c) esperar a la maestra | (b): no reabre v2 |
| D4 | Ajuste del esquema para modo estricto de Ajv, sin cambio semántico | Aprobar, con las pruebas actuales como red |
| D5 | Imágenes sintéticas generadas al ejecutar pruebas (nunca versionadas, nunca en `works/`) y `works/_demo/` | Permitir las primeras; no crear `_demo/` |
| D6 | Lenguaje del validador (Python con `jsonschema` y `Pillow`, o Node con Ajv) y si se activa CI | Python; CI después de la Fase A |
| D7 | Matriz explícita de canales por tipo de capa y ampliación del `kind` (casa, nube, roca, luna, murciélago) | Cerrarla antes de implementar MOV-1 y MOV-2 |
| D8 | Cuándo medir memoria y rendimiento para fijar `maxDecodedMiB` y los límites de movimiento; y Git LFS para PNG pesados | Decidir antes de la primera capa real |
| D9 | Corrección de textos obsoletos y formato de bitácora por fase en `INSTRUCCIONES_PARA_IA.md` | Aprobar |

### 8.2 Tareas que se pueden ejecutar con las reglas actuales (sin decidir nada de lo anterior)

1. Corregir los textos obsoletos de P1 y registrar el estado real (solo documentación).
2. Añadir `.gitignore` y `requirements-dev.txt`.
3. Generar los marcadores omitidos desde el catálogo del plan (49 reglas con marcador o prueba).
4. Escribir el validador de reglas sin imágenes: IDX, ESQ-3, MST-1 a MST-3, GEO-1, CAP-1 a CAP-7, MOV-1 (sin matriz: solo unicidad), MOV-3 a MOV-10, EST-2 a EST-6, ARC-1, ARC-3, ARC-6, ARC-7, DOC-1, con prueba negativa y de mutación por regla.
5. Crear `works/index.schema.json`.
6. Guardar en `tests/` la comprobación cruzada con Ajv y la de fechas en JavaScript que ejecuté hoy (hoy son scripts temporales).

### 8.3 Tareas bloqueadas hasta que decidas

| Tarea | Espera a |
|---|---|
| Reglas con PNG sintéticos (ARC-2, CAP-8, CAP-10, ARC-5) | D5 |
| Ajuste de modo estricto del esquema | D4 |
| MOV-2 y MOV-1 completos | D7 |
| Modelo de sprites, ciclos y eventos musicales | D2 y D3 |
| CI | D6 |
| Medición de `maxDecodedMiB` y límites reales | D8 y capas reales |

### 8.4 Fuera de esta fase

Motor, visor, controles, audio, aplicación Android, capas, sprites, música y cualquier cambio a la maestra.

## 9. Método y limitaciones de esta auditoría

- Las comprobaciones cruzadas (Ajv, fechas en JavaScript, sondeos de huecos, espectro y borde de la maestra) se ejecutaron con scripts temporales fuera del repositorio. No están versionados; la Fase A propone guardarlos.
- No pude instalar Ajv desde npm (el registro no se resuelve desde este entorno); usé una copia ya instalada en el sistema (8.18.0).
- Las medidas de resolución y de borde de la maestra son indicativas.
- No se ejecutó ningún validador (no existe), ninguna prueba en dispositivos ni ninguna composición contra la maestra.
