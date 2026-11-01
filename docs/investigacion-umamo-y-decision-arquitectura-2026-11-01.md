# Investigación de Umamo y decisión de arquitectura

**Fecha:** 2026-11-01  
**Repositorio revisado:** https://github.com/umamoorg/umamo  
**Rama de trabajo de Art Design Music:** `feature/living-paper-engine-foundation`  
**Tipo de trabajo:** investigación documental; no se incorporó código externo ni se instalaron dependencias.

## 1. Decisión ejecutiva

Umamo se conserva como **referencia de investigación para modelado y preparación de personajes 2D**, no como base ejecutable del editor de Art Design Music.

La razón principal es que Umamo todavía no implementa animación. Su objetivo actual es el modelado de marionetas, edición de mallas, UV, parámetros y compatibilidad con formatos Live2D. Además, su renderizador no está operativo en iPadOS y el proyecto se encuentra en fase alfa.

El motor de Art Design Music seguirá siendo una aplicación web propia, diseñada primero para Safari en iPad. Se estudiarán conceptos y flujos de Umamo, pero no se copiará ni integrará código GPL-3.0 en el núcleo del producto.

## 2. Capacidades útiles identificadas

La documentación y estructura del proyecto describen:

- Importación de ilustraciones por capas desde PSD, Krita (KRA), Clip Studio (CLIP) y formatos rasterizados.
- Relación entre capas del arte fuente y partes editables del personaje.
- Jerarquía de partes, objetos dibujables, deformadores y mallas.
- Generación automática de mallas a partir de píxeles opacos.
- Edición de geometría y UV.
- Parámetros y formas clave para controlar propiedades del modelo.
- Paneles de fuentes, jerarquía, propiedades y viewport.
- Historial de edición y comandos centralizados.
- Formatos de proyecto UMA y compatibilidad de importación/exportación con CMO3 y MOC3 hasta las versiones documentadas de Cubism 5.4.
- Arquitectura modular que separa formato, modelo de marioneta, geometría, renderizado, edición y UI.

Estas capacidades aportan referencias para el futuro editor de personajes, aunque no constituyen funciones ya disponibles en Art Design Music.

## 3. Limitaciones verificadas

Según el README y los archivos de construcción del repositorio:

- Umamo se describe como software alfa y advierte que los proyectos deben respaldarse y probarse sobre copias.
- La animación no está implementada; aparece como objetivo futuro.
- El objetivo Android sigue bloqueado por trabajo incompleto en la capa gráfica.
- En iPadOS la documentación declara que la interfaz puede cargar, pero no existe un renderizador de marionetas funcional y JDOM presenta incompatibilidad.
- El módulo UI usa Compose Multiplatform para escritorio y Android; no constituye una interfaz web que podamos integrar en Safari.
- El módulo de render tiene una separación de backend interesante, pero el backend Metal/iOS está descrito como stub, no como renderizador listo para producción.
- Los archivos CMO3/MOC3 incluyen trabajo de ingeniería inversa; su compatibilidad no debe confundirse con una especificación abierta y estable para nuestro formato de proyecto.

Por tanto, Umamo no resuelve nuestra primera meta funcional: un escenario editable y animable que funcione en Safari del iPad.

## 4. Licencia

El repositorio declara GNU GPL-3.0.

Podemos estudiar libremente sus ideas, flujos de interacción y documentación. Sin embargo, copiar, adaptar o integrar código de Umamo en un producto distribuido puede someter la obra derivada a las obligaciones de GPL-3.0, incluyendo la entrega del código fuente correspondiente bajo esa licencia.

Decisión preventiva: no copiar módulos ni incorporar dependencias de Umamo al motor propio. Si en el futuro se considera reutilizar código, se hará una revisión específica de licencia y de la arquitectura de distribución antes de hacerlo.

## 5. Qué aprender de Umamo sin depender de él

Los siguientes conceptos sí deben influir en el diseño del editor:

