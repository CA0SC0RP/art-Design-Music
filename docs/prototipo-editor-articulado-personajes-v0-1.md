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
- La lógica geométrica del solver IK sí cuenta con pruebas automatizadas en Node.js; la interfaz gráfica y sus interacciones aún no tienen pruebas de navegador ni validación física en iPad.

## Siguiente trabajo

1. Validar en Safari del iPad tanto toque/lápiz como mouse conectado: selección, arrastre de piezas y pivotes, objetivos IK, controles, sliders y bloqueo/liberación.
2. Corregir cualquier problema de respuesta táctil o precisión de puntero y añadir pruebas repetibles.
3. Validar en Safari del iPad el arrastre táctil de los cuatro objetivos, el bloqueo/liberación, el cambio de cadena, los límites y los objetivos fuera de alcance.
4. Corregir cualquier problema de coordenadas o respuesta del solver y añadir pruebas numéricas repetibles.
5. Mejorar restricciones anatómicas y coordinación de cadenas sin introducir deformación todavía.
6. Incorporar recursos de imagen/textura de papel y recorte con bordes y sombras de calidad.
7. Después abordar deformación de malla y skinning, cuando la base jerárquica e IK estén estables.

No adelantar escenas narrativas, timeline ni exportador en esta etapa.


## Iteración v0.9 — restricciones anatómicas iniciales del IK

- Se separó el cálculo geométrico de dos huesos en `prototype/character-editor-v01/ik-solver.js`, una función pura reutilizable y comprobable.
- El solver valida parámetros finitos, longitudes positivas, sentido de flexión y alcance geométrico antes de devolver ángulos. Los objetivos fuera de alcance o las soluciones que exceden los límites se rechazan sin modificar las articulaciones.
- Se introdujeron límites anatómicos iniciales conservadores: hombro/cadera dentro de ±165° y codo/rodilla con flexión direccional seleccionada, limitada a 150°. Los límites configurados individualmente en cada articulación siguen siendo respetados si son más restrictivos.
- Se añadió una suite sin dependencias externas en `tests/ik-solver.test.js` para objetivos alcanzables, ambos sentidos de flexión, alcance máximo, objetivo fuera de alcance, exceso de flexión, límites configurados y parámetros inválidos.
- Esta etapa mejora el solver rígido, pero no constituye un modelo anatómico universal ni incorpora colisiones, anatomía por personaje o deformación de malla. Los rangos deberán poder ajustarse por rig y tipo de personaje en una etapa posterior.
- La interfaz continúa en v0.8 mientras se valida esta mejora del motor; no se declara todavía una versión visual nueva ni una prueba en Safari/iPad.


## Iteración v0.9.1 — convención de coordenadas SVG y verificación del extremo IK

- Se corrigió el signo del ángulo horizontal objetivo: en el sistema de coordenadas SVG, una rotación positiva de un segmento inicialmente vertical desplaza su extremo hacia X negativo. El solver ahora calcula el ángulo objetivo con esa convención.
- Se añadió una prueba de cinemática directa que reconstruye la posición final del extremo a partir de los dos ángulos devueltos y comprueba que coincide con el objetivo solicitado, dentro de una tolerancia numérica de (10^{-6}), para ambos sentidos de flexión.
- La suite contiene ahora ocho pruebas automatizadas. Estas pruebas verifican el módulo matemático, no sustituyen la prueba visual del editor ni la validación táctil en Safari del iPad.
- Se conserva la etiqueta visual v0.8: este cambio corrige el motor IK sin presentar todavía una nueva versión de interfaz.



## Iteración v0.9.2 — robustez del alcance y cobertura geométrica

