# Visión del estudio web y exportación de caricaturas

**Fecha:** 2026-11-01  
**Rama:** `feature/living-paper-engine-foundation`  
**Estado:** decisión de producto y arquitectura inicial; no es una implementación completa.

## 1. Decisión de producto

Art Design Music se desarrollará como un **estudio web para crear caricaturas animadas e historias audiovisuales**. Se accederá desde una dirección web mediante Safari, Chrome o Firefox. No se plantea una aplicación Android nativa ni un APK como producto principal.

El editor será una aplicación web: tendrá interfaz, proyectos, biblioteca de personajes y escenas, controles de animación y herramientas de montaje. La diferencia es que se ejecutará en el navegador y el resultado principal será un archivo de vídeo.

Cada cuadro/obra podrá representar una caricatura o historia independiente. El estudio deberá organizar una biblioteca de proyectos, cada uno con sus personajes, escenarios, objetos, escenas, animaciones, diálogos, música, efectos y exportaciones.

La dirección visual aprobada es papel artesanal recortado en 2D con perspectiva, profundidad, texturas de alta calidad, bordes nítidos, iluminación y sombras entre capas. La animación dibujada a mano no es un objetivo del producto. El orden de desarrollo y los requisitos de renderizado local están definidos en `docs/decisiones-editor-personajes-y-render-local-2026-11-01.md`.

## 2. Flujo de trabajo previsto

1. Abrir el estudio desde una dirección web.
2. Crear un proyecto/historia independiente.
3. Preparar o importar personajes y sus partes.
4. Construir escenarios y colocar objetos.
5. Crear poses, expresiones, acciones y movimientos.
6. Organizar tomas y escenas en una línea de tiempo.
7. Añadir diálogos, voz, música y efectos.
8. Previsualizar y ajustar la historia.
9. Renderizar y codificar un vídeo.
10. Descargar el vídeo y publicarlo en los canales del usuario.

La publicación en internet puede realizarse inicialmente subiendo el archivo exportado a la plataforma elegida. No se necesita construir desde el inicio un servicio de alojamiento o una red social propia.

## 3. El renderizado sigue siendo necesario

Un vídeo no elimina el motor de renderizado: cambia su salida. El motor debe calcular la imagen de cada instante de la historia, componer personajes, capas, transformaciones, cámara, efectos y audio, y codificar el resultado en un contenedor de vídeo.

Para una historia de 60 segundos a 30 fps se deben generar 1,800 fotogramas. El sistema debe controlar la secuencia temporal de forma determinista para que la previsualización y la exportación representen la misma animación.

El objetivo aprobado es que el renderizado final se ejecute localmente en el iPad; Codespaces se utilizará para desarrollo, no para renderizar historias. La exportación podrá investigar capacidades nativas como WebCodecs cuando estén disponibles y sean adecuadas. La disponibilidad real de cada códec, la memoria, el rendimiento y las limitaciones de cada navegador/dispositivo deben detectarse en tiempo de ejecución. Safari en iPad será la referencia inicial; también se intentará compatibilidad con Chrome, Firefox y Opera en iPad.

No se asumirá que una única combinación de formato/códec funciona en todos los dispositivos. Se evaluará una salida ampliamente compatible y, si resulta conveniente, un formato abierto alternativo. El soporte de reproducción no equivale automáticamente a soporte de codificación.

## 4. Arquitectura por capas propuesta

- **Aplicación web y proyectos:** acceso, biblioteca, carga/guardado, preferencias y administración de proyectos.
- **Documento de historia:** escenas, tomas, duración, orden, resolución, fps y referencias a recursos.
- **Editor visual:** escenario, selección directa, jerarquía, inspector, herramientas táctiles y deshacer/rehacer.
- **Personajes:** arte fuente, partes, jerarquía, mallas/deformadores, rig, poses y expresiones.
- **Animación:** clips, acciones, keyframes, curvas, transiciones y pistas.
- **Escenas y cámara:** fondos, objetos, composición, encuadre y movimientos de cámara.
- **Audio:** diálogo, voz, música, efectos, pistas, sincronización y mezcla.
- **Motor de composición/render:** evaluación temporal y generación de fotogramas.
- **Exportador:** codificación de vídeo/audio, verificación del archivo y descarga.
- **Persistencia:** formato de proyecto propio, versionado, recursos asociados y recuperación.

Estas capas son una dirección de diseño. No deben convertirse todas en módulos prematuros; se implementarán a medida que las pruebas funcionales lo requieran.

## 5. Política de reutilización y licencias

