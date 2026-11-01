# Living Paper Engine — motor de caricaturas y microhistorias

## Objetivo vigente

Este repositorio está reorientado al desarrollo de un motor y estudio visual para crear caricaturas animadas y microhistorias. La interfaz se diseñará primero para utilizarse desde un iPad.

La prioridad es completar primero el editor visual de personajes. Safari en iPad será el navegador de referencia inicial; también se buscará compatibilidad con Chrome, Firefox y Opera en iPad.

El usuario dirige la creación. ChatGPT es el único asistente de IA que participa en el diseño, la lectura de archivos, la modificación del código y la revisión. No se delegan tareas a Claude ni a otros asistentes.

## Documentos vigentes

- [Prototipo de editor articulado de personajes v0.8](docs/prototipo-editor-articulado-personajes-v0-1.md)
- [Decisiones vigentes: editor de personajes, navegadores y renderizado local](docs/decisiones-editor-personajes-y-render-local-2026-11-01.md)
- [Dirección del motor de caricaturas para iPad](docs/direccion-motor-caricaturas-ipad.md)
- [Visión del estudio web y exportación de caricaturas](docs/vision-estudio-web-y-exportacion-de-caricaturas-2026-11-01.md)
- [Estado del proyecto](ESTADO_PROYECTO.md)
- [Arquitectura inicial](ARQUITECTURA.md)
- [Instrucciones de trabajo](INSTRUCCIONES_PARA_IA.md)
- [Bitácora](BITACORA.md)
- [Investigación de Umamo y decisión de arquitectura](docs/investigacion-umamo-y-decision-arquitectura-2026-11-01.md)
- [Primera prueba aislada del estudio de caricaturas](prototype/caricature-studio-v01/index.html)

## Experiencia prevista

- Escenario visual y selección de personajes/objetos.
- Panel de propiedades con controles táctiles.
- Acciones, poses y animaciones.
- Línea de tiempo y organización de escenas.
- Diálogo, efectos y música original para cada microhistoria.
- Exportación de vídeo en una etapa posterior.

Estas funciones son objetivos del editor completo. Existe una primera prueba técnica aislada con escenario, selección táctil, arrastre, escala, rotación y animación sencilla; todavía no equivale al editor completo ni está validada en Safari del iPad.

## Cómo se trabajará desde el iPad

En la primera etapa, el usuario describe los cambios en el chat; ChatGPT modifica el código en la rama de trabajo; el usuario abre o actualiza la vista previa en Safari y revisa el resultado. No existe todavía una conexión directa y continua entre ChatGPT y el lienzo activo. Un puente de edición en tiempo real podrá evaluarse más adelante.

## Estado técnico

El primer prototipo aislado está en `prototype/caricature-studio-v01/index.html`. No se ha probado todavía en navegador ni en Safari del iPad. El siguiente paso es validarlo desde Codespaces en el iPad y ajustar la interacción táctil.

La rama de trabajo autorizada es feature/living-paper-engine-foundation. No modificar main, fusionar, abrir PR ni desplegar sin autorización expresa.

## Antecedentes conservados

Los prototipos de cuadros de papel recortado, la imagen maestra Mountains That Breathe, el motor experimental anterior, el contrato v2 de capas y sus documentos se conservan como antecedentes. No son requisitos de la nueva aplicación y no se eliminan durante la transición.

- [Auditoría técnica del 29-10-2026 — cerrada como registro histórico](docs/auditoria-tecnica-2026-10-29.md)
- [Contrato v2 de capas — no aprobado para el motor nuevo](docs/contrato-de-capas-y-work-json.md)
- [Plan de validación del contrato anterior — archivado](docs/plan-de-validacion-automatica.md)
- [Dirección artística anterior — archivada](docs/direccion-artistica-y-partitura-audiovisual.md)
- [Partitura de Mountains That Breathe — obsoleta para la planificación activa](docs/partitura-audiovisual-mountains-that-breathe-propuesta-v0-1.md)

No asumir que el código anterior es compatible con el motor nuevo. Clasificarlo antes de reutilizarlo.
