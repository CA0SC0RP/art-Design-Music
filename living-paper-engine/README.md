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

La malla demostrativa usa una silueta y textura generadas en el navegador; sirve para validar deformación y UV, no es un recurso artístico final. Las zonas de influencia se expresan en coordenadas normalizadas de la superficie y usan una caída suave para evitar límites abruptos. Los anclajes conservan regiones de la malla cerca de su posición de reposo. Los pliegues aplican una aproximación geométrica 2D a un lado de una línea de pliegue; la capa de volumen añade iluminación y sombra mapeadas para sugerir relieve; los cantos levantados añaden una banda visible de espesor variable. La curvatura elástica es una aproximación 2D amortiguada, no un solver físico ni geometría 3D.

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
- `src/layers.js`: acoplamiento de movimiento y contacto visual entre capas.
- `src/layer-groups.js`: creación de pilas multicapa y propagación en cascada.
- `src/layer.test.mjs`: pruebas de interacción y topología de grupos multicapa.
- `src/layer-math.js`: funciones puras para transferencia de desplazamiento, caída de influencia y desplazamiento de sombra de contacto.
- `src/layer.test.mjs`: pruebas de interacción matemática entre capas.
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
