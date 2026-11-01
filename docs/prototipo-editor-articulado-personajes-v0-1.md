# Editor articulado de personajes — prototipo v0.8

**Ruta:** `prototype/character-editor-v01/index.html`  
**Estado:** prototipo incremental de estructura jerárquica, pivotes editables, límites de articulación, biblioteca de poses e IK 2D con objetivos arrastrables; no es el editor completo ni está validado en iPad.

## Objetivo de esta iteración

Corregir la regla base de estilos de botones que había quedado fuera del selector CSS, sincronizar la etiqueta visible del prototipo con la versión documentada y reforzar el área del lienzo para evitar selección accidental de texto/gestos del navegador durante la manipulación táctil. Se añadieron indicadores de foco visibles para controles operables por teclado.

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
- Las acciones coordinadas solo están preparadas para el preset de personaje y requieren que existan las piezas con los identificadores esperados.
- Primera implementación de cinemática inversa 2D (IK) de dos segmentos: selector de brazo/pierna izquierdo/derecho, objetivo X/Y relativo al torso y elección del lado de flexión. Resuelve geométricamente los ángulos del segmento proximal y distal y los aplica con transición suave.
- El solver comprueba el alcance geométrico, los límites angulares y los requisitos de esta primera versión: escala 1, pivotes neutros y segmentos alineados en X. Si el objetivo está fuera del alcance o la solución supera los límites, informa al usuario en vez de aplicar una solución inválida.
- **Entrada dual táctil y mouse:** el editor usa Pointer Events para unificar toque, lápiz/puntero y mouse. La interacción táctil es prioritaria en iPad; en pantallas con puntero grueso se amplían los controles, campos, sliders y filas de jerarquía para facilitar el toque. Con mouse se conserva la interacción de precisión y feedback hover. El lienzo reserva los gestos de puntero para manipular objetos; zoom/pan multitáctil aún no está implementado.
- Manipulación directa del objetivo IK en el lienzo: marcador táctil/arrastrable para la mano o el pie de la cadena seleccionada. El solver recalcula las dos articulaciones durante el arrastre y conserva la última solución válida si el puntero lleva el objetivo fuera del alcance o de los límites.
- Controles para fijar y liberar el objetivo. Al fijarlo, el marcador queda bloqueado frente al arrastre; al liberarlo, vuelve a ser manipulable. Cada cadena conserva su propio objetivo durante la sesión al cambiar de brazo/pierna.
- Los objetivos IK se mantienen en memoria durante la sesión y se expresan en coordenadas locales del torso; todavía no se guardan en el proyecto ni en el JSON. Fijar el objetivo no equivale aún a una restricción de contacto mundial independiente del torso.
- Esta IK sigue siendo una primera solución rígida de dos huesos; no hay detección de colisiones, restricciones anatómicas avanzadas, blending de múltiples cadenas ni deformación de malla.
- Guardado en localStorage del navegador y exportación del proyecto como JSON.
- Restauración automática del último proyecto guardado en ese navegador.

## Modelo jerárquico

Cada elemento tiene identificador, nombre, tipo, posición local, pivote local X/Y, rotación actual, límites mínimo/máximo de rotación, escala, forma, material/color y referencia al padre. El render recorre recursivamente el árbol y anida cada pieza en el sistema de coordenadas de su padre. Por eso, al rotar una rama, sus hojas y ramitas hijas acompañan el movimiento; al mover el tronco, toda la copa se desplaza.

Esta es una primera estructura de articulación por piezas rígidas con IK geométrica de dos segmentos. Los límites son rangos angulares simples por pieza; todavía no hay restricciones anatómicas coordinadas entre varias articulaciones, huesos con curvas, skinning, pesos de vértices, mallas deformables, biblioteca de recursos ni sistema de materiales/texturas de producción.

## Limitaciones conocidas

- Los dibujos son formas vectoriales provisionales, no arte final ni texturas fotográficas de papel.
- El pivote puede moverse y limitar la rotación; faltan zoom/pan, selección múltiple, guías, ajuste fino y controles visuales de límites articulares.
- La manipulación directa IK depende de la geometría y precondiciones del solver inicial: dos segmentos rígidos, pivotes neutros, escala unitaria y alineación esperada. No resuelve colisiones ni garantiza contacto anatómico en todas las poses.
- El selector de padre permite cambiar jerarquías simples; falta una experiencia de reparentado visual con validaciones y feedback más completos.
- El guardado local depende del navegador y del almacenamiento disponible. La exportación JSON es la vía portátil de respaldo.
- No se ha probado aún en Safari, Chrome, Firefox u Opera en iPad.
- No se ha ejecutado una suite de pruebas automatizadas para esta interfaz.

## Siguiente trabajo

1. Validar en Safari del iPad tanto toque/lápiz como mouse conectado: selección, arrastre de piezas y pivotes, objetivos IK, controles, sliders y bloqueo/liberación.
2. Corregir cualquier problema de respuesta táctil o precisión de puntero y añadir pruebas repetibles.
3. Validar en Safari del iPad el arrastre táctil de los cuatro objetivos, el bloqueo/liberación, el cambio de cadena, los límites y los objetivos fuera de alcance.
4. Corregir cualquier problema de coordenadas o respuesta del solver y añadir pruebas numéricas repetibles.
5. Mejorar restricciones anatómicas y coordinación de cadenas sin introducir deformación todavía.
6. Incorporar recursos de imagen/textura de papel y recorte con bordes y sombras de calidad.
7. Después abordar deformación de malla y skinning, cuando la base jerárquica e IK estén estables.

No adelantar escenas narrativas, timeline ni exportador en esta etapa.
