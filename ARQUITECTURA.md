# Living Paper Engine — arquitectura del motor de caricaturas

**Estado:** dirección de arquitectura inicial, no implementación final. Objetivo vigente desde 2026-11-01.

La arquitectura debe responder al nuevo producto: un estudio visual para crear caricaturas animadas y microhistorias desde una interfaz usable en iPad. La dirección de producto está en docs/direccion-motor-caricaturas-ipad.md.

## Prioridad de plataforma

- Primera interfaz: aplicación web adaptable a iPad.
- Primer entorno de revisión: Safari en iPad.
- Entorno de desarrollo: GitHub Codespaces y repositorio actual.
- No iniciar una aplicación Android nativa ni Android TV en esta etapa.
- No elegir un framework o motor definitivo antes de comparar prototipos pequeños y comprobarlos en Safari.

## Componentes conceptuales

1. **Editor visual:** escenario, selección de elementos, herramientas táctiles y panel de propiedades.
2. **Modelo de proyecto:** personajes, objetos, fondos, escenas, tomas, acciones y recursos.
3. **Motor de escena:** composición, orden visual, transformaciones y estado de cada elemento.
4. **Motor de animación:** poses, movimientos, interpolaciones, secuencias y reloj reproducible.
5. **Línea de tiempo:** pistas de acciones y organización temporal de escenas.
6. **Vista previa:** reproducción y pausa de la escena o historia.
7. **Audio narrativo:** diálogo, voz, efectos y música específica de cada microhistoria; se incorpora después de establecer la base visual.
8. **Persistencia y exportación:** guardado/carga de proyectos y, en una etapa posterior, renderizado/exportación de vídeo.

Estos componentes son una separación lógica inicial. No implican que ya existan carpetas, módulos o funciones implementadas.

## Experiencia de edición

El escenario debe ocupar la mayor parte de la pantalla. Los controles y paneles deben adaptarse al espacio disponible y ser utilizables con los dedos o Apple Pencil. El usuario debe poder seleccionar un personaje u objeto, cambiar propiedades visibles y reproducir el movimiento sin editar código.

La primera prueba funcional se limita a:
- escenario visible;
- al menos un elemento seleccionable;
- controles visuales de posición y tamaño;
- animación sencilla con reproducir/pausar;
- vista previa comprobable en Safari de iPad.

## Modelo de contenido a definir

El modelo futuro deberá representar, como mínimo:
- proyecto y configuración general;
- escenas y tomas;
- personajes y objetos reutilizables;
- recursos gráficos y sus variantes;
- transformaciones y propiedades;
- poses, acciones y secuencias de animación;
- pistas y eventos de línea de tiempo;
- diálogo, efectos y música por historia.

No fijar todavía un esquema JSON definitivo ni reutilizar el contrato v2 de capas como base obligatoria. El nuevo modelo se definirá a partir de la primera prueba editable.

## Tecnología por evaluar

Se evaluarán HTML/CSS/JavaScript y las opciones de renderizado Canvas 2D, SVG y DOM mediante pruebas pequeñas. Los criterios serán:
- fluidez en Safari del iPad;
- facilidad para seleccionar y manipular objetos;
- calidad visual;
- escalabilidad a escenas con varios personajes y elementos;
- facilidad para guardar y restaurar el estado;
- capacidad futura de exportación.

La elección se documentará con resultados observados, no por suposición.

## Comunicación con ChatGPT

El primer flujo de trabajo será asistido mediante cambios de código en la rama autorizada y actualización de la vista previa por parte del usuario. No existe todavía una conexión directa entre ChatGPT y el lienzo activo en Safari.

Un puente futuro podría permitir intercambiar el estado de la escena y aplicar instrucciones estructuradas, pero debe diseñarse como una función independiente, con controles de seguridad y sin servicios externos o gastos no autorizados.

## Audio

La música no es un reproductor ni el centro del motor. Cada microhistoria podrá tener diálogo, voz, efectos y música original apropiada para su género, personajes y ritmo. La arquitectura de audio se abordará después de establecer el editor visual y el sistema narrativo.

## Rendimiento y validación

No declarar compatibilidad final hasta probar en el iPad real. Medir carga, fluidez, memoria y estabilidad con escenas representativas antes de fijar límites. Las pruebas automatizadas no sustituyen la revisión visual y táctil del usuario.

## Estructura de trabajo

La estructura definitiva se decidirá tras auditar el código existente. No crear carpetas o módulos por anticipado si no responden a una necesidad comprobada. Los prototipos y recursos del proyecto anterior se conservan como antecedentes y no se eliminan durante la transición.

## Estado del diseño anterior

La arquitectura de cuadros de papel recortado, capas 4K, audio reactivo y Android TV queda archivada como antecedente. El contrato v2 no es una especificación aprobada para este motor.
