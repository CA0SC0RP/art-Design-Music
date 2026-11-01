# Auditoría de reutilización — motor de caricaturas para iPad

**Fecha:** 2026-11-01  
**Rama revisada:** `feature/living-paper-engine-foundation`  
**Alcance:** lectura de código y documentación existentes; no se modificó código ejecutable ni se realizaron pruebas visuales en iPad.

## 1. Conclusión

El motor experimental contiene piezas técnicas reutilizables, especialmente el renderizador PixiJS, el escenario 2D, transformaciones de objetos, jerarquías de articulación, trayectorias y controles de reproducción. Sin embargo, fue diseñado para geometría y animación de papel recortado. No es todavía un editor de caricaturas ni un sistema completo de personajes.

La decisión recomendada es conservarlo y extraer de forma gradual las partes genéricas, sin forzar el nuevo producto a usar papel, capas físicas, pliegues o deformación ambiental.

## 2. Componentes revisados

### 2.1 Base reutilizable

- `src/engine.js`: inicialización de PixiJS 8.10.1, escenario, ajuste de tamaño, ciclo de actualización, contenedores, transformaciones y pausa/velocidad. La clase `PaperPiece` mezcla esas funciones genéricas con materiales y dibujo de papel; conviene separar responsabilidades antes de reutilizarla.
- `src/motion.js`: trayectorias por puntos e interpolación suave. Puede servir como punto de partida para movimientos simples, aunque el nuevo editor necesitará keyframes y acciones.
- `src/rigging.js`: anclajes y articulaciones vinculadas a deformaciones. La jerarquía de articulaciones puede orientar el diseño de personajes, pero la implementación actual está ligada a mallas y pliegues de papel.
- `src/demo.js`: demuestra cómo conectar el escenario a controles HTML, seleccionar una pieza por identificador y modificar escala, rotación, profundidad y velocidad.
- `index.html` y `styles.css`: sirven como referencia de distribución de escenario e inspector adaptable. La interfaz actual es un laboratorio técnico muy cargado de parámetros, no una experiencia de creación narrativa.

### 2.2 Componentes específicos del proyecto anterior

No trasladar automáticamente al núcleo nuevo:

- `deformation.js`, `elastic.js`, `elastic-math.js`: deformación localizada y memoria elástica de superficies.
- `volume.js`, `volume-math.js`: iluminación y relieve aparente de pliegues.
- `edges.js`, `edge-math.js`: cantos y espesor de papel.
- `layers.js`, `layer-groups.js`, `layer-math.js`, `collision-math.js`: contacto, fricción y propagación entre hojas.
- `physics-mesh.js`: proxy de malla para simulación de superficies; no es un esqueleto de personaje.

Estos módulos se conservan en el repositorio. Podrían servir en el futuro para un estilo artístico específico, pero no son requisitos del editor general.

## 3. Prototipos existentes

- `prototype/level-01`: composición de cinco capas SVG, pausa y animación CSS.
- `prototype/level-02`: sprites SVG con trayectorias y ciclos independientes.
- `prototype/level-03`: múltiples familias de animaciones en una escena.
- `prototype/level-04` y `level-05`: escenas ambientales SVG con agua, viento, fauna, velocidad y pausa.

Son demostraciones de composición y movimiento. No incluyen edición directa de personajes, rigging de caricaturas, timeline narrativo, guardado de proyectos ni exportación de historias. No deben convertirse en la interfaz principal.

## 4. Capacidades confirmadas por lectura de código

- Existe inicialización de PixiJS desde CDN con versión fijada.
- Existe un escenario escalado para conservar una composición de referencia 16:9.
- Existen objetos en contenedores con posición, escala, rotación y orden.
- Existe actualización temporal y control de pausa/velocidad.
- Existe una interfaz de inspector con controles HTML.
- Existen pruebas unitarias para varias funciones matemáticas y módulos de malla.

La lectura de código no demuestra funcionamiento actual en Safari ni rendimiento en el iPad. Tampoco demuestra que el editor permita arrastrar elementos directamente en el escenario.

## 5. Capacidades que aún no existen en el producto nuevo

No se encontró una implementación completa de:

- selección y manipulación táctil directa de personajes en el escenario;
- sistema de personajes con huesos, pesos, skinning, poses reutilizables e IK;
- biblioteca de personajes y objetos;
- editor de expresiones y acciones;
- keyframes y pistas editables en una línea de tiempo;
- secuenciador de escenas y tomas;
- guardar, abrir y versionar proyectos de caricatura;
- deshacer/rehacer;
- edición narrativa asistida desde ChatGPT conectada al estado vivo del lienzo;
- audio narrativo por microhistoria;
- exportación final de vídeo.

## 6. Estrategia recomendada

1. Mantener el motor experimental y los prototipos sin borrarlos.
2. Separar un núcleo genérico de escenario y objetos de las funciones especializadas de papel.
3. Construir una prueba independiente de estudio visual para iPad, sin alterar el laboratorio anterior.
4. Implementar selección por toque y ratón sobre el escenario, arrastre, escala y rotación.
5. Incorporar un modelo de escena serializable y guardado/carga.
6. Añadir un personaje de prueba con jerarquía de articulaciones simple; validar primero poses y movimiento antes de abordar deformación avanzada.
7. Introducir timeline y escenas después de validar la edición básica.
8. Probar cada etapa en Safari del iPad antes de declarar compatibilidad.

PixiJS es un candidato razonable para la primera prueba porque ya está presente, pero la elección debe considerarse provisional hasta verificar interacción táctil, rendimiento y facilidad de exportación.

## 7. Próxima prueba funcional

La primera prueba debe ser pequeña y aislada:

- abrir un estudio web adaptable al iPad;
- mostrar un escenario y un personaje de prueba compuesto por partes simples;
- seleccionar el personaje tocándolo;
- moverlo arrastrándolo;
- cambiar escala y rotación desde controles visuales;
- reproducir y pausar una animación básica;
- guardar y recuperar la escena.

No se incorporarán todavía generadores de imágenes, servicios de IA, música, exportación de vídeo ni APIs pagadas.

## 8. Estado

**Auditoría documental completada.** No se modificó código ejecutable, no se ejecutaron pruebas de navegador y no se confirmó compatibilidad en iPad. La siguiente tarea es diseñar e implementar la primera prueba aislada de estudio visual.
