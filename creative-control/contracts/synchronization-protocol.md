# ADM Creative Control — protocolo de sincronización

**Versión:** 1.0.0  
**Implementación actual:** adaptador 0.2.0-readonly  
**Estado:** lectura y notificaciones; sin operaciones de escritura.

## Objetivo

Mantener sincronizado el contexto que consume el motor de dirección creativa con el estado del editor, sin entregar al agente acceso al DOM, a objetos mutables ni a funciones internas.

## API pública actual

La fachada `window.ADM_CreativeControl` expone:

- `protocolVersion`: versión del contrato.
- `version`: versión del adaptador.
- `getContext()`: devuelve una instantánea inmutable del proyecto, espacio activo, selección y recursos resumidos.
- `getCapabilities()`: devuelve las capacidades de lectura disponibles y las operaciones todavía no implementadas.
- `subscribe(listener)`: registra un observador de eventos y entrega inmediatamente el estado inicial. Devuelve una función para cancelar la suscripción.

## Revisiones

- `project.revision` aumenta cuando cambia el contenido relevante del proyecto: nombre, piezas, jerarquía, transformaciones, mallas o poses.
- `contextRevision` aumenta cuando cambia el proyecto, la selección o el espacio activo.
- La revisión de formato del archivo (`project.formatVersion`) es distinta de las revisiones de sincronización.
- Las revisiones son contadores de sesión del adaptador; todavía no son identificadores persistentes ni sustituyen un futuro ID de versión guardado por el editor.

## Eventos

Cada notificación contiene `type`, `protocolVersion`, `contextRevision`, `projectRevision`, `context` y `capabilities`.

Eventos implementados:

- `project.changed`
- `selection.changed`
- `workspace.changed`
- `context.changed`

La implementación actual observa las zonas de interfaz que el editor vuelve a renderizar y compara instantáneas; no entrega nodos DOM al suscriptor. El espacio activo se identifica como `character`. Los demás espacios se declaran no disponibles hasta que existan realmente.

## Capacidades y límites

- Las capacidades publicadas son de lectura.
- La estructura de piezas, transformaciones, poses y resumen de mallas se entrega como datos serializados e inmutables.
- La fachada no publica `commit`, `execute`, setters ni métodos de borrado.
- Las operaciones creativas como mover piezas, aplicar poses, resolver IK o cambiar expresiones siguen deshabilitadas para la IA, aunque el editor tenga controles manuales para algunas de ellas.
- La observación por mutaciones es un puente inicial. En una fase posterior se sustituirá o complementará con eventos semánticos emitidos directamente por el núcleo del editor, para reducir dependencia de la representación visual.

## Próximas etapas

1. Probar la sincronización con cambios de proyecto y selección.
2. Incorporar un registro de capacidades con parámetros, restricciones, requisitos previos e impacto, basado en handlers reales auditados.
3. Añadir validación y simulación no mutante de propuestas.
4. Añadir transacciones con aprobación humana, registro y deshacer.
5. Publicar capacidades de cada nuevo espacio solo cuando sus herramientas estén implementadas y probadas.

No se habilitarán proveedores externos ni llamadas de pago en esta etapa.

## Registro de capacidades

El registro descriptivo vive en `creative-control/capability-registry.js`. Cada capacidad declara disponibilidad real, soporte (lectura nativa, función del editor, controles manuales o handler de interfaz), parámetros, precondiciones, impacto, reversibilidad y compatibilidad con el esquema de propuestas.

El adaptador publica el catálogo con `getCapabilities()`, una entrada individual con `getCapability(id)` y notifica `capabilities.changed` si el catálogo efectivo cambia. Ninguna entrada habilita ejecución del agente: `agentExecutionEnabled` y `execution.enabled` permanecen en `false`.

El catálogo distingue explícitamente operaciones que el editor puede realizar manualmente de las operaciones que el protocolo puede representar en una propuesta. No se infiere que un botón existente equivalga a un comando seguro para la IA.

## Validación de propuestas

`ADM_ProposalValidator.validate(proposal, context)` valida el esquema 1.0 contra una instantánea del editor. La fachada `ADM_CreativeControl.validateProposal(proposal)` suministra el contexto actual.

Comprobaciones implementadas:
- versión del esquema, ID, revisión de proyecto y espacio activo;
- propiedades adicionales no permitidas y tipos de acciones admitidos;
- piezas destino existentes y exclusión de la raíz;
- valores numéricos finitos, rangos de posición/escala y límites articulares;
- poses existentes y duración de transición;
- existencia de cadena IK, alineación/pivotes/escala requeridos y resultado del solver puro;
- catálogo de expresiones y piezas faciales requeridas.

La respuesta contiene errores por código/ruta y efectos simulados. No cambia el proyecto, no llama a handlers del editor y no autoriza ejecución. La simulación es un plan estructurado, no una vista previa gráfica todavía.
