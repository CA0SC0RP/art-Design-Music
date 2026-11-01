# Living Paper Engine — dirección del motor de caricaturas para iPad

**Estado:** dirección de producto acordada como objetivo de trabajo el 2026-11-01. Este documento define la nueva línea; no afirma que la aplicación o sus funciones estén implementadas.

## 1. Objetivo

Transformar Living Paper Engine en un motor y estudio visual para crear caricaturas animadas y microhistorias. La primera interfaz debe poder utilizarse cómodamente desde un iPad, con una escena visible y controles directos para construirla y modificarla.

El usuario dirige la creación. ChatGPT se encarga de diseñar, escribir, modificar y revisar el código y los documentos del proyecto. No se incorpora Claude ni otro asistente de IA al flujo de trabajo.

La música y el sonido se diseñarán para cada microhistoria y se integrarán cuando la historia, los personajes y el ritmo narrativo estén definidos. No son el centro del motor.

## 2. Experiencia de uso deseada

La aplicación debe evolucionar hacia un estudio visual con:

- **Escenario/visor:** área principal donde se ve la caricatura y sus cambios.
- **Personajes y objetos:** elementos seleccionables dentro de la escena.
- **Panel de propiedades:** posición, tamaño, orientación, expresión, apariencia y parámetros disponibles para el elemento seleccionado.
- **Acciones y animación:** movimientos, gestos, poses, entradas, salidas y secuencias.
- **Línea de tiempo:** organización de acciones y escenas en el tiempo.
- **Escenas e historia:** posibilidad de organizar una microhistoria en varias tomas o secuencias.
- **Controles táctiles:** selección, arrastre, zoom, rotación y ajustes adecuados a la pantalla del iPad.
- **Vista previa:** reproducción inmediata de la escena o secuencia para revisar el resultado.

La interfaz debe ser visual y entendible; no debe exigir al usuario escribir código para dirigir la caricatura.

## 3. Flujo de creación

1. Crear un proyecto y definir formato, duración y estilo visual.
2. Crear o incorporar personajes, fondos y objetos.
3. Colocar los elementos en el escenario.
4. Seleccionar un elemento y modificarlo mediante controles visuales.
5. Definir acciones y movimientos en una línea de tiempo.
6. Organizar tomas y escenas para construir la microhistoria.
7. Reproducir, revisar y ajustar.
8. Añadir diálogo, efectos y música original cuando la historia lo requiera.
9. Exportar un resultado de vídeo en una etapa posterior, una vez resueltos formato, calidad y rendimiento.

La primera meta técnica no es producir una película completa: es conseguir una escena editable en iPad, con al menos un personaje u objeto seleccionable, modificable y animable mediante controles visuales.

## 4. Edición asistida desde ChatGPT

El flujo inicial de colaboración será:

- El usuario describe el cambio deseado en el chat.
- ChatGPT localiza y modifica el código del proyecto en la rama autorizada.
- El cambio queda guardado en GitHub y disponible en el entorno de desarrollo.
- El usuario abre o actualiza la vista previa desde el iPad y revisa el resultado.
- El usuario indica qué conservar o corregir; ChatGPT ajusta el código.

**Límite importante:** hasta que exista y se implemente un puente de edición específico, ChatGPT no tiene una conexión directa y continua con el lienzo que se está ejecutando en Safari ni puede observar automáticamente cada gesto del usuario. La primera iteración será un ciclo de cambios de código y actualización de la vista previa. Más adelante se evaluará un sistema de comunicación entre el editor, el estado de la escena y el asistente, sin asumir servicios externos ni gastos.

## 5. Principios técnicos iniciales

Son criterios de diseño, no decisiones irreversibles de implementación:

- Prioridad de uso: iPad y Safari; el entorno de desarrollo puede seguir siendo GitHub Codespaces.
- Interfaz web adaptable a pantalla táctil, con controles grandes y paneles que no oculten innecesariamente el escenario.
- Separar la interfaz de edición, el modelo de la escena, el motor de reproducción y los recursos.
- Representar personajes, objetos, escenas, acciones y animaciones mediante datos editables.
- Mantener una vista previa interactiva y una reproducción determinista de la línea de tiempo.
- Diseñar el motor para que admita diferentes técnicas visuales; no imponer papel recortado, paralaje ni movimiento ambiental a todas las caricaturas.
- Evaluar Canvas, SVG, DOM u otras técnicas mediante prototipos pequeños y pruebas reales en Safari del iPad antes de comprometer la arquitectura.
- Mantener los recursos y proyectos locales o dentro del repositorio mientras sea viable.
- No depender de APIs de IA, servicios de pago ni generación externa sin autorización expresa.
- No introducir telemetría, anuncios intrusivos ni cuentas remotas como requisito del prototipo.

## 6. Alcance inicial y etapas

### Etapa A — banco de pruebas visual
- Interfaz web inicial para iPad.
- Escenario con elementos seleccionables.
- Panel para cambiar propiedades.
- Movimiento básico con reproducción y pausa.
- Guardado/carga de la descripción de la escena.

### Etapa B — editor de animación
- Línea de tiempo.
- Acciones y poses.
- Curvas o interpolaciones de movimiento.
- Varias capas y objetos.
- Deshacer/rehacer.

### Etapa C — creador de microhistorias
- Varias escenas y tomas.
- Personajes reutilizables.
- Diálogos, voz y efectos.
- Música compuesta para cada historia.
- Vista previa de la historia completa.

### Etapa D — salida y optimización
- Exportación de vídeo.
- Pruebas de calidad, memoria y rendimiento en iPad.
- Formatos y resoluciones finales por decidir.

No se fija todavía una técnica única de animación, un estilo gráfico definitivo, un formato de proyecto final ni un sistema de generación de personajes.

## 7. Reutilización del trabajo anterior

Los prototipos prototype/level-01 a prototype/level-05, el motor experimental living-paper-engine/, la imagen maestra y los documentos del proyecto anterior se conservan como antecedentes.

No se consideran automáticamente parte del nuevo producto. Cada componente deberá revisarse y clasificarse como:
- reutilizable sin cambios;
- reutilizable con adaptación;
- referencia de prueba;
- obsoleto para el objetivo actual.

No borrar ni sobrescribir esos recursos durante esta clasificación.

## 8. Colaboración y control de cambios

- ChatGPT es el único asistente de IA del flujo de desarrollo.
- El usuario conserva las decisiones creativas y la aprobación de entregas.
- Trabajar en feature/living-paper-engine-foundation mientras siga siendo la rama autorizada.
- No modificar main, fusionar ramas, abrir PR ni desplegar sin autorización expresa.
- No crear repositorios ni activar servicios de pago.
- Antes de escribir, verificar repositorio, rama y archivos existentes.
- No sobrescribir ni eliminar archivos sin autorización.
- Registrar cambios, pruebas reales, limitaciones y siguiente paso.
- Distinguir siempre entre prototipo, propuesta y función comprobada en el iPad.

## 9. Próximo objetivo concreto

Auditar el contenido actual de living-paper-engine/ y prototype/ en modo de solo lectura. Identificar qué piezas pueden servir como base para el primer escenario editable. Después, proponer la estructura mínima de la aplicación iPad-first y construir una prueba pequeña, aislada y reversible en esta rama.

**Criterio de éxito de la primera prueba:** desde Safari en el iPad, el usuario puede abrir un escenario, seleccionar un elemento, modificar al menos su posición y tamaño con controles visuales, reproducir una animación sencilla y observar el cambio sin escribir código.
