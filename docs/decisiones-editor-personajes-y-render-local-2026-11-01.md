# Decisiones vigentes: editor de personajes, navegadores y renderizado local

**Fecha:** 2026-11-01  
**Rama:** `feature/living-paper-engine-foundation`  
**Estado:** decisiones de producto aprobadas por el usuario; requisitos técnicos por validar. Este documento prevalece sobre notas anteriores que describan otra estética, orden de desarrollo o estrategia de renderizado.

## 1. Producto y dirección visual

Art Design Music será un estudio web para crear caricaturas digitales y microhistorias audiovisuales. La estética central será **papel artesanal recortado en 2D con profundidad y perspectiva**: personajes y escenarios deben parecer construidos con piezas y capas físicas de papel, con bordes nítidos, fibras y texturas de alta calidad, relieves, sombras entre planos, iluminación cuidada y composición cinematográfica.

No se busca animación dibujada a mano ni aplicar un filtro de papel sobre dibujos convencionales. La apariencia de papel debe formar parte de la construcción visual de personajes, objetos y escenarios. En escenarios de desplazamiento lateral o tipo Metroidvania, la perspectiva y la profundidad se construirán con planos 2D, capas y recursos visuales coherentes.

La calidad visual —resolución, detalle de textura, nitidez, iluminación y composición— tiene prioridad sobre reducir el tamaño del archivo final.

## 2. Orden de desarrollo aprobado

No desarrollar todos los subsistemas grandes en paralelo. El orden de trabajo es:

1. **Editor visual de personajes:** primero debe convertirse en una herramienta completa y potente para construir personajes. Debe evolucionar hacia importación/creación de partes, jerarquías, pivotes, rigs y huesos, controles de articulación, deformación/estiramiento, mallas cuando sean necesarias, texturas, poses, expresiones y previsualización de movimientos. No declarar completo el editor por tener solo selección, escala o rotación.
2. **Escenas y animación:** incorporar fondos, objetos, composición, cámara, colocación de personajes y acciones.
3. **Líneas de tiempo:** pistas, keyframes, curvas, clips, sincronización y organización temporal.
4. **Renderizador local:** evaluar y construir la composición determinista de fotogramas y audio.
5. **Exportación de vídeo desde el iPad:** validar resolución, frecuencia, códec, contenedor, color, memoria, tiempo y estabilidad.
6. **Reproductor Android TV:** un único APK reproductor de vídeos exportados, con biblioteca. No será un motor que renderice las escenas ni se generará un APK distinto por historia.

El prototipo `prototype/caricature-studio-v01/index.html` sigue siendo una prueba técnica inicial y no representa el editor completo. El trabajo siguiente continúa centrado en el editor de personajes.

## 3. Desarrollo y ejecución: responsabilidades separadas

- **GitHub Codespaces:** entorno de desarrollo para editar, ejecutar pruebas de desarrollo y mantener el proyecto. No participará en el renderizado final de las historias.
- **GitHub:** repositorio y control de versiones.
- **iPad:** dispositivo de edición visual y objetivo de renderizado/exportación local. El motor deberá calcular los fotogramas y codificar el vídeo en el propio dispositivo cuando las capacidades verificadas lo permitan.
- **Servicios remotos:** no contratar ni activar servidores, GPU en la nube, granjas de render, almacenamiento, APIs o suscripciones para el renderizado. Cualquier gasto requeriría autorización explícita; la estrategia aprobada es no depender de esos servicios.

La arquitectura debe tender a una aplicación web local-first: el navegador descarga la aplicación y sus recursos; la edición y el render se ejecutan en el dispositivo. El alojamiento de la página no debe confundirse con el lugar donde se calcula cada fotograma. Se evaluará el funcionamiento sin conexión y la persistencia local, sin dar por implementada todavía esa capacidad.

## 4. Navegadores y compatibilidad en iPad

Navegador de referencia para desarrollo y validación inicial: **Safari en iPad**, por ser el entorno de referencia más directo para las capacidades web del sistema.

Navegadores adicionales que se intentarán soportar: **Google Chrome, Firefox y Opera en iPad**. No se asumirán equivalentes a sus versiones de escritorio ni se prometerá que todos ofrecen las mismas APIs, códecs, permisos, memoria o rendimiento.

La compatibilidad se dividirá en dos niveles independientes:

- **Compatibilidad del editor:** abrir proyectos, mostrar la interfaz, manipular personajes y escenas, guardar/cargar y previsualizar.
- **Compatibilidad de exportación:** acceso a aceleración gráfica, procesamiento en segundo plano cuando proceda, codificación de vídeo, descarga/guardado de archivos y gestión de color.

