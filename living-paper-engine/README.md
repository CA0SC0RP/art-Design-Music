# Living Paper Engine

Motor experimental reutilizable para cuadros vivos de papel multicapa de Art Design Music.

## Desarrollo actual

### Fundación
- Escena 2D con PixiJS 8.10.1.
- Piezas independientes con posición, escala, rotación y profundidad.
- Orden de composición por plano.
- Trayectoria de movimiento determinista, loop y velocidad global.
- Articulaciones jerárquicas con pivotes, límites angulares y oscilación controlada.
- Flexión continua de tiras de papel mediante una curva segmentada, sin juntas visibles.
- Deformación de superficies con malla 2D subdividida, textura RGBA y vértices animados.
- Influencias localizadas con centro, radio suave, intensidad y curvatura independiente.
- Actualización explícita de los búferes de vértices de PixiJS durante la deformación.
- Anclajes normalizados con radio e intensidad para fijar zonas de una pieza.
- Múltiples pliegues por superficie, combinados por suma de desplazamientos sobre la misma geometría de referencia.
- Articulaciones enlazables a pliegues: el ángulo de una junta controla la flexión de una zona de la malla.
- Anclajes y pliegues se recalculan en cada actualización sin acumular deriva.
- Sombras sincronizadas con la geometría final después de aplicar los pliegues y anclajes.
- Relieve aparente mediante una segunda malla de iluminación ligada a los mismos vértices y UV.
- Bandas de luz y sombra ajustables según ángulo, orientación e intensidad de cada pliegue.
- La iluminación se actualiza cuando cambian los pliegues y sigue la deformación de la superficie.
- Cantos levantados dibujados sobre la línea del pliegue con espesor aparente variable.
- Sombra propia del canto y reflejo fino para separar visualmente la cara superior y el borde expuesto.
- Perfil de espesor dependiente del ángulo, el lado del pliegue y la intensidad configurada.
- Grupos de capas coordinadas con propagación en cascada de deformación desde la hoja frontal a las posteriores; cada tramo admite acoplamiento y separación independientes.
- Contacto geométrico 2.5D entre superficies trianguladas: cada vértice receptor busca el punto más cercano sobre los triángulos transformados de la capa fuente, aunque ambas mallas tengan distinta resolución.
- Fricción tangencial configurable entre hojas, con distancia de reposo y corrección máxima limitada para controlar deslizamiento relativo.
- Diagnóstico en vivo del número de vértices en contacto y penetración media para ajustar el comportamiento sin confundirlo con una simulación física completa.
- Pruebas independientes de fricción: oposición al deslizamiento, límite de corrección y desactivación. Añade fricción tangencial opcional para amortiguar deslizamientos con corrección limitada y distancia tangencial de reposo configurable.
- La respuesta de contacto se recalcula desde la geometría base en cada cuadro, actualiza las sombras y evita acumular correcciones.
- Detección adicional de intersecciones entre aristas de la malla receptora y triángulos de la fuente; detecta cruces aunque ambos extremos de una arista queden fuera del triángulo.
- Las correcciones de cruce se distribuyen entre los dos vértices de la arista, se limitan por la rigidez y el máximo de corrección, y se convierten desde espacio mundial a coordenadas locales.
- El diagnóstico registra aristas examinadas e intersecciones detectadas, además de vértices activos, triángulos y penetración media.
- Las consultas consideran posición, escala y rotación acumuladas de contenedores anidados, convierten la corrección de mundo a coordenadas locales y descartan candidatos fuera del radio de búsqueda.
- La malla conserva su silueta normalizada; las celdas triangulares completamente externas a la silueta no participan en el contacto.
- El inspector muestra vértices activos, triángulos consultados y penetración media, y permite ajustar el radio de búsqueda.
- Interacción entre superficies superpuestas: transferencia de deformación, separación ajustable y respuesta de sombra por contacto suave, con control independiente de presión y desplazamiento local de sombra según la separación y el movimiento relativo.
- Curvatura continua de superficie con campo suave de desplazamiento y dirección configurable.
- Memoria elástica por vértice con velocidad persistente, rigidez y amortiguación configurables.
- Recuperación progresiva al retirar la curvatura, sin acumular desplazamiento entre cuadros.
- Las zonas ancladas reducen la movilidad de la respuesta elástica.
- Movimiento heredado entre rama y hojas articuladas.

### Materiales de papel (prototipo)
- Presets: papel mate, cartulina, papel artesanal y papel translúcido.
- Grosor aparente mediante capas de sombra desplazadas.
- Borde recortado con contorno de material.
- Línea de luz sutil en el borde superior.
- Intensidad de sombra y grosor ajustables por pieza desde el inspector.

