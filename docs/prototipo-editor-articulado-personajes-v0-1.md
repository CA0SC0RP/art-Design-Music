# Editor articulado de personajes — prototipo v0.1

**Ruta:** `prototype/character-editor-v01/index.html`  
**Estado:** primera prueba funcional de estructura jerárquica y manipulación; no es el editor completo ni está validada en iPad.

## Objetivo de esta iteración

Comprobar que el proyecto puede representar un objeto complejo como un árbol de piezas 2D vinculadas por pivotes. Cada pieza puede transformarse y sus descendientes heredan el movimiento/rotación de sus padres.

## Contenido del prototipo

- Escena SVG adaptable con estética inicial de papel por capas, sombras y fondos.
- Dos estructuras de ejemplo: personaje articulado y árbol.
- Personaje separado en torso, cuello, cabeza, cabello, ojos, brazos, antebrazos, manos, muslos, piernas y pies.
- Árbol separado en tronco, ramas, ramitas y grupos de hojas.
- Jerarquía visual de partes con selección desde el árbol o el lienzo.
- Manipulación directa por arrastre, convirtiendo las coordenadas al espacio local del padre para que las piezas hijas puedan moverse correctamente incluso bajo transformaciones jerárquicas.
- Inspector de nombre, posición X/Y, rotación, escala y relación padre.
- Añadir partes de brazo, pierna, rama, hojas y articulación; duplicar, eliminar y cambiar orden.
- Guardado en localStorage del navegador y exportación del proyecto como JSON.
- Restauración automática del último proyecto guardado en ese navegador.

## Modelo jerárquico

Cada elemento tiene identificador, nombre, tipo, posición local, rotación, escala, forma, material/color y referencia al padre. El render recorre recursivamente el árbol y anida cada pieza en el sistema de coordenadas de su padre. Por eso, al rotar una rama, sus hojas y ramitas hijas acompañan el movimiento; al mover el tronco, toda la copa se desplaza.

Esta es una primera estructura de articulación por piezas rígidas. Todavía no implementa skinning, pesos de vértices, IK, mallas deformables, curvas de huesos, límites articulares, poses guardadas, biblioteca de recursos ni sistema de materiales/texturas de producción.

## Limitaciones conocidas

- Los dibujos son formas vectoriales provisionales, no arte final ni texturas fotográficas de papel.
- El arrastre y las coordenadas son una prueba inicial; faltan herramientas avanzadas de pivote, zoom/pan, selección múltiple, guías y ajuste fino.
- El selector de padre permite cambiar jerarquías simples; falta una experiencia de reparentado visual con validaciones y feedback más completos.
- El guardado local depende del navegador y del almacenamiento disponible. La exportación JSON es la vía portátil de respaldo.
- No se ha probado aún en Safari, Chrome, Firefox u Opera en iPad.
- No se ha ejecutado una suite de pruebas automatizadas para esta interfaz.

## Siguiente trabajo

1. Validar interacción táctil real en iPad.
2. Mejorar pivotes y articulaciones: mostrar el punto de giro, moverlo visualmente y establecer límites.
3. Crear poses y controles de pose reutilizables.
4. Incorporar recursos de imagen/textura de papel y recorte con bordes y sombras de calidad.
5. Después abordar deformación de malla y skinning, solo cuando la base jerárquica esté estable.

No adelantar escenas narrativas, timeline ni exportador en esta etapa.
