# ADM Creative Control

**Estado: contrato inicial de arquitectura; todavía no es un sistema ejecutable.**

ADM Creative Control es la capa que permitirá a una IA operar las herramientas creativas existentes de Art Design Music. No es un segundo motor gráfico ni un programador autónomo: es un adaptador controlado entre instrucciones en lenguaje natural y las acciones públicas del editor.

## Separación obligatoria

1. **Desarrollo del software:** modifica código, herramientas, interfaz y motor. Queda fuera del flujo creativo cotidiano.
2. **Dirección creativa:** utiliza capacidades publicadas por el editor para manipular proyectos, personajes, rigs, poses, escenas, audio y timeline. No puede leer ni modificar archivos de código.

La IA creativa no recibe acceso al DOM arbitrario, a variables internas, a almacenamiento libre, al sistema de archivos ni a endpoints de escritura del repositorio.

## Flujo de una instrucción

`instrucción → contexto → propuesta → validación → vista previa → aprobación humana → ejecución → verificación`

- **Contexto:** el editor expone únicamente los recursos seleccionados y las capacidades disponibles en el espacio de trabajo activo.
- **Propuesta:** la IA devuelve operaciones estructuradas; no ejecuta acciones.
- **Validación:** el editor comprueba IDs existentes, tipos, límites, jerarquías, permisos y compatibilidad con el estado actual.
- **Vista previa:** se calcula el resultado sin modificar el proyecto.
- **Aprobación:** el usuario autoriza una propuesta concreta, ligada a su versión y contexto.
- **Ejecución:** un adaptador interno llama exclusivamente a comandos permitidos del editor.
- **Verificación:** se confirma el resultado y se conserva la posibilidad de deshacer.

Cualquier cambio de selección, proyecto o versión que invalide la propuesta obliga a validarla de nuevo. Una aprobación no puede reutilizarse para otra propuesta.

## Contrato público del editor

La interfaz del editor deberá exponer una fachada explícita, independiente de sus detalles internos:

- `getContext()`: devuelve espacio activo, selección y resumen mínimo de recursos.
- `getCapabilities()`: devuelve acciones disponibles, parámetros, límites y requisitos.
- `propose()`: registra una propuesta estructurada sin mutar el proyecto.
- `validate()`: valida propuesta y contexto.
- `preview()`: calcula una previsualización reversible/no persistente.
- `commit()`: ejecuta una propuesta validada solo con aprobación humana vigente.
- `undo()`: revierte la última transacción creativa cuando sea posible.

Estos nombres describen el contrato objetivo; **no se deben presentar como funciones ya implementadas**.

## Principios de seguridad

- Denegar por defecto; solo se permiten capacidades registradas.
- No aceptar JavaScript, HTML, CSS, código fuente, rutas de archivos ni comandos arbitrarios como acciones.
- No permitir que la IA agregue huesos, cambie jerarquías estructurales o elimine recursos mediante una orden creativa.
- No sobrescribir recursos originales. Las propuestas destructivas se rechazan o se convierten en una copia/variante que requiera aprobación explícita.
- Validar límites numéricos y relaciones del rig en el editor, no confiar en los valores propuestos por el modelo.
- Vincular cada aprobación a propuesta, proyecto, versión y selección concretos; usar caducidad y un solo uso.
- Registrar operaciones, validaciones, aprobación, resultado y errores en una bitácora legible.
- Mantener los proveedores de IA detrás de un adaptador intercambiable. Ninguna clave API se guarda en el repositorio, en JSON de proyecto ni en el frontend público.
- Los proveedores gratuitos (por ejemplo Google AI Studio y OpenRouter) se evaluarán más adelante por límites, disponibilidad, privacidad y compatibilidad. No se habilitan llamadas remotas ni gastos en esta fase.

## Alcance inicial

La primera integración se limitará al editor de personajes actual y a operaciones no destructivas:
- consultar la estructura y las piezas existentes;
- seleccionar una pieza existente;
- proponer posición, rotación y escala dentro de límites;
- proponer/aplicar una pose existente o una pose nueva como datos del proyecto;
- solicitar una solución IK solo cuando la cadena y el solver la admitan;
- generar vista previa y deshacer.

Expresiones, escenas, audio, playlist y timeline se incorporarán cuando sus herramientas y contratos estén disponibles. La IA nunca debe inventar una capacidad ausente.

## Fases de construcción

1. **Contrato y límites:** este documento y el esquema de propuesta.
2. **Adaptador de solo lectura:** exponer contexto, selección, jerarquía y capacidades sin mutaciones.
3. **Validador y simulación:** convertir propuestas en cambios calculados sin aplicarlos.
4. **Transacciones aprobadas:** ejecutar operaciones permitidas, con undo y registro.
5. **Chat integrado:** panel persistente en todos los espacios de trabajo, con contexto del espacio activo.
6. **Proveedores:** integrar proveedores gratuitos opcionales mediante una interfaz común, sin darles permisos directos.
7. **Ampliación por herramientas:** rig, animación, escenas, audio, playlist y timeline, cada una con capacidades explícitas y pruebas.

## Estado técnico observado al iniciar

El prototipo actual está en `prototype/character-editor-v01/index.html`. El estado del proyecto y las funciones se mantienen principalmente en un script integrado; hay módulos separados para IK, malla, skinning, IO y geometría. Las poses, expresiones y controles IK ya tienen handlers, pero todavía no existe una fachada pública y estable para que un agente los opere.

Por ello, el primer trabajo de implementación será mapear las acciones reales y crear un adaptador estrecho; no se conectará una IA directamente a variables globales ni a handlers del DOM.

## Fuera de alcance de esta capa

- Modificar el código del editor.
- Instalar dependencias o cambiar la arquitectura del motor.
- Descargar/generar recursos externos por cuenta propia.
- Eliminar personajes, partes, rigs, escenas o archivos.
- Aplicar cambios persistentes sin aprobación humana.
- Hacer llamadas a proveedores de pago o consumir créditos sin autorización explícita.


## Protocolo de sincronización implementado

El adaptador `0.2.0-readonly` incorpora revisiones de proyecto/contexto y suscripción a eventos `project.changed`, `selection.changed`, `workspace.changed` y `context.changed`. La observación actual se basa en mutaciones de las zonas renderizadas del editor; no expone el DOM a la IA. Solo está disponible el espacio `character`. Las acciones creativas siguen sin ejecución remota ni permisos de escritura. El contrato detallado está en `contracts/synchronization-protocol.md`.

## Registro de capacidades del editor

El archivo `capability-registry.js` describe capacidades detectadas en los controles y funciones que existen en el editor de personajes. Cada entrada informa disponibilidad actual, espacio, categoría, soporte real (función de editor, controles manuales o lectura), parámetros, precondiciones, impacto, reversibilidad y si puede formar parte de una propuesta.

`proposalSupported` significa que el contrato de propuestas conoce esa operación; no significa que la IA pueda ejecutarla. Todas las capacidades mantienen `agentExecutionEnabled: false`. Las acciones que solo existen como controles manuales se identifican como tales y no se presentan como operaciones ejecutables por el agente.

El adaptador consume este registro mediante `getCapabilities()` y `getCapability(id)`, y emite `capabilities.changed` cuando cambia el catálogo efectivo, por ejemplo al cambiar la selección. El registro no invoca handlers ni modifica el proyecto.