La malla demostrativa usa una silueta y textura generadas en el navegador; sirve para validar deformación y UV, no es un recurso artístico final. Las zonas de influencia se expresan en coordenadas normalizadas de la superficie y usan una caída suave para evitar límites abruptos. Los anclajes conservan regiones de la malla cerca de su posición de reposo. Los pliegues aplican una aproximación geométrica 2D a un lado de una línea de pliegue; la capa de volumen añade iluminación y sombra mapeadas para sugerir relieve; los cantos levantados añaden una banda visible de espesor variable. La curvatura elástica es una aproximación 2D amortiguada. El contacto entre capas consulta la superficie triangular transformada de la hoja fuente para cada vértice de la hoja receptora, con separación proyectada sobre una normal configurable y fricción tangencial opcional. Es una aproximación 2.5D de contacto de superficies; no es un solver volumétrico, FEM ni geometría 3D. El recorte de silueta descarta triángulos completamente externos, aunque la frontera de cada celda todavía es una aproximación de la máscara.

Los materiales son aproximaciones 2D deliberadas. Aún no representan simulación física ni una malla 3D de papel.

## Tecnología

- JavaScript ES modules.
- PixiJS 8.10.1 desde CDN con versión fija.
- SVG/PNG y texturas podrán incorporarse en siguientes etapas.
- GitHub Pages para la demo; GitHub Actions para validaciones.
- Sin APIs, servicios externos de IA ni dependencias de pago.

## Estructura

- `index.html`: laboratorio interactivo.
- `styles.css`: interfaz adaptable.
- `src/engine.js`: renderer, piezas, materiales y geometría paper-cut.
- `src/motion.js`: trayectorias y loops.
- `src/rigging.js`: anclajes, pliegues múltiples y vínculos con articulaciones.
- `src/volume.js`: iluminación y sombra mapeadas para volumen aparente.
- `src/volume-math.js`: cálculo puro de perfiles de luz y sombra.
- `src/volume.test.mjs`: pruebas de perfiles de volumen.
- `src/edges.js`: cantos levantados y espesor aparente.
- `src/edge-math.js`: perfiles de espesor.
- `src/edge.test.mjs`: pruebas de cantos.
- `src/layers.js`: acoplamiento de movimiento, restricciones de contacto y respuesta visual entre capas.
- `src/collision-math.js`: transformaciones afines, triangulación de mallas, búsqueda de punto más cercano, máscara de silueta, intersección segmento-triángulo y restricciones normal/tangencial.
- `src/layer-groups.js`: creación de pilas multicapa y propagación en cascada.
- `src/layer.test.mjs`: pruebas de interacción y topología de grupos multicapa.
- `src/layer-math.js`: funciones puras para transferencia de desplazamiento, caída de influencia y desplazamiento de sombra de contacto.
- `src/layer.test.mjs`: pruebas de interacción, grupos multicapa y contacto.
- `src/elastic.js`: curvatura continua y memoria elástica.
- `src/elastic-math.js`: funciones puras de curvatura y resorte.
- `src/elastic.test.mjs`: pruebas de recuperación y anclajes.
- `src/demo.js`: escena de prueba y controles.

## Prueba manual

Seleccionar una pieza y cambiar escala, rotación, profundidad, material, grosor y sombra. Probar las articulaciones, la flexión del tallo, la ondulación, la influencia localizada, el anclaje, los pliegues, el volumen, el espesor del canto, la curvatura elástica y la propagación entre tres hojas, además de pausa y velocidad global.

## Pendiente

- Máscara de recorte y textura externa para mallas de piezas de cualquier silueta; el prototipo actual usa una textura de prueba generada en el navegador.
- Articulaciones adicionales y controles de rig para alas, tallos, pétalos y otras piezas.
- Textura procedural o mapas de textura con control de escala.
- Importación de sprites transparentes y SVG externos.
- Máscara de recorte basada en la silueta real y mapas de influencia pintables.
- Mapas de influencia pintables y múltiples líneas de pliegue por pieza.
- Control de tensión y curvatura de pliegue calibrado con recursos de papel reales.
- Luces y sombras más precisas entre capas y calibración visual del contacto con recursos de papel reales.
- Serialización de escenas y editor visual.
- Pruebas en Safari iPad y Firefox; no declarar compatibilidad hasta probarlos.

## Criterios de calidad

1. Las propiedades de una pieza no alteran las demás.
2. El grosor aparente y la sombra permanecen coherentes con la pieza.
3. Cambiar material no reinicia la trayectoria ni la escena.
4. Las articulaciones respetan sus límites y transmiten el movimiento a sus piezas hijas.
5. Las tiras flexibles conservan continuidad geométrica durante la oscilación.
4. Los loops no saltan al completar el ciclo.
6. Las influencias localizadas no producen saltos en el borde de su radio.
7. Los controles se mantienen utilizables en pantalla táctil.


## Auditoría final antes de declarar el motor terminado