1. **Arte fuente y partes:** conservar la ilustración original y establecer relaciones explícitas entre sus capas y las partes editables del personaje.
2. **Jerarquía de personaje:** organizar personaje, partes, deformadores y objetos en una estructura comprensible.
3. **Malla por parte:** permitir que una parte dibujada pueda deformarse sin tratar todo el personaje como una sola imagen rígida.
4. **Selección contextual:** seleccionar directamente en el escenario y reflejar la selección en el árbol de objetos y el inspector.
5. **Propiedades centralizadas:** mostrar solo controles relevantes para el objeto o parte seleccionada.
6. **Edición reversible:** incorporar historial y deshacer/rehacer desde el inicio del editor, cuando el modelo de escena esté definido.
7. **Separación de responsabilidades:** mantener separados el documento, el modelo del personaje, la geometría, el renderizador, la sesión de edición y la interfaz.
8. **Persistencia:** guardar las relaciones entre arte fuente, partes, mallas, parámetros y ajustes de escena en un formato propio y versionable.

Estos son principios de diseño propuestos, no código ni funcionalidades ya implementadas.

## 6. Relación con las otras fuentes investigadas

| Fuente | Aporte principal | Uso previsto |
|---|---|---|
| Umamo | Modelado, capas, mallas, UV y edición táctil como referencia | Estudiar el flujo de preparación de personajes; no integrar código |
| Rigby2D | Rigging, huesos, poses, animación, timeline y salida audiovisual | Referencia principal para estudiar el sistema de animación |
| Grokbot Animation | Expresiones, estados, secuencias y diálogo sincronizado | Referencia para expresiones y dirección de diálogos |
| Awesome-2D-Animation | Catálogo de técnicas, investigaciones y herramientas | Fuente continua para investigar interpolación, capas, trazos y animación asistida |

Ninguna de estas fuentes determina por sí sola la arquitectura final. Las licencias, compatibilidad con Safari y rendimiento deben revisarse por separado.

## 7. Decisión técnica para Art Design Music

La aplicación principal seguirá siendo web-first y táctil:

- No portar Umamo ni su interfaz Kotlin/Compose.
- No depender de CMO3/MOC3 como formato nativo del proyecto.
- Diseñar un formato de escena propio, legible y versionable.
- Mantener separados el documento de escena, los personajes, las partes, las mallas, la animación y la interfaz.
- Evaluar PixiJS y SVG/Canvas mediante una prueba funcional real en Safari del iPad; no cerrar todavía una elección irreversible.
- Mantener el motor experimental anterior y sus prototipos como antecedentes, sin sobrescribirlos.

## 8. Próxima etapa de desarrollo

Construir una prueba aislada del editor web, sin alterar el laboratorio anterior:

1. Escenario adaptable a pantalla táctil.
2. Personaje geométrico provisional compuesto por partes independientes.
3. Selección directa por toque.
4. Arrastre, escala y rotación.
5. Reproducción y pausa de un movimiento sencillo.
6. Separación visual entre escenario, jerarquía de objetos e inspector.
7. Posteriormente, probar guardado/carga y una primera articulación por partes.

El personaje inicial será estrictamente provisional; no establece el estilo artístico definitivo. No se utilizarán APIs de IA, servicios externos ni recursos de pago.

## 9. Verificación

- Se consultaron README, FEATURES, TODO, CHANGELOG, LICENSE, configuración Gradle y módulos de geometría, runtime, render, edición y UI de Umamo.
- Se confirmó la rama de trabajo autorizada en Art Design Music.
- No se modificó `main`.
- No se incorporó código de Umamo ni de las otras referencias.
- No se instalaron dependencias.
- No se ejecutaron pruebas de navegador ni pruebas en iPad.
- No se declara compatibilidad de Umamo ni del nuevo editor con Safari/iPadOS.

**Estado:** investigación documental completada. Siguiente trabajo recomendado: implementar la primera prueba aislada del estudio visual web en la rama autorizada.
