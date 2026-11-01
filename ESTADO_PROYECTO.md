
**Decisiones vigentes aprobadas el 2026-11-01:** la estética del producto es papel artesanal recortado 2D con profundidad, perspectiva y texturas de alta calidad; el editor completo de personajes es la primera prioridad. Codespaces se reserva para desarrollo y el iPad será el objetivo de renderizado local, sin servidores de render. Safari será el navegador de referencia inicial y se buscará compatibilidad con Chrome, Firefox y Opera en iPad. Objetivo de salida: 4K UHD y 24/30 fps; 10-bit/HDR10 y códecs concretos quedan sujetos a pruebas. Detalle: `docs/decisiones-editor-personajes-y-render-local-2026-11-01.md`.


**Requisito permanente de interacción del editor (2026-11-01):** interfaz táctil prioritaria para iPad y compatibilidad simultánea con mouse/puntero. Las herramientas principales deben poder operarse con dedo o mouse; los controles táctiles tendrán áreas de toque amplias y la interacción con mouse conservará precisión. El prototipo v0.7 refuerza esta base mediante Pointer Events y estilos adaptados a puntero grueso. La compatibilidad real aún debe validarse en Safari con pantalla táctil y mouse conectado.

# Estado vigente — cambio de objetivo 2026-11-01

**Objetivo actual:** construir un estudio web para crear caricaturas digitales y microhistorias audiovisuales con estética de papel artesanal recortado en 2D, profundidad, perspectiva y texturas de alta calidad. Safari en iPad será el navegador de referencia inicial; se buscará compatibilidad con Chrome, Firefox y Opera en iPad. El producto principal será el editor web y la salida final será vídeo. ChatGPT es el único asistente de IA que modifica y revisa el código.

**Primera prioridad de producto:** completar un editor visual potente de personajes con partes, jerarquías, rig/huesos, deformación, texturas, poses y expresiones. Después se construirán escenas y animación, líneas de tiempo, renderizador local y exportación de vídeo. El prototipo actual de escenario es solo una prueba técnica inicial.

**Colaboración:** inicialmente el usuario describe cambios en el chat, ChatGPT modifica código en la rama autorizada y el usuario actualiza la vista previa en iPad. No existe todavía una conexión directa y continua entre ChatGPT y el lienzo activo. Un puente de edición en tiempo real es una posibilidad futura, no una función existente.

**Renderizado y audio:** Codespaces se utilizará para desarrollar; el iPad será el objetivo de edición y renderizado local. El renderizador deberá calcular los fotogramas y codificar el vídeo en el dispositivo, sin depender de servidores GPU ni granjas de renderizado. Objetivo visual de salida: 4K UHD a 24/30 fps; 10-bit/HDR10 y códecs concretos quedan sujetos a pruebas. No se activarán servicios remotos ni pagos.

**Decisiones vigentes:** `docs/decisiones-editor-personajes-y-render-local-2026-11-01.md`.

**Documentos vigentes:**
- Visión del estudio web y exportación de vídeo: docs/vision-estudio-web-y-exportacion-de-caricaturas-2026-11-01.md
- Investigación de Umamo y decisión de arquitectura: docs/investigacion-umamo-y-decision-arquitectura-2026-11-01.md
- Dirección de producto: docs/direccion-motor-caricaturas-ipad.md
- Arquitectura inicial: ARQUITECTURA.md
- Instrucciones de trabajo: INSTRUCCIONES_PARA_IA.md
- Resumen del repositorio: README.md

**Documentos archivados o marcados como obsoletos:** contrato v2 de capas, plan de validación anterior y dirección artística anterior.

**Estado de transición:** la auditoría técnica del 2026-10-29 queda cerrada como registro histórico del diseño anterior. El contrato v2 no está aprobado para el motor de caricaturas. La partitura audiovisual de Mountains That Breathe queda obsoleta para la planificación activa. Los documentos, prototipos y recursos antiguos se conservan como antecedentes hasta clasificarlos; no se borran.

**Auditoría de reutilización completada:** docs/auditoria-reutilizacion-motor-caricaturas-ipad-2026-11-01.md. Se confirma que el laboratorio PixiJS, el escenario 2D, las transformaciones, la pausa/velocidad, algunas trayectorias y la jerarquía experimental pueden servir como base parcial. Las funciones de pliegues, papel, contacto entre hojas, cantos y volumen son específicas del proyecto anterior. Los prototipos 01–05 son demostraciones ambientales, no editores de caricaturas.