- Se corrigió el rechazo excesivo de objetivos cercanos al origen: el solver ahora admite objetivos dentro del alcance geométrico real, aunque su distancia sea menor que una unidad, y rechaza explícitamente la raíz singular cuando la orientación no está definida.
- Se validan los límites articulares configurados antes de calcular una solución; rangos invertidos o valores no finitos se rechazan con un mensaje específico.
- La suite amplió la reconstrucción de cinemática directa a ocho cuadrantes/posiciones y ambos sentidos de flexión, además de probar cadenas con longitudes desiguales cerca del origen y límites inválidos.
- La validación automatizada de esta iteración se ejecutó en GitHub Actions con Node.js. El paso de pruebas reportó éxito para el commit de la suite ampliada. Esto valida el módulo matemático, no el lienzo ni el comportamiento táctil en Safari.
- La etiqueta visual del editor permanece en v0.8 hasta completar validación real de interfaz; no se declara una nueva versión funcional.



## Iteración v0.9.3 — importación segura de proyectos JSON

- Se añadió la acción **Importar JSON** al encabezado del editor para volver a abrir proyectos exportados o transferidos entre navegadores/dispositivos.
- Se creó el módulo independiente `project-io.js`, que normaliza proyectos v1/v2 al formato actual y valida raíz, identificadores únicos, jerarquía sin ciclos, formas admitidas, colores, transformaciones, límites articulares y poses antes de sustituir el proyecto activo.
- Se limita la carga a archivos de hasta 10 MB y se escapa el texto importado antes de insertarlo en HTML. Se rechazan IDs inseguros y referencias inválidas para evitar que contenido JSON manipulado altere el marcado del editor.
- La importación no sobrescribe automáticamente el guardado local: después de cargar el archivo, el usuario puede pulsar **Guardar** para conservarlo en ese navegador.
- Se añadieron pruebas unitarias del normalizador y del escape HTML. El workflow comprueba sintaxis de ambos módulos, las pruebas de IK e importación, la sintaxis del JavaScript integrado y las referencias entre módulos.
- La automatización terminó correctamente. No se ha probado aún la selección del archivo ni la importación dentro de Safari/iPad; esa comprobación de interfaz sigue pendiente.



## Iteración v0.9.4 — reparentado sin saltos visuales

- Se añadió `rig-geometry.js` con cálculo de transformaciones mundiales acumuladas (posición, rotación y escala), incluyendo los pivotes de los padres.
- Al cambiar el padre desde el inspector, el editor calcula la nueva transformación local para conservar la posición, orientación y escala mundiales de la pieza y de sus descendientes.
- Se rechazan ciclos, padres inexistentes y cambios que exigirían superar los límites angulares de la articulación; en esos casos la jerarquía original permanece intacta.
- Se añadieron pruebas de preservación de transformaciones en jerarquías anidadas, pivotes, escalas y rotaciones, además de casos de ciclo y límites. GitHub Actions completó correctamente sintaxis, suites y comprobaciones de integración.
- La interacción visual del reparentado todavía debe validarse en Safari/iPad. No se declara aún la prueba táctil del editor.



## Iteración v0.9.5 — expresiones faciales guardables

- Se añadieron cejas y boca al preset de personaje, junto con cinco expresiones iniciales: neutral, alegre, triste, sorprendida y enojada. Cada expresión coordina inclinación de cejas, forma de la boca y escala de los ojos.
- Los proyectos antiguos que ya contienen una cabeza reciben los rasgos faciales que falten al cargarse; los nuevos presets los incluyen desde el inicio.
- La captura de poses ahora conserva también la forma de cada pieza, por lo que una expresión aplicada puede guardarse, exportarse e importarse como parte de una pose. Las transiciones cambian las formas discretas a mitad de la interpolación.
- El importador valida las formas faciales admitidas tanto en las piezas como en las poses.
- Se amplió la suite con una prueba de persistencia/validación de formas faciales. GitHub Actions completó correctamente todas las verificaciones.
- Estas expresiones son controles iniciales de demostración; todavía no hay un sistema de músculos faciales, morph targets, labios sincronizados ni editor de expresiones personalizadas.
