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
- Movimiento heredado entre rama y hojas articuladas.

### Materiales de papel (prototipo)
- Presets: papel mate, cartulina, papel artesanal y papel translúcido.
- Grosor aparente mediante capas de sombra desplazadas.
- Borde recortado con contorno de material.
- Línea de luz sutil en el borde superior.
- Intensidad de sombra y grosor ajustables por pieza desde el inspector.

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
- `src/demo.js`: escena de prueba y controles.

## Prueba manual

Seleccionar una pieza y cambiar escala, rotación, profundidad, material, grosor y sombra. Probar las articulaciones, la flexión del tallo, la ondulación y el pliegue de la hoja de malla, además de pausa y velocidad global.

## Pendiente

- Máscara de recorte y textura externa para mallas de piezas de cualquier silueta; el prototipo actual usa una textura de prueba generada en el navegador.
- Articulaciones adicionales y controles de rig para alas, tallos, pétalos y otras piezas.
- Textura procedural o mapas de textura con control de escala.
- Importación de sprites transparentes y SVG externos.
- Deformación de malla y articulaciones.
- Luces y sombras más precisas entre capas.
- Serialización de escenas y editor visual.
- Pruebas en Safari iPad y Firefox; no declarar compatibilidad hasta probarlos.

## Criterios de calidad

1. Las propiedades de una pieza no alteran las demás.
2. El grosor aparente y la sombra permanecen coherentes con la pieza.
3. Cambiar material no reinicia la trayectoria ni la escena.
4. Las articulaciones respetan sus límites y transmiten el movimiento a sus piezas hijas.
5. Las tiras flexibles conservan continuidad geométrica durante la oscilación.
4. Los loops no saltan al completar el ciclo.
5. Los controles se mantienen utilizables en pantalla táctil.
