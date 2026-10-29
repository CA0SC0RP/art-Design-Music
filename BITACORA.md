# Cuadro Vivo — bitácora

## 2026-10-26 — Organización del trabajo
- Se acuerda evitar duplicar tareas entre asistentes.
- ChatGPT: dirección y producción visual, especificación y revisión de capas.
- Claude: arquitectura, motor, visor, audio, controles e integración.
- El usuario mantiene la aprobación creativa y técnica de decisiones importantes.
- No modificar `main` directamente ni reemplazar la imagen maestra sin autorización.

## 2026-10-26 — Propuesta técnica de Claude
- Propuesta: web modular, JavaScript y Canvas 2D; Web Audio y alternativa precalculada; definición `work.json` por obra; galería y posible contenedor Android TV futuro.
- Riesgos señalados: memoria con capas 4K, rendimiento en TCL, políticas de audio del navegador y necesidad de pruebas en dispositivos reales.
- Estado: propuesta, no implementación.

## 2026-10-26 — Contrato v2, esquema y plan de validación (propuesta en rama)
- Rama `contrato/capas-v2-esquema-y-validacion`, creada desde `main` (`f81b03c`). Es una propuesta pendiente de revisión; nada se ha integrado en `main`.
- Verificado en GitHub: la rama `preparacion/contrato-datos-y-protocolo` ya estaba integrada en `main` (PR #1). `main` no tenía `works/`, `src/`, audio ni capas.
- Verificado sobre la maestra: PNG RGB de 8 bits, 3840 × 2160, sin perfil de color; SHA-256 registrado en `README.md`. No se modificó.
- Comprobación visual de las cajas del paquete v0.1 contra la maestra (copia temporal, recortes al 100 %): la del sol no incluye el disco solar y la de aves deja fuera al menos otro grupo de 5; solo la del venado coincide de forma aproximada. Por eso las coordenadas deben medirse de nuevo (nota en `docs/auditoria-capas-v0-1.md`).
- Archivos nuevos: `works/index.json`, `works/work.schema.json`, `docs/plan-de-validacion-automatica.md`. Reescrito: `docs/contrato-de-capas-y-work-json.md`. Corregidos: `README.md`, `ESTADO_PROYECTO.md`. Retocados con notas o líneas puntuales: `INSTRUCCIONES_PARA_IA.md`, `ARQUITECTURA.md`, `docs/auditoria-capas-v0-1.md`, `docs/flujo-produccion-por-capas.md`, `docs/control-calidad-capas-composicion.md`, `docs/plan-de-separacion-de-capas.md`.
- Propuestas técnicas (pendientes de aprobación): `schemaVersion` 2; capas `fullCanvas` o `cropped` con `size`, `scale`, `placement` y `alphaBounds`; mediciones registradas con el hash de la maestra; vocabulario de estados único con aprobación del usuario atada al hash del archivo; zonas de reconstrucción `behind-element` y `frame-bleed`; canales de movimiento `translate`, `rotate`, `scale` y `opacity` con límites duros y por tipo de capa; marco único, fijo y con el `zIndex` más alto; `render.fit` siempre `contain`.
- Comprobaciones ejecutadas (ad hoc, en una carpeta temporal; el validador no existe y esas pruebas no se han guardado en el repositorio): `work.schema.json` es un esquema válido 2020-12; el ejemplo del contrato valida contra él; 26 casos negativos construidos a mano fueron rechazados por el esquema y 8 controles positivos fueron aceptados; sin claves duplicadas en los JSON; reglas del índice; 13 enlaces relativos entre documentos resuelven; la maestra es idéntica a la de `main`.
- No ejecutado: validador del plan (no está implementado), reglas entre campos (zIndex únicos, marco en primer plano, archivos y hashes), comprobaciones de píxeles y composición contra la maestra (no hay capas), pruebas en iPad Safari y en el TCL 55Q650G.
- El esquema solo comprueba forma y reglas locales; que `zIndex` sean únicos o que el marco esté arriba son reglas del plan, aún sin implementar.

## 2026-10-27 — Corrección técnica del contrato v2 (misma rama, sin PR ni cambios en `main`)
- Pedido del usuario tras revisar la propuesta: conservar la estructura y cerrar cinco huecos técnicos.
- Esquema (ejecutado en pruebas): `date` solo acepta fechas reales de calendario (patrón comparado con `datetime.date` para todos los días de 0001 a 9999, más `minLength`/`maxLength` 10 para rechazar el salto de línea final); `safeBounds` > 0 en cualquier eje exige `reconstruction.required: true`, al menos una zona y todas las zonas `aprobado`.
- Limitación de JSON Schema, documentada: no puede sumar ni comparar campos. Por eso `x + width ≤ 3840` e `y + height ≤ 2160` para todo rectángulo (GEO-1) y `opacity.min ≤ opacity.max` (MOV-10) son reglas del validador, **aún no implementado**. Las pruebas incluyen una comprobación de referencia mínima de ambas y un caso que muestra que el esquema solo las deja pasar.
- Nuevo `tests/test_contrato_v2.py`. Resultado real: 45 pruebas, 30 superadas, 15 omitidas (reglas pendientes), 0 fallos. Con el patrón de fecha antiguo fallan 10 pruebas y sin la regla de `safeBounds` fallan 6 (comprobado en una copia temporal).
- Sin cambios: imagen maestra (mismo SHA-256), capas, motor. Los límites de movimiento siguen siendo valores propuestos, pendientes de pruebas visuales y de rendimiento.

## Registro futuro
Anotar cada decisión aprobada, cambio de esquema, archivo creado, prueba ejecutada y limitación encontrada. Distinguir hechos verificados de propuestas. No registrar una operación como completada hasta verificar su resultado.

## 2026-10-27 — Dirección artística, sprites y música compuesta con la escena
- El usuario acordó que todas las obras deben parecer construidas con papel recortado, no óleo ni cartoon: cartulina visible, bordes recortados, sombras entre planos y profundidad artesanal. Tearaway es una referencia conceptual de materialidad, no para copiar diseños.
- Para el primer cuadro, marco ornamental dorado completo y fijo; exterior detrás del marco negro OLED puro (#000000), sin madera adicional.
- Se acuerda que todos los elementos puedan tener vida sutil: animales, plantas, agua/río, cascada, nubes, niebla, sol/luz, pájaros, casa y otros objetos de la escena cuando el movimiento sea coherente. No es una película ni una animación frenética.
- El plan visual debe combinar capas espaciales con sprites/hojas de poses y ciclos largos para elementos como el río. Cada objeto tendrá comportamiento, velocidad, fase y amplitud propios.
- La música será original y se diseña junto con cada cuadro. Referencias iniciales: ambient, lo-fi y chillout; cada obra puede variar de género y emoción. Tempo tentativo para el primer cuadro: alrededor de 72 BPM, pendiente de composición.
- La partitura audiovisual debe definir marcas temporales/eventos musicales para movimientos concretos y complementarse con análisis de audio suavizado. Evitar basarse solo en graves/agudos o activar objetos mecánicamente por frecuencia.
- Idea futura para otra obra: paisaje gótico con castillo lejano, niebla/humo de papel y murciélagos en vuelo, con música misteriosa. No forma parte del primer cuadro.
- Se creó la rama `direccion-artistica-musica-sprites-2026-10-27` desde `contrato/capas-v2-esquema-y-validacion` y el documento `docs/direccion-artistica-y-partitura-audiovisual.md`. Esta rama no está fusionada. No se generaron capas finales, sprites ni música.
- Siguiente: Claude lee toda la documentación, entrega una auditoría del estado real y propone/implementa solo un modelo técnico aislado para capas, sprites/ciclos y eventos musicales, sin tocar la maestra, sin afirmar que hay recursos finales y sin fusionar/desplegar.

## 2026-10-29 — Auditoría técnica del estado actual (sin cambios de contrato, esquema, pruebas ni código)
- **Fecha y objetivo:** 2026-10-29. Auditar el estado real del repositorio tras los cambios del 27-10 y proponer la siguiente fase. Fase de solo lectura, mediciones y documentación.
- **Rama y commit de partida:** `auditoria/estado-2026-10-29`, creada desde `main` en `e2c7399` (fusión del PR #2). Sin cambios pendientes al empezar.
- **Archivos creados o modificados:** nuevo `docs/auditoria-tecnica-2026-10-29.md`; modificados `ESTADO_PROYECTO.md` (sección de ramas y línea de pruebas) y esta bitácora. No se tocaron contrato, esquema, plan, índice, `tests/`, `README.md` ni la imagen maestra.
- **Cambios y motivo:** el informe contiene la auditoría y la propuesta de fase siguiente. `ESTADO_PROYECTO.md` se corrigió porque registraba `main` en `f81b03c` y las ramas del contrato y de dirección artística como no fusionadas; ambas están contenidas en `main`. Las entradas anteriores de esta bitácora y los textos obsoletos de `README.md:43` y `docs/plan-de-validacion-automatica.md:150` se dejan sin editar (el informe los lista en P1) hasta que lo apruebes.
- **Pruebas ejecutadas y resultados reales** (scripts temporales fuera del repositorio, salvo el primero):
  - `python3 -I tests/test_contrato_v2.py` sobre `e2c7399`: 45 pruebas, 30 superadas, 15 omitidas, 0 fallos, 4,05 s. Árbol limpio después.
  - Los 69 casos de las pruebas, con `jsonschema` 4.26.0 y con Ajv 8.18.0: 0 discrepancias de veredicto.
  - Patrón de fecha compilado como ECMAScript contra el calendario de JavaScript: 3 719 628 fechas, 0 discrepancias.
  - Ajv con `strict: true`: no compila (`strictRequired`). Con `strict: "log"`: compila con 31 avisos (6 `strictRequired`, 25 `strictTypes`).
  - 16 sondeos de huecos: el esquema acepta 14 documentos que violan reglas del plan aún sin implementar y rechaza 2 (canal `frames` y `kind` inexistente).
  - Mediciones indicativas sobre la maestra (resolución efectiva y borde exterior), sin modificarla; blob y SHA-256 idénticos.
- **No ejecutado:** validador (no existe), reglas entre campos, PNG reales, composición contra la maestra, pruebas en iPad Safari y TCL 55Q650G. No se pudo instalar Ajv desde npm (registro inalcanzable); se usó una copia preinstalada.
- **Problemas encontrados:** textos de estado contradictorios con el repositorio; maestra canónica sin confirmar; el contrato v2 no cubre sprites, ciclos, aleteo, eventos musicales ni el negro OLED; Ajv estricto no compila el esquema; 18 reglas del plan sin prueba ni marcador; sin `.gitignore` ni `requirements`.
- **Pendiente:** tus decisiones D1 a D9 del informe (§8.1). No se inicia la siguiente fase sin tu aprobación.
