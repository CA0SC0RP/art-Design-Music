# Living Paper — flujo de producción de microhistorias

Estado: diseño de trabajo aprobado; los tiempos son objetivos iniciales, todavía no medidos.
Fecha: 2026-11-01

## Objetivo creativo

Producir microhistorias animadas de aproximadamente 60 segundos con estética de papel multicapa: recortes, volumen, profundidad, pliegues, texturas, bordes, sombras e iluminación. La música se utiliza como banda sonora, diálogo, ambiente y efectos; no es el eje que dirige el movimiento visual.

Las historias iniciales serán piezas breves e independientes, no capítulos largos. Como pauta de producción, se procurará trabajar normalmente con hasta 5–8 personajes por pieza. La escenografía debe sentirse viva mediante capas, elementos ambientales y movimiento sutil, sin exigir una multitud de personajes.

## Roles

- **Director creativo (usuario):** define la idea, los acontecimientos, el tono y aprueba storyboard, imágenes, escenas y resultado.
- **Asistente de producción (IA):** desarrolla el guion técnico, propone planos y acciones, prepara prompts y referencias, organiza recursos, genera operaciones para el motor, ejecuta pruebas y aplica correcciones autorizadas.
- **Living Paper Studio:** interfaz web de producción y revisión.
- **Living Paper Engine:** render y sistemas gráficos/animación de papel.
- **Assistant Bridge:** convierte instrucciones del asistente en operaciones tipadas, validadas y verificables del Studio.
- **Living Paper Player:** aplicación Android futura para catálogo y reproducción de historias exportadas.

## Flujo por cortometraje

1. **Idea y guion breve**
   - El usuario explica la historia como la imagina.
   - El asistente la convierte en una secuencia clara de acciones para aproximadamente 60 segundos.
   - No se alarga la fase de escritura si la idea ya está definida.

2. **Storyboard y escenas**
   - Dividir la historia en planos/escenas.
   - Definir duración aproximada, encuadre, acción, personajes, escenario y transición.
   - El usuario revisa y aprueba antes de producir recursos en volumen.

3. **Recursos visuales**
   - Generar o preparar personajes, escenarios, objetos y elementos ambientales con las herramientas de imagen disponibles.
   - Mantener una ficha maestra por personaje: silueta, proporciones, paleta, rasgos, vestuario, materiales y detalles que no deben variar.
   - Usar imágenes de referencia consistentes y prompts maestros reutilizables. Cada prompt de escena debe declarar qué debe permanecer idéntico y qué puede cambiar (pose, expresión, encuadre o iluminación).
   - Conservar los originales aprobados y registrar la procedencia/licencia de recursos externos.
   - No asumir que un prompt de texto por sí solo garantiza identidad exacta entre generaciones; usar referencias de imagen, hojas de personaje y corrección cuando la herramienta lo permita.

4. **Preparación de escena y animación**
   - Organizar los recursos en capas con profundidad y puntos de anclaje.
   - Crear o reutilizar rigs, articulaciones, poses, acciones y ciclos.
   - Definir entradas/salidas, posiciones, cámara, iluminación y efectos.
   - El asistente traduce las instrucciones a operaciones tipadas del Studio; no se requiere que el usuario programe ni anime manualmente.

5. **Audio**
   - Incorporar voz, diálogos, música, ambiente y efectos necesarios.
   - Sincronizar los elementos de audio con las acciones y la duración de la pieza.

6. **Previsualización y corrección**
   - Ejecutar render de vista previa.
   - Mostrar los cambios y las operaciones realizadas.
   - Permitir correcciones en lenguaje natural, revisión de diferencias, deshacer y repetir.
   - El usuario aprueba el resultado final.

7. **Exportación y archivo**
   - Exportar la historia como paquete de contenido independiente del APK del reproductor.
   - Guardar proyecto editable, recursos, metadatos, audio y versión exportada.
   - Reconstruir el APK solo cuando cambie el Player o su motor, no por cada historia.

## Consistencia visual

Cada recurso reutilizable debe tener un identificador estable y una ficha de referencia. Para personajes se conservarán, según necesidad, vistas frontal/lateral/posterior, expresiones, paleta, proporciones y detalles distintivos. Para escenarios se conservarán composición, paleta, materiales, escala y capas de profundidad.

Los prompts deben separar:
- **Identidad bloqueada:** características que no pueden cambiar.
- **Variables de la toma:** pose, expresión, acción, cámara y condiciones de luz solicitadas.
- **Estilo común:** papel recortado multicapa, textura artesanal, bordes, volumen y sombras coherentes.

La consistencia se valida visualmente; no se promete que todos los generadores mantengan identidad perfecta solo por repetir texto.

## Objetivo de tiempo

Meta de optimización para una pieza sencilla de un minuto, una vez consolidado el Studio: aproximarse a 1–2 horas de producción cuando se reutilicen herramientas y recursos. Es una meta, no un resultado medido ni una garantía. Las primeras pruebas deben registrar tiempos reales por etapa y distinguir trabajo automatizado, generación externa, espera y correcciones.

## Principios

- Priorizar automatización; el usuario dirige y aprueba, no opera un editor complejo.
- Reutilizar personajes, escenarios, rigs, movimientos y efectos aprobados.
- Mantener el acabado artesanal de papel; no convertirlo en animación 2D genérica.
- Guardar versiones y permitir deshacer.
- Usar operaciones tipadas, validadas, reversibles y con vista previa; no ejecutar código arbitrario sin control.
- No integrar servicios de pago ni consumir créditos sin autorización expresa.
- Mantener recursos y código separados; no reconstruir el APK por cada cortometraje.