**Trabajo de desarrollo nuevo:** existe una primera prueba aislada en `prototype/caricature-studio-v01/index.html`. Incluye escenario SVG adaptable, personaje geométrico provisional, selección y arrastre por toque, controles de escala/rotación y movimiento sencillo con reproducción/pausa. Es un prototipo técnico, no el editor completo; todavía no se ha probado en navegador ni en Safari del iPad. Siguiente paso: abrirlo desde Codespaces y validar la interacción táctil en el dispositivo.

---

# Cuadro Vivo — estado del proyecto

**Estado:** preparación. El contrato de capas v2, el esquema de datos y el plan de validación siguen siendo propuestas pendientes de revisión del usuario. No hay motor, visor, validador, capas finales, sprites finales ni audio final. No declarar nada de eso como implementado.

**Actualizar este archivo al fusionar cualquier rama:** contiene datos que cambian (commits, ramas).

## Visión
Experiencia de arte visual en movimiento basada en cuadros de papel recortado, con profundidad ambiental, color intenso y música compuesta junto con la escena. Primera obra: **Mountains That Breathe / Montañas en armonía**. Objetivo futuro: galería de ocho obras. Primera plataforma: prototipo web, probado en Safari del iPad; Android TV es una etapa posterior.

## Responsabilidades
- ChatGPT: dirección visual, diseño y especificación musical, producción/revisión de recursos visuales y partitura audiovisual.
- Claude: arquitectura, motor, visor, sistema de animación, audio, controles, integración y pruebas técnicas.
- Usuario: decisiones creativas y aprobación de recursos y entregas.

## Estado de ramas verificado el 29-10-2026
- `main` está en `e2c7399`: fusión del PR #2 por `CA0SC0RP` el 27-10-2026 a las 14:18 (-0600). Incluye el contrato v2, `works/work.schema.json`, `works/index.json`, `docs/plan-de-validacion-automatica.md`, `tests/test_contrato_v2.py` y `docs/direccion-artistica-y-partitura-audiovisual.md`.
- Contenidas en `main`: `contrato/capas-v2-esquema-y-validacion` (`b137906`), `direccion-artistica-musica-sprites-2026-10-27` (`1fc7bea`) y `preparacion/contrato-datos-y-protocolo` (`cebbe47`).
- El contrato v2, el esquema y el plan siguen documentados como propuesta. La fusión los integró en `main`, pero no consta una aprobación explícita del usuario (decisión D1 en `docs/auditoria-tecnica-2026-10-29.md`).
- `auditoria/estado-2026-10-29` (desde `e2c7399`): auditoría técnica y propuesta de fase siguiente. No fusionada; espera revisión.
- Volver a verificar GitHub antes de afirmar que este estado sigue igual.

## Maestra original
El registro anterior identifica la imagen maestra como PNG RGB de 8 bits, 3840 × 2160, sin perfil de color incrustado; SHA-256 registrado: `d216046d9f78331c5372f867afc56a90a7b9f9659e27e026b28a89958cf2cfdc`. No sobrescribirla ni modificarla. Verificar que el archivo y el hash coincidan antes de usarlo para medir o producir capas.

## Estado técnico registrado anteriormente
- Propuesta: web modular, HTML/CSS/JavaScript y Canvas 2D como primer prototipo; audio mediante Web Audio/análisis en tiempo real y posibilidad de datos precalculados.
- Repetidas el 29-10-2026 sobre `main` (`e2c7399`): 45 pruebas, 30 superadas, 15 omitidas, 0 fallos. Los 15 marcadores omitidos son funciones vacías; además, 18 reglas del catálogo del plan no tienen prueba ni marcador (`docs/auditoria-tecnica-2026-10-29.md`, §2).
- No hay constancia verificada de un validador, motor, visor, pruebas con PNG de capas reales, audio final o pruebas reales en iPad/televisor.
- No reutilizar automáticamente coordenadas del paquete preliminar v0.1: volver a medir sobre la maestra real.