La prioridad es reutilizar componentes con licencias permisivas y claras, y aprender de proyectos con licencias restrictivas sin copiar su código.

- **PixiJS:** candidato para composición/render 2D web; el repositorio declara licencia MIT. Mantener los avisos de licencia y verificar la versión exacta que se incorpore.
- **Umamo:** GPL-3.0. Se estudiarán conceptos de jerarquía, partes, mallas, UV e interfaz de modelado. No se copiará ni integrará su código en el producto en esta etapa.
- **Rigby2D:** candidato de investigación para rigging y animación; antes de adoptar código, runtime, formatos o herramientas se debe verificar la licencia exacta de cada componente y sus dependencias.
- **FFmpeg:** no se incorporará automáticamente. Su base es LGPL-2.1-or-later, con componentes opcionales GPL. Si se necesitara, se fijará una compilación y configuración concretas y se revisarán sus obligaciones antes de distribuirla.
- **Otras herramientas, modelos, fuentes, música, voces, texturas, personajes y recursos:** cada licencia se evaluará por separado. Una licencia de software no concede derechos sobre los recursos de ejemplo ni sobre modelos/datasets asociados.

Regla de producto: no incorporar dependencias sin registrar nombre, versión, URL, licencia, modificaciones, avisos exigidos y uso dentro del proyecto. Evitar dependencias GPL, AGPL o no comerciales en el núcleo distribuible, salvo decisión expresa después de evaluar sus consecuencias. No confundir que algo sea gratuito o público con que tenga permiso de redistribución o uso comercial.

Esta política es una guía técnica preventiva, no asesoría legal.

## 6. Estrategia de despliegue y costes

- Desarrollar y validar el prototipo desde el entorno de trabajo actual.
- Mantener el estudio ejecutable como web estática mientras la arquitectura lo permita.
- No activar hosting, almacenamiento, servicios de render remoto, APIs pagadas ni suscripciones sin autorización explícita.
- En la primera etapa, guardar y exportar localmente cuando el navegador lo permita.
- Más adelante, evaluar alojamiento de proyectos y render remoto solo si la complejidad o el tamaño de los trabajos lo justifican.
- La publicación de los vídeos se hará inicialmente en las plataformas externas elegidas por el usuario.

## 7. Secuencia de implementación

### Etapa A — editor visual de personajes
- Construcción e importación de partes y jerarquías.
- Herramientas de rig/huesos, articulación y pivotes.
- Deformación y estiramiento cuando aporten valor.
- Texturas, poses y expresiones.
- Selección, manipulación y previsualización táctil.
- Validación inicial en Safari iPad y pruebas adicionales en Chrome, Firefox y Opera.

### Etapa B — documento de escena
- Modelo de datos versionado.
- Guardar/cargar escena local.
- Jerarquía de objetos, inspector y deshacer/rehacer.
- Múltiples personajes y objetos.

### Etapa C — personajes
- Importación de recursos propios.
- Partes y jerarquía.
- Controles de pose y expresiones.
- Mallas/deformación solo cuando aporten valor y se validen en dispositivo.

### Etapa D — animación e historias
- Timeline y keyframes.
- Clips y acciones reutilizables.
- Escenas/tomas y cámara.
- Duración y continuidad temporal.

### Etapa E — audio y exportación
- Pistas de voz, diálogo, música y efectos.
- Composición audiovisual determinista.
- Prueba de exportación local a vídeo.
- Compatibilidad, calidad, memoria y tiempos de exportación en navegadores.

### Etapa F — acceso web estable
- Publicación del estudio en una dirección web.
- Guardado/recuperación y copias de seguridad.
- Evaluar alojamiento de proyectos si se vuelve necesario.
- No se requiere APK para el producto principal.

## 8. Próximo paso inmediato

Continuar el prototipo aislado `prototype/caricature-studio-v01/index.html` y validarlo en el iPad. La siguiente mejora de arquitectura, una vez comprobada la interacción, será separar el estado de escena del dibujo SVG y crear un documento de proyecto mínimo que pueda guardarse y restaurarse. No implementar todavía importación compleja de personajes, render remoto ni exportación final antes de tener una escena reproducible.

## 9. Estado y límites

- Esta decisión define el producto como estudio web y la salida principal como vídeo.
- No existe aún el editor completo, un formato de proyecto final, una biblioteca de personajes, un exportador de vídeo validado ni un sitio público.
- No se ha probado compatibilidad con Safari, Chrome o Firefox en esta etapa.
- No se activaron servicios externos ni pagos.
- No se modificó `main`, no se fusionó la rama y no se abrió PR.
