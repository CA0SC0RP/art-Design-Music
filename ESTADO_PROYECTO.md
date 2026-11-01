# Estado vigente — cambio de objetivo 2026-11-01

**Objetivo actual:** construir un estudio web para crear caricaturas animadas e historias audiovisuales, accesible desde Safari, Chrome y Firefox. El producto principal será el editor ejecutado en el navegador; la salida final será un vídeo exportado, no un APK. Cada cuadro/obra podrá ser una historia independiente. La interfaz se prioriza para iPad. ChatGPT es el único asistente de IA que modifica y revisa el código; no se delega a otros asistentes.

**Primera meta funcional:** abrir desde Safari en iPad un escenario editable; seleccionar un personaje u objeto; modificar posición y tamaño con controles visuales; reproducir una animación sencilla y revisar el resultado.

**Colaboración:** inicialmente el usuario describe cambios en el chat, ChatGPT modifica código en la rama autorizada y el usuario actualiza la vista previa en iPad. No existe todavía una conexión directa y continua entre ChatGPT y el lienzo activo. Un puente de edición en tiempo real es una posibilidad futura, no una función existente.

**Renderizado y audio:** el motor seguirá siendo necesario para calcular los fotogramas de cada historia y combinarlos con diálogo, música y efectos antes de codificar el vídeo. Se investigará primero la exportación local desde el navegador; no se activarán servicios remotos ni pagos sin autorización.

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