## Decisiones creativas acordadas el 27-10-2026
- Todas las escenas, sin excepción, deben parecer hechas de papel recortado: animales, plantas, agua, sol, cielo, nubes, niebla/humo, casas, rocas y elementos atmosféricos.
- Referencia de materialidad: diorama/teatro de papel en capas, bordes recortados, textura de cartulina, sombras y profundidad; no estilo cartoon ni apariencia de óleo. Inspiración conceptual en la materialidad de Tearaway sin copiar sus diseños.
- La escena maestra objetivo es panorámica 16:9, con objetivo de 3840×2160 y alta nitidez; comprobar la resolución real del archivo.
- Marco ornamental dorado completo y fijo. El exterior detrás del marco debe ser negro OLED puro (#000000), sin madera adicional.
- Todo elemento visible debe tener algún movimiento sutil cuando sea visualmente coherente. Usar capas de profundidad, sprites/secuencias de poses y ciclos largos cuando corresponda; no hacer que todo se mueva a la vez ni de forma frenética.
- El agua/río tendrá un ciclo continuo y fluido; cascada, niebla, nubes, árboles, animales, aves y luz podrán tener ritmos y fases independientes.
- La música se diseña para cada obra y junto con su comportamiento visual. Referencias iniciales: ambient, lo-fi, chillout; se puede variar por cuadro. Tempo tentativo del primer cuadro ~72 BPM, sujeto a composición y aprobación.
- La sincronización combinará eventos/marcas temporales derivados de la composición con análisis de audio suavizado. No depender solo de detección de graves/agudos ni mapear automáticamente un sonido a un objeto.
- Idea futura: cuadro gótico con castillo distante, niebla y murciélagos; no forma parte de la primera obra.

## Próximos pasos
1. Revisar la dirección creativa documentada en `docs/direccion-artistica-y-partitura-audiovisual.md`.
2. Preparar/aprobar una imagen maestra limpia del primer cuadro antes de cortar capas. La lámina conceptual con paneles no es la maestra final.
3. Crear inventario de elementos y tipos de animación, medir coordenadas sobre la maestra y definir reconstrucciones necesarias.
4. Diseñar música y partitura audiovisual en paralelo con el inventario de movimientos.
5. Claude puede avanzar con auditoría técnica, modelo de datos para sprites/ciclos/eventos musicales y pruebas de concepto sin alterar la maestra ni afirmar que los recursos finales existen.
6. Mantener cambios en ramas; no fusionar ni desplegar sin aprobación.
7. Auditoría entregada el 29-10-2026 (`docs/auditoria-tecnica-2026-10-29.md`). Falta tu respuesta a las decisiones D1 a D9 antes de iniciar la siguiente fase.


## Actualización — 2026-11-01: inicio del prototipo de cinco capas
- Rama de trabajo: `prototipo/prueba-cinco-capas-01`, creada desde `auditoria/estado-2026-10-29`. `main` no se modificó.
- Se inició el Nivel 01 con cinco recursos SVG provisionales e independientes: cielo, montañas, bosque, río y primer plano. Cada archivo se carga por separado; la composición usa cinco planos con orden de profundidad y movimientos suaves con duraciones distintas.
- Se añadió un control para pausar/reanudar el movimiento y soporte para `prefers-reduced-motion`.
- Se añadió `prototype/level-01/README.md` con el alcance y el protocolo de validación.
- Se añadió `docs/politica-de-recursos-visuales.md`, que define cómo incorporar recursos propios, aportados por el usuario, externos con licencia verificada y generados con IA; también define el tratamiento de capas, sprites, hojas de sprites y secuencias de poses.
- Los recursos de esta prueba son vectores originales y desechables. No se usan imágenes externas, la imagen maestra, sprites finales ni audio.
- **Estado de validación:** archivos creados en GitHub; todavía no se ha ejecutado en un navegador ni probado en el iPad. No declarar la prueba funcional hasta completar esa comprobación.
- Siguiente paso técnico: habilitar una forma verificable de abrir el prototipo desde Safari (sitio estático o alternativa equivalente), revisar la carga y los movimientos, y registrar resultados antes de pasar al Nivel 02.

- Se añadió `.github/workflows/prototipo-cinco-capas.yml` para publicar la carpeta del prototipo con GitHub Pages al recibir cambios en esta rama. La API de Actions consultada aún no muestra ejecuciones; la publicación no está confirmada y la URL pública no se considera disponible hasta verificar una ejecución exitosa.


## Actualización — corrección de movimiento interno del prototipo
- Tras el reporte de que la escena seguía estática, se inspeccionaron los archivos reales de la rama. Se confirmó que nubes y estrellas eran figuras SVG sin animación y que el río solo tenía formas y trazos estáticos; el CSS anterior movía planos completos, no sus elementos internos.
- Se modificó `prototype/level-01/assets/01-cielo.svg`: nubes con desplazamiento lento independiente y estrellas con parpadeo escalonado.
- Se modificó `prototype/level-01/assets/04-rio.svg`: reflejos y trazos superficiales con desplazamiento continuo y pulsos de opacidad.
- `main` y la imagen maestra permanecen intactos. No se han probado todavía estas animaciones en Safari del iPad; queda pendiente comprobar la publicación nueva y la reproducción real.


## Actualización — 2026-11-01: validación reportada y prueba de sprites
- El usuario confirmó que el prototipo del Nivel 01 sí muestra movimiento en Firefox. Por tanto, la prueba de cinco capas y de animaciones internas queda validada visualmente por reporte del usuario en Firefox.
- Chrome sigue presentando un problema de visualización según el usuario; no se ha aislado si se debe a caché, compatibilidad o renderizado. Safari en iPad aún no se ha comprobado.
- Se creó `prototype/level-02/index.html`, una prueba aislada con 14 sprites vectoriales provisionales e independientes: 3 aves con vuelo y aleteo, 4 mariposas con desplazamiento y batido de alas, 4 hojas en caída/rotación y 3 peces con nado y cambio de dirección. Incluye control de pausa/reanudación y respeto por movimiento reducido.
- Se amplió el workflow de GitHub Pages para conservar el Nivel 01 en la raíz y publicar el Nivel 02 en `/level-02/`. La publicación de esta nueva versión queda pendiente de que Actions termine correctamente.
- Esta segunda prueba mide comportamiento, independencia de ciclos y carga de varios sprites; no usa recursos finales, imagen maestra, música ni servicios de generación. No modifica `main` ni genera gastos.
- Próxima validación: abrir `/level-02/` en Firefox y comprobar que los 14 elementos se mueven de forma independiente; después revisar fluidez y legibilidad en Safari del iPad. No avanzar aún a los recursos definitivos.


## Actualización — 2026-11-01: Nivel 03, escena viva avanzada
- A petición del usuario se añadió una tercera prueba más compleja en `prototype/level-03/index.html`, manteniendo las pruebas anteriores disponibles.
- La escena reúne 12 estrellas con parpadeos escalonados, luna con brillo variable, dos grupos de nubes a velocidades distintas, 3 aves con trayectorias y aleteo, 5 luciérnagas, 2 mariposas, 3 hojas en caída, árboles con balanceo, cascada con textura animada, corrientes y ondas de río, y 2 peces con nado y cambio de dirección.
- Incluye pausa/reanudación y control global de velocidad mediante variable CSS; JavaScript se limita a esos controles. Se respeta la preferencia de movimiento reducido.
- Se amplió GitHub Pages para publicar el Nivel 03 en `/level-03/`, conservando raíz/Nivel 01 y `/level-02/`. Ejecución y publicación quedan pendientes de verificación.
- Es una prueba técnica con SVG provisionales; no es arte final ni incorpora audio, imagen maestra o generación externa. No se modificó `main` ni se incurrió en gastos.
- Próximo paso: abrir Nivel 03 en Firefox y validar movimiento, pausa, velocidad y fluidez; luego Safari en iPad. Chrome continúa como incidencia separada.


## Actualización — 2026-11-01: Nivel 04, Ecosistema vivo
- A petición del usuario se creó `prototype/level-04/index.html` con una escena panorámica de bosque, montañas, cascada, río y vegetación.
- La prueba incorpora planos de profundidad y bruma; nubes, copas, ramas, hojas y flores con oscilaciones de viento; 3 aves con vuelo y aleteo; cascada, bruma, dos corrientes de río, reflejos y ondas; 2 peces con nado y cola animada; mariposas y luciérnagas.
- Conserva el control global de velocidad (0.5×–1.8×) y pausa/reanudación. El deslizador cambia duración de ciclos, no posiciones iniciales.
- Se creó `prototype/level-04/README.md` y se amplió el workflow para publicar esta prueba en `/level-04/`, sin retirar los niveles anteriores.
- Recursos SVG provisionales, sin imagen maestra, arte final, audio, servicios externos ni gastos. No se modificó `main`.
- **Validación pendiente:** confirmar GitHub Actions/Pages y probar visualmente la escena, el control de velocidad, la pausa y el rendimiento en Firefox y Safari del iPad. No declarar la prueba aprobada hasta recibir esa comprobación.


## Actualización — 2026-11-01: Nivel 05, Ecosistema reactivo
- A petición del usuario se creó `prototype/level-05/index.html` como una nueva escena SVG provisional 16:9.
- La prueba incorpora viento escalonado en copas, ramas y pastos; semillas transportadas por el viento; rayos de luz y sombra móvil de nubes; cascada, dos patrones de corriente del río, reflejos y ondas; aves, mariposas, luciérnagas y peces; planos de profundidad y bruma.
- Se conservan pausa/reanudación y control global de velocidad de 0.5× a 1.8×. El control modifica las duraciones de los ciclos, no las posiciones de los elementos.
- Se añadieron `prototype/level-05/README.md` y publicación de GitHub Pages en `/level-05/`, manteniendo niveles 01–04.
- Se codificó continuidad de los patrones del río desplazando cada dash pattern por su periodo completo (106 y 142 unidades), corriente siempre en el mismo sentido; las aves y semillas se atenúan antes de reiniciar, y las ondas se desvanecen con desfases. Es una intención técnica que todavía requiere revisión visual del usuario.
- Se corrigieron las duraciones CSS de las animaciones de agua a unidades de tiempo (segundos) antes de publicar.
- Los recursos siguen siendo SVG vectoriales provisionales. No se usa imagen maestra, arte final, audio, servicios externos ni gasto. No se modificó `main`.
- **Validación pendiente:** comprobar ejecución de Actions y publicación; después revisar en Firefox y Safari del iPad composición, continuidad de loops, movimiento, velocidad, pausa y rendimiento. No declarar aprobado hasta recibir la comprobación visual del usuario.

**Avance técnico 2026-11-01:** creado `prototype/character-editor-v01/index.html`, primer prototipo de editor jerárquico con presets de personaje y árbol, piezas seleccionables, rotación/escala/posición, relaciones padre-hijo, añadir/duplicar/eliminar piezas, guardado local y exportación JSON. Es una prueba inicial, no el editor completo; falta validar en iPad y desarrollar pivotes visibles, poses, skinning/deformación y texturas de producción. Documento: `docs/prototipo-editor-articulado-personajes-v0-1.md`.


## Actualización — 2026-11-01: pivotes y articulaciones del editor de personajes
- El prototipo `prototype/character-editor-v01/index.html` avanza a v0.2: pivote visible y arrastrable, ajuste X/Y, compensación de posición para conservar la geometría, límites mínimo/máximo de giro por pieza y pivotes iniciales en cabeza/cuello.
- Se mantiene carga compatible con proyectos v1 y se guardan/exportan proyectos con esquema v2.
- Código con validación estática de sintaxis JavaScript y comprobación de IDs del DOM: sin errores de sintaxis, IDs duplicados ni referencias a IDs inexistentes.
- La validación estática no sustituye ejecutar el editor: aún falta probar en navegador, especialmente arrastre táctil y rotación en Safari del iPad.
- No se modificó `main`, no hubo merge, PR ni despliegue; no se instalaron dependencias ni hubo gastos.


## Actualización — 2026-11-01: biblioteca de poses reutilizables v0.3
- Se añadió al editor una biblioteca de poses por proyecto: captura la posición X/Y, rotación y escala de todas las piezas con un nombre elegido por el usuario.
- Se puede seleccionar una pose guardada, aplicarla mediante transición interpolada de aproximadamente 520 ms y eliminarla.
- Las poses se guardan junto al proyecto en localStorage y se incluyen en el JSON exportado. Los proyectos antiguos sin biblioteca continúan cargando con una lista vacía.
- La transición se interrumpe al iniciar manipulación manual, para que el usuario recupere el control del personaje.
- Se actualizó el documento técnico del editor.
- Verificación estática: sintaxis JavaScript correcta en esta versión. No se ha ejecutado la interfaz en navegador ni validado la interacción táctil en iPad.
- No se modificó `main`, no hubo merge, PR, despliegue, dependencias nuevas ni gastos.


## Actualización — 2026-11-01: acciones coordinadas del rig v0.4
- Se añadieron acciones de prueba para saludo, dos fases alternas de caminata y reposo. Cada acción coordina rotaciones de varias piezas de la cadena (brazo, antebrazo, mano; muslo, pierna inferior y pie) y se aplica con la transición de poses existente.
- Las acciones parten del estado actual del personaje y pueden guardarse después como poses normales. Solo están preparadas para el preset Personaje y requieren los identificadores de piezas previstos.
- No es IK: no calcula automáticamente la posición de la mano o el pie, ni resuelve restricciones entre articulaciones. La siguiente mejora será validar las acciones en Safari/iPad y diseñar controles de cadena, antes de introducir IK 2D.
- Código: `prototype/character-editor-v01/index.html`; documento actualizado: `docs/prototipo-editor-articulado-personajes-v0-1.md`.
- No se modificó `main`, no hubo merge, PR, despliegue, dependencias nuevas ni gastos. No se ha probado la interfaz en navegador ni en iPad.


## Actualización — 2026-11-01: primera cinemática inversa 2D v0.5
- Se incorporó un solver geométrico de dos segmentos para las cuatro cadenas del preset Personaje: brazo izquierdo/derecho y pierna izquierda/derecha.
- El usuario elige la cadena, define un objetivo X/Y relativo al torso y selecciona el lado de flexión. El solver calcula las rotaciones de los dos segmentos y las aplica mediante la transición existente.
- Se valida alcance, límites angulares, pivotes neutros, escala unitaria y alineación de segmentos. Si no se cumplen los requisitos, se muestra un mensaje y no se aplica la solución.
- Es IK 2D rígida inicial; no hay todavía arrastre del objetivo, colisiones, restricciones anatómicas avanzadas ni skinning/deformación de malla.
- Código: `prototype/character-editor-v01/index.html`; documentación: `docs/prototipo-editor-articulado-personajes-v0-1.md`.
- Commit de código: `3c2d7366a4ae316dcb9b7efe87504f5eeb186c4c`.
- Verificación estática: sintaxis JavaScript correcta, sin IDs duplicados ni referencias DOM inexistentes. No se ha ejecutado la interfaz en navegador ni validado el solver visualmente en Safari/iPad.
- No se modificó `main`, no hubo merge, PR, despliegue, dependencias nuevas ni gastos.


## Actualización — 2026-11-01: editor articulado v0.6
- El editor de personajes avanzó a v0.6 con objetivos IK arrastrables directamente en el lienzo, recálculo durante el gesto y controles de fijar/liberar. Los objetivos se conservan por cadena durante la sesión, pero aún no se serializan en el proyecto.
- El detalle técnico y las limitaciones están en `docs/prototipo-editor-articulado-personajes-v0-1.md`.
- Se verificó estáticamente la sintaxis JavaScript, la ausencia de IDs DOM duplicados y la ausencia de referencias a IDs inexistentes. No se ejecutó navegador ni se probó en Safari/iPad; la interacción táctil sigue pendiente de validación real.
- Rama de trabajo: `feature/living-paper-engine-foundation`. No se modificó `main`, no hubo merge, PR ni despliegue; no se añadieron dependencias ni gastos.
- Próximo paso: validación manual de las cuatro cadenas IK, los límites, el alcance, los dos sentidos de flexión y el bloqueo/liberación en Safari del iPad.


## Iteración v0.8 — preparación de validación táctil

- Se corrigió la regla CSS base de botones: parte de sus propiedades había quedado fuera del selector, por lo que no se aplicaban correctamente borde, color, radio y relleno.
- Se sincronizó la etiqueta visible del editor a v0.8; el encabezado mostraba v0.6 aunque la documentación ya describía v0.7.
- Se reforzó el lienzo para evitar selección accidental de texto y desplazamiento de overscroll durante la manipulación, conservando `touch-action:none` en el SVG para que los gestos de edición se reciban como Pointer Events.
- Se añadieron estilos de foco visible para botones, campos y selectores.
- **Verificación estática:** JavaScript pasó compilación sintáctica con `new Function`; no se encontraron IDs DOM duplicados; balance de llaves CSS revisado. No se ejecutó navegador ni se probó todavía en Safari del iPad.
- **Siguiente paso:** prueba táctil manual en Safari: seleccionar y mover piezas, arrastrar pivotes y los cuatro objetivos IK, fijar/liberar, usar sliders, guardar y exportar JSON. Mouse queda para una validación posterior.


## Actualización 2026-11-01 — IK con restricciones anatómicas iniciales

- El solver geométrico se extrajo a `prototype/character-editor-v01/ik-solver.js` para separar cálculo y presentación.
- Se añadieron límites iniciales conservadores para hombro/cadera (±165°) y flexión direccional de codo/rodilla (hasta 150°), respetando límites articulares más restrictivos configurados en cada pieza.
- Las soluciones inválidas se rechazan antes de cambiar el rig; el estado de la última pose válida se conserva.
- Se añadió `tests/ik-solver.test.js` con pruebas de alcance, flexión en ambos sentidos, límites y parámetros inválidos. La suite está incorporada al repositorio; su ejecución en Codespaces queda pendiente de confirmación.
- La interfaz no se ha probado en Safari/iPad. La validación táctil sigue pendiente y tiene prioridad antes de ampliar la deformación.



## Actualización — 2026-11-01: robustez del solver IK v0.9.2
- El solver admite ahora objetivos cercanos al origen cuando están dentro del alcance geométrico real y rechaza el caso singular de distancia cero.
- Se validan límites articulares invertidos y valores no finitos antes de devolver una solución.
- La suite cubre reconstrucción del extremo en ocho cuadrantes para ambos sentidos de flexión, longitudes desiguales y límites inválidos.
- GitHub Actions completó con éxito la suite ampliada. Esto no equivale a una prueba del editor en navegador ni a validación táctil en Safari/iPad.
- La interfaz continúa etiquetada v0.8 hasta completar su validación funcional en el dispositivo.



## Actualización — 2026-11-01: importación de proyectos JSON
- El editor incorpora **Importar JSON** para recuperar proyectos exportados y transferirlos entre dispositivos/navegadores.
- El módulo de importación normaliza formatos v1/v2 y valida estructura, jerarquía, identificadores, formas, colores, transformaciones y poses. Los archivos mayores de 10 MB se rechazan y el texto importado se escapa antes de insertarse en HTML.
- Se amplió GitHub Actions: validación sintáctica de módulos, 26 pruebas unitarias entre IK, importación, geometría jerárquica y expresiones faciales, comprobación de sintaxis del JavaScript integrado y revisión de integración. La ejecución del workflow terminó correctamente.
- Falta probar el flujo real de selección e importación de archivo en Safari del iPad; la validación automatizada no sustituye esa prueba.



## Actualización — 2026-11-01: reparentado con conservación de transformación
- El selector de padre ahora utiliza un módulo geométrico que conserva posición, rotación y escala mundiales al cambiar una pieza de lugar en la jerarquía, incluyendo los pivotes y transformaciones acumuladas de sus padres.
- Se rechazan ciclos, padres inexistentes y cambios incompatibles con los límites angulares configurados.
- Se añadieron pruebas automatizadas de jerarquías anidadas y preservación de descendientes. GitHub Actions completó las pruebas y comprobaciones de integración correctamente.
- La interfaz aún requiere validación visual/táctil en Safari del iPad.



## Actualización — 2026-11-01: expresiones faciales iniciales
- El preset Personaje incorpora cejas y boca y permite aplicar cinco expresiones: neutral, alegre, triste, sorprendida y enojada.
- Las expresiones pueden guardarse como poses. El formato de pose conserva también la forma de cada pieza y el importador valida las formas faciales admitidas.
- Los proyectos antiguos con cabeza reciben los rasgos faciales faltantes al cargarse.
- La suite automatizada suma 25 pruebas entre IK, importación, geometría jerárquica y persistencia de expresiones. GitHub Actions completó correctamente sintaxis, pruebas e integración.
- Es un primer sistema de expresiones; no incorpora morph targets ni sincronización labial. Falta la validación visual/táctil en Safari del iPad.



## Actualización — 2026-11-01: papel y controles de transformación
- Las piezas vectoriales ahora combinan sombra proyectada y grano SVG tenue para una primera aproximación a la materialidad de papel. El efecto es provisional y aún debe inspeccionarse visualmente en navegador.
- Se ampliaron los rangos de posición y escala del inspector para facilitar rigs con jerarquías y transformaciones acumuladas.
- La suite se mantiene en 25 pruebas automatizadas; los últimos cambios de filtro y controles requieren completar su ejecución CI y validación visual en Safari/iPad.



## Actualización — 2026-11-01: validación del guardado local
- Los proyectos recuperados de `localStorage` ahora se validan antes de sustituir el preset inicial. Se conserva la migración de formatos v1/v2 y de poses antiguas sin forma facial.
- La suite alcanza 26 pruebas automatizadas y el workflow de GitHub Actions completó correctamente sintaxis, pruebas e integración.
- Falta comprobar manualmente en Safari/iPad el ciclo guardar, recargar, exportar e importar.



## Actualización — 2026-11-01: núcleo inicial de skinning 2D
- Se creó `prototype/character-editor-v01/mesh-skinning.js`, un módulo independiente para deformar vértices 2D mediante Linear Blend Skinning, con matrices afines, matrices de referencia/actuales y hasta cuatro influencias normalizadas por vértice.
- Límites defensivos iniciales: 50.000 vértices, 100 huesos y cuatro influencias. Se validan matrices, pesos, coordenadas y referencias antes de deformar; no se modifica la malla original.
- La suite queda en 55 pruebas automatizadas (12 IK, 13 importación/migración, 6 geometría jerárquica, 12 skinning y 12 modelo de malla). El módulo todavía no está conectado a la interfaz; falta diseñar la edición visual de malla y pesos y validarla en Safari/iPad.
- El prototipo se identifica ahora como v0.9.8. No es todavía alfa/beta formal ni versión 1.0.



### Complemento — matrices mundiales del rig
- `rig-geometry.js` expone matrices afines mundiales que acumulan traslación, rotación, escala y pivotes de cada pieza. Estas matrices sirven como entrada coherente para el cálculo de deformación entre pose de referencia y pose actual.
- Se añadieron dos pruebas de matrices mundiales; la suite queda en 38 pruebas automatizadas. GitHub Actions completó la ejecución correctamente.



## Actualización — 2026-11-01: edición visual de malla v0.9.9
- El inspector permite crear/eliminar cuadrículas trianguladas, seleccionar/arrastrar vértices y asignar influencia a huesos mediante un control de peso.
- Las mallas forman parte de cada pieza y se conservan al guardar localmente y exportar/importar JSON. La importación valida topología, referencias de huesos y pesos.
- Limitación importante: el wireframe y la edición de pesos ya son visibles, pero todavía no deforman la silueta vectorial del personaje. Falta conectar el skinning al renderizado de la geometría real. La malla inicial tampoco sigue todavía el contorno de cada silueta.
- Suite automatizada: 50 pruebas. La prueba física táctil en Safari/iPad sigue pendiente; no se afirma validación de navegador real.



### Complemento — previsualización de deformación del wireframe
- La malla captura matrices de referencia relativas a su hueso dueño. Al mover articulaciones, se calculan matrices actuales del rig y se aplica skinning a los vértices del wireframe. Los nuevos huesos reciben su referencia al asignarles peso.
- La importación/exportación conserva y valida esas matrices. Suite: 51 pruebas automatizadas, con ejecución completa satisfactoria en GitHub Actions.
- Limitación pendiente: el wireframe sí se deforma con el rig, pero la silueta vectorial original aún no se transforma por triángulos. Tampoco se ha probado en Safari/iPad físico.



## Actualización — 2026-11-01: deformación de silueta v0.9.10
- El inspector incorpora un pincel de pesos con radio ajustable y caída suave, operable mediante toque y arrastre.
- Se añadió mapeo afín por triángulo y renderizado de fragmentos SVG recortados por la malla, con transformación según el skinning del rig. El objetivo es deformar la silueta visible y no solo el wireframe.
- Se ajustaron dimensiones iniciales de malla a las siluetas aproximadas de las piezas y se optimizó el guardado de matrices de referencia para incluir solo huesos influyentes.
- Suite: 55 pruebas automatizadas. La integración de fragmentos y el último cambio de matrices reducidas pasaron GitHub Actions; las 55 pruebas, la sintaxis de módulos y el JavaScript integrado finalizaron correctamente.
- Sin prueba visual de navegador ni Safari/iPad físico todavía. Revisar artefactos en uniones triangulares y rendimiento antes de considerar estable la deformación.



## Actualización — 2026-11-01: consistencia y rendimiento de malla v0.9.11
- El pincel ahora captura la matriz de referencia de un hueso nuevo antes de pintar su influencia, tanto al iniciar el trazo como al continuarlo.
- Se incorporó caché por render para matrices mundiales del rig y vértices deformados; el caché se invalida al iniciar cada render.
- Se añadieron dos pruebas geométricas: continuidad de vértices compartidos entre triángulos y traslación afín pura. Suite total: 58 pruebas automatizadas. Se añadió cobertura de persistencia de matrices de referencia para varios huesos influyentes.
- El workflow incluye comprobaciones estructurales de pincel, captura de matrices, caché y mapeo triangular.
- Pendiente: revisión visual en navegador de bordes y costuras, evaluación de rendimiento con personajes complejos y prueba táctil en Safari/iPad físico. No se afirma que esas validaciones se hayan realizado.

- Se corrigió la persistencia de mensajes del pincel/edición: el render ya no sobrescribe inmediatamente la confirmación de pesos aplicados. El mensaje se limpia al cambiar de pieza, vértice o eliminar la malla.


## Actualización — 2026-11-01: v0.9.12, mitigación de juntas en deformación de malla
- Se añadió `expandTriangle()` al módulo de skinning para expandir de forma controlada los triángulos de recorte en coordenadas locales, rechazando datos inválidos y triángulos degenerados.
- `meshDeformedShape()` aplica una expansión conservadora de 0.35 unidades al clip de cada cara. La transformación afín sigue calculándose sobre los vértices originales; la expansión solo busca cubrir posibles líneas finas causadas por antialiasing entre fragmentos vecinos.
- Se añadieron dos pruebas automatizadas para expansión válida, preservación de la malla original y rechazo de entradas inválidas.
- **Pendiente de evaluación visual:** comprobar si disminuyen las juntas sin generar halos, solapamientos visibles o pérdida de detalle en bordes. No se considera validado en Safari/iPad.
- Se mantiene la rama `feature/living-paper-engine-foundation`; no se modifica `main`.