Se construirá una matriz de pruebas por navegador y versión. Se detectarán capacidades en tiempo de ejecución y se ofrecerán alternativas o avisos cuando una función no esté disponible. Safari será el primer objetivo de prueba, no una exclusividad impuesta al producto.

En iPadOS los navegadores pueden estar sujetos a restricciones del sistema y no deben tratarse como motores de escritorio independientes. La disponibilidad efectiva depende de la versión del sistema, navegador, región y APIs expuestas; debe medirse en el dispositivo real.

## 5. Objetivos de movimiento y frecuencia

La salida inicial objetivo será **24 o 30 fotogramas por segundo**. La sensación de movimiento es una decisión artística: se pueden animar personajes con cadencias de 12 o 15 dibujos/poses por segundo y componer la salida en 24/30 fps para conservar un movimiento de caricatura deliberado.

60 fps no será el objetivo predeterminado. Se considerará como opción para escenas que realmente lo necesiten y solo después de medir rendimiento, calidad y tamaño. No se acelerará artificialmente el movimiento para alcanzar una cifra de FPS.

## 6. Calidad de imagen y exportación

- Resolución objetivo de producción: **4K UHD, 3840 × 2160**.
- Texturas de alta resolución, detalle fino, bordes limpios, sombras y capas con profundidad.
- Objetivo de color avanzado: pipeline de 10 bits y HDR10, únicamente si el dispositivo, navegador, renderizador, codificador y reproducción mantienen correctamente el formato de principio a fin.
- El HDR debe proceder de una gestión de color e iluminación real; no se debe etiquetar un vídeo SDR como HDR.
- La reproducción de un vídeo 4K/HDR en YouTube no demuestra por sí sola que el navegador pueda codificar localmente un vídeo 4K/HDR.
- MKV, MP4 y WebM son contenedores; H.264, HEVC/H.265 y AV1 son códecs. La elección final dependerá de la codificación realmente disponible, calidad, compatibilidad y posibilidad de conservar 10 bits/HDR.
- Se buscará un archivo maestro de alta calidad y, si hace falta, versiones de distribución optimizadas para plataformas que recomprimen el vídeo. No se garantiza evitar la recompresión de terceros.

No se prometerá 4K, HEVC, AV1, MKV ni HDR10 en el iPad hasta completar pruebas de codificación y reproducción reales. La prioridad es mantener la máxima calidad que el dispositivo pueda producir de forma estable.

## 7. Prueba técnica de renderizado cuando corresponda

El exportador se aborda después del editor de personajes, escenas y timeline. Cuando llegue esa etapa, la prueba deberá:

1. Componer una escena representativa con múltiples capas de papel, texturas, sombras, iluminación y movimiento.
2. Renderizar una secuencia corta en 4K a 24 y 30 fps.
3. Medir tiempo, memoria, almacenamiento temporal, temperatura y estabilidad en el iPad.
4. Detectar formatos, códecs, perfiles, profundidad de color y APIs de codificación disponibles.
5. Verificar el archivo resultante en el propio iPad y en dispositivos de destino.
6. Repetir pruebas en Safari, Chrome, Firefox y Opera cuando sus capacidades lo permitan.

El renderizado deberá procesar fotogramas de forma progresiva o por bloques, sin acumular toda la secuencia en memoria. La vista previa podrá ser más ligera que la exportación final.

## 8. Costes y límites

La meta es **cero coste de servidor por renderizado**: el iPad hace el trabajo. Esto no elimina posibles límites de tiempo, batería, temperatura, RAM, almacenamiento ni capacidades de codificación. Codespaces conserva sus propias cuotas y límites de desarrollo, independientes del renderizado local.

No activar servicios de pago ni generar gastos sin autorización explícita.

## 9. Estado de implementación

- Existe un prototipo web inicial de escenario y personaje geométrico con selección, arrastre, escala, rotación y animación sencilla.
- No existe todavía el editor completo de personajes, el sistema completo de escenas, la timeline, el renderizador final ni la exportación 4K/HDR verificada.
- No se ha certificado la compatibilidad en Safari, Chrome, Firefox u Opera en iPad.
- No se ha ejecutado una prueba de codificación 4K local.
- No se ha activado ningún servicio de renderizado remoto.

## 10. Protección del repositorio

Continuar únicamente en `feature/living-paper-engine-foundation` mientras siga siendo la rama autorizada. No modificar `main`, fusionar ramas, abrir PR, desplegar ni publicar sin autorización expresa. Conservar los prototipos y documentos del objetivo anterior como antecedentes hasta auditarlos; no eliminarlos durante esta transición.
