# Editor articulado de personajes — prototipo v0.4

**Ruta:** `prototype/character-editor-v01/index.html`  
**Estado:** prototipo incremental de estructura jerárquica, pivotes editables, límites de articulación y biblioteca de poses; no es el editor completo ni está validado en iPad.

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
- Pivote visible por pieza seleccionada, con marcador dorado arrastrable desde el lienzo.
- Ajuste numérico independiente de pivote X/Y; al cambiarlo, el editor compensa la posición para mantener la geometría visual en su sitio.
- Límites mínimo y máximo de rotación por pieza; el control de giro queda restringido al rango configurado.
- Los proyectos locales antiguos de versión 1 se migran al cargar, asignando pivote (0,0) y límites predeterminados de −180° a 180°.
- Añadir partes de brazo, pierna, rama, hojas y articulación; duplicar, eliminar y cambiar orden.
- Biblioteca de poses: guardar la configuración actual de todas las piezas con un nombre, seleccionar una pose, aplicarla con transición suave o eliminarla.
- Las poses almacenan posición X/Y, rotación y escala por pieza; no alteran la configuración estructural del rig ni los pivotes/límites.
- Las transiciones interpolan las transformaciones durante aproximadamente medio segundo y se cancelan al comenzar una edición manual.
- Las poses forman parte del proyecto, se conservan en el guardado local y se incluyen en el JSON exportado.
- Acciones coordinadas de prueba: saludo (brazo superior, antebrazo y mano), dos fases alternas de caminata (brazos, muslos, piernas inferiores y pies) y reposo. Las acciones parten del estado actual, cambian las articulaciones implicadas con una transición y pueden guardarse después como poses normales.
- Las acciones coordinadas solo están preparadas para el preset de personaje y requieren que existan las piezas con los identificadores esperados. No calculan IK ni resuelven automáticamente la posición final de la mano o el pie.
- Guardado en localStorage del navegador y exportación del proyecto como JSON.
- Restauración automática del último proyecto guardado en ese navegador.

## Modelo jerárquico

Cada elemento tiene identificador, nombre, tipo, posición local, pivote local X/Y, rotación actual, límites mínimo/máximo de rotación, escala, forma, material/color y referencia al padre. El render recorre recursivamente el árbol y anida cada pieza en el sistema de coordenadas de su padre. Por eso, al rotar una rama, sus hojas y ramitas hijas acompañan el movimiento; al mover el tronco, toda la copa se desplaza.

Esta es una primera estructura de articulación por piezas rígidas. Los límites son rangos angulares simples por pieza; todavía no hay cinemática inversa (IK), restricciones anatómicas entre varias articulaciones, huesos con curvas, skinning, pesos de vértices, mallas deformables, biblioteca de recursos ni sistema de materiales/texturas de producción.

## Limitaciones conocidas

- Los dibujos son formas vectoriales provisionales, no arte final ni texturas fotográficas de papel.
- El pivote puede moverse y limitar la rotación, pero todavía faltan zoom/pan, selección múltiple, guías, ajuste fino y controles visuales de límites articulares.
- El selector de padre permite cambiar jerarquías simples; falta una experiencia de reparentado visual con validaciones y feedback más completos.
- El guardado local depende del navegador y del almacenamiento disponible. La exportación JSON es la vía portátil de respaldo.
- No se ha probado aún en Safari, Chrome, Firefox u Opera en iPad.
- No se ha ejecutado una suite de pruebas automatizadas para esta interfaz.

## Siguiente trabajo

1. Validar en Safari del iPad el arrastre del pivote, la conservación de la posición visual, las acciones coordinadas y los límites de giro.
2. Corregir problemas táctiles o de transformación detectados.
3. Evolucionar las acciones de prueba hacia controles de cadena más precisos; estudiar IK 2D para posicionar mano/pie sin confundirlo con las poses actuales.
4. Incorporar recursos de imagen/textura de papel y recorte con bordes y sombras de calidad.
5. Después abordar deformación de malla y skinning, solo cuando la base jerárquica esté estable.

No adelantar escenas narrativas, timeline ni exportador en esta etapa.
