# Living Paper Engine

Primer prototipo del motor especializado en escenas de papel multicapa para Art Design Music.

## Objetivo de esta etapa

Construir una base reutilizable para componer piezas independientes y controlar:

- capas y orden de profundidad;
- transformación (posición, escala y rotación);
- sombras proyectadas entre piezas;
- movimiento mediante trayectorias y ciclos;
- velocidad global y selección de pieza.

Esta versión es un laboratorio técnico. Las formas vectoriales son geometría provisional, no ilustraciones finales ni sprites de producción.

## Tecnología inicial

- JavaScript con módulos ES.
- PixiJS 8 como renderer 2D acelerado por WebGL/WebGPU, con fallback administrado por PixiJS.
- GitHub Pages para publicar la demo.
- Sin APIs, servicios de IA, cuentas de pago ni recursos externos de pago.

La versión fija PixiJS 8.10.1 desde jsDelivr para evitar cambios inesperados. Más adelante se evaluará empaquetar la dependencia localmente si el flujo de construcción lo requiere.

## Estructura

- `index.html`: demo y controles.
- `styles.css`: interfaz.
- `src/engine.js`: escena, capas y piezas de papel.
- `src/motion.js`: trayectorias y ciclos.
- `src/demo.js`: escena de laboratorio y conexión de controles.

## Cómo probar

Abrir `index.html` mediante GitHub Pages o un servidor estático. Seleccionar una pieza y modificar escala, rotación, profundidad y velocidad. Pausar y reanudar para comprobar la continuidad.

## Límites conocidos

- El grosor, la textura y las sombras son aproximaciones visuales.
- La demo usa formas vectoriales temporales.
- No hay todavía deformación de malla, articulación avanzada, editor de escenas ni importador de sprites.
- La física no se simula: los comportamientos se controlan de forma determinista.

## Criterios de aceptación de la fundación

1. La escena se adapta al tamaño disponible.
2. Cada pieza conserva transformaciones independientes.
3. La profundidad cambia el orden visual y la escala aparente.
4. Las sombras se desplazan junto con su pieza.
5. Los movimientos pueden pausarse y continuar.
6. El control global modifica el ritmo sin romper los ciclos.