La finalización requiere una auditoría separada del desarrollo por módulos. Debe incluir:
- revisión de arquitectura, imports, ciclo de actualización, destrucción y limpieza de recursos;
- pruebas unitarias y de integración para mallas con distinta resolución, siluetas, transformaciones anidadas, rotación, escala, contacto y ausencia de deriva;
- pruebas de regresión de materiales, deformación, anclajes, pliegues, volumen, cantos, articulaciones, grupos y loops;
- inspección de buffers y compatibilidad real de PixiJS 8.10.1;
- medición de rendimiento con mallas pequeñas, medias y grandes;
- pruebas manuales en Firefox, Safari/iPad y Chrome, con registro explícito de resultados;
- corrección de hallazgos y repetición completa de CI antes de considerar cerrada la fundación.

Un CI exitoso no sustituye la inspección visual ni demuestra compatibilidad en todos los navegadores.


## Estabilidad del contacto entre capas

- La malla receptora se actualiza una sola vez por frame; el solver aplica después la respuesta de contacto, evitando ejecutar dos veces los wrappers de deformación con estado.
- La deformación transmitida entre capas se convierte de espacio local fuente a espacio mundo y después a espacio local receptor. Así se conserva la dirección y magnitud ante rotación y escalas distintas.
- La detección de proximidad usa un índice espacial uniforme reconstruido por pasada de contacto. Las consultas de vértices y aristas examinan solo triángulos candidatos cuyas cajas se solapan con la región consultada. Las búsquedas reutilizan marcas numéricas por consulta en lugar de crear un `Set` para cada vértice o arista.
- La telemetría distingue triángulos fuente, candidatos de vértices, candidatos de aristas, cruces detectados y celdas ocupadas.
- Las pruebas automatizadas cubren consultas espaciales, coordenadas negativas, una sola actualización por frame, transformaciones anidadas y propagación de deformación con rotación/escala.
- Esto mejora la estabilidad y el coste de búsqueda, pero no sustituye la auditoría de rendimiento ni las pruebas visuales en Firefox, Chrome y Safari/iPad.

- La detección de aristas contempla cruces ordinarios, contactos en extremos y solapamientos colineales entre bordes coincidentes.
- La máscara de silueta conserva triángulos que cruzan parcialmente su contorno; el recorte sigue siendo una aproximación por celdas y no un clipping poligonal exacto.
- Los triángulos degenerados se consultan mediante sus segmentos, y las correcciones de arista no cuentan extremos que reciben contribución nula.

- La implementación de malla está fijada explícitamente a `MeshSimple.autoUpdate = true` para la superficie, la sombra y el overlay de volumen. Se verificó contra el código fuente oficial de PixiJS v8.10.1: el setter `vertices` actualiza el buffer de posiciones y el modo automático ejecuta su actualización durante el render.


## Estabilidad prolongada y rendimiento

- La regresión de contacto ejecuta 2,400 frames consecutivos (20 ciclos de movimiento a 120 Hz) y comprueba que no aparezcan valores no finitos ni deriva al cerrar el ciclo.
- El benchmark de contacto ejecuta el solver completo con mallas cuadradas de 32×32, 64×64 y 128×128 celdas, incluyendo construcción de triángulos, índice espacial, consultas de vértices, pruebas de aristas y aplicación de correcciones.
- GitHub Actions registra el tiempo medio por frame, número de vértices/aristas/triángulos, celdas del índice, candidatos promedio y desplazamiento máximo.
- Las pruebas exigen que el broadphase reduzca las consultas a menos del 10% de la búsqueda cartesiana vértice×triángulo y arista×triángulo, y que las correcciones permanezcan acotadas.
- Los tiempos de CI son mediciones de referencia en un runner de GitHub, no una garantía de FPS en móviles o tabletas. Falta medir en navegador y dispositivo real.

### Referencia de rendimiento (CI #217)

En la ejecución de referencia del 1 de noviembre de 2026, con el solver completo y la detección de aristas activada:

| Malla | Vértices examinados | Aristas examinadas | Triángulos fuente | Tiempo medio por frame |
|---|---:|---:|---:|---:|
| 32×32 | 1,024 | 3,072 | 2,048 | 6.78 ms |
| 64×64 | 4,096 | 12,288 | 8,192 | 21.59 ms |
| 128×128 | 16,384 | 49,152 | 32,768 | 100.60 ms |

Estos valores pertenecen al runner de GitHub y varían con el hardware y la carga. No son mediciones de Safari ni de iPad. La tendencia confirma un coste creciente con la resolución: 32×32 es la referencia más adecuada para interacción fluida; 64×64 requiere validación en el dispositivo objetivo; 128×128 no debe asumirse como tiempo real todavía. Se mantiene la detección completa de aristas para no sacrificar contactos finos por velocidad.
