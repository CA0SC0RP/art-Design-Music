# Living Paper Engine — nueva dirección y auditoría inicial de reutilización

Fecha de revisión: 2026-11-01  
Rama de trabajo: `feature/living-paper-engine-foundation`  
Repositorio: `CA0SC0RP/art-Design-Music`

## 1. Dirección aprobada

El objetivo principal deja de ser un reproductor de paisajes/loops sincronizados con música. Living Paper Engine pasa a ser un motor artístico para producir microhistorias y cortometrajes animados con estética de papel multicapa. La duración de referencia inicial de cada pieza será aproximadamente un minuto; no es un límite técnico ni una garantía de monetización.

La música se conserva como banda sonora, diálogo, ambiente y efectos, pero no dirige necesariamente el movimiento de todo el escenario.

La identidad visual debe seguir siendo artesanal: recortes, capas físicas aparentes, profundidad, bordes, pliegues, volumen, sombras, texturas y deformación del papel. No convertir el resultado en una caricatura 2D genérica.

## 2. Arquitectura objetivo por etapas

1. **Paper Geometry** — piezas, siluetas, capas, materiales, pliegues, volumen, sombras y deformación.
2. **Character Rigging** — esqueletos, jerarquías, pivotes, anclajes, pesos, mallas y cinemática inversa.
3. **Character Animation** — poses, ciclos y acciones: caminar, correr, saltar, gesticular y expresarse.
4. **Scene Sequencer** — escenas, actores, acciones, entradas/salidas y transiciones.
5. **Behavior System** — reacciones y comportamientos narrativos.
6. **Camera System** — encuadres, seguimiento, movimientos y transiciones.
7. **Timeline** — tiempo, keyframes, pistas, sincronización y edición.
8. **Audio System** — voz, diálogos, música, ambiente y efectos.

La secuencia de trabajo es deliberada: consolidar la geometría de papel y el rigging antes de producir personajes complejos o un editor completo. La exportación/render final de historias se definirá después de validar la representación de escenas y el secuenciador.

## 3. Estado real del motor propio

La rama auditada apunta al commit `7dc12479bd7caf30b7205e43db88825cd945506f`.

El motor actual usa PixiJS 8.10.1 desde CDN y contiene una base útil que debe conservarse y auditarse antes de reorganizar:

- `engine.js`: `LivingPaperEngine`, `PaperPiece`, `PaperJoint`, `PaperFlex` y `PaperMesh`.
- `rigging.js`: anclajes, pliegues y enlace de ángulo de articulación a pliegue.
- `deformation.js`: deformación localizada de malla.
- `volume.js` y `edges.js`: volumen/iluminación aparente y cantos de papel.
- `layers.js`, `layer-groups.js` y `collision-math.js`: interacción geométrica 2.5D entre capas.
- `physics-mesh.js`: proxy físico de menor resolución, actualmente fundación aislada y no integrado en el solver.

### Límites que no deben confundirse

- El rigging actual es una base geométrica experimental; no equivale todavía a un sistema completo de personajes con esqueletos, pesos, IK, skins y editor.
- La articulación actual enlazada a pliegues es útil para papel, pero no resuelve por sí sola animación de personajes.
- El contacto entre capas es una aproximación 2.5D, no un solver volumétrico.
- El proxy físico de baja resolución no está conectado al solver y no tiene una mejora de rendimiento demostrada.
- El render usa APIs PixiJS que deben verificarse en ejecución real; los tests matemáticos no prueban por sí solos la integración gráfica.

## 4. Auditoría inicial de proyectos externos

### 4.1 Rigby2D — candidato para estudiar y reutilizar componentes

Repositorio: https://github.com/jaisurya-dev-art/rigby2d  
Rama consultada: `develop`  
Versión indicada en `package.json`: `0.4.3`  
Licencia declarada: `MIT OR Apache-2.0`.

La documentación y el README describen:
- Esqueletos, huesos, mallas ponderadas y mallas vinculadas.
- IK y restricciones de transformación, ruta, física y sliders.
- Skins, secuencias de imágenes, clipping, eventos y pistas de animación.
- Dopesheet, graph editor, poses y controles faciales.
- Un espacio de trabajo Film con cámara animable, pistas de audio, lip-sync y exportación de secuencias PNG, WebM y MP4.
- Composición de escenas con varios personajes, clips, parallax y cámara.
- Core JavaScript independiente y renderer WebGL de referencia; también runtimes para Phaser, Unity, Godot, Cocos y Rust.

**Compatibilidad:** no se encontró un runtime PixiJS 8 nativo en la documentación consultada. El runtime JavaScript expone poses/cuadriláteros y tiene un renderer WebGL propio; el plugin publicado es para Phaser, no PixiJS. Por ello no se debe declarar integración directa con nuestro motor. La ruta de investigación es estudiar el core de datos/animación y determinar si se puede adaptar la salida de poses y mallas a nuestro renderer PixiJS sin reemplazar el sistema de papel.

**Licencia y activos:** el código se declara MIT o Apache-2.0, sujeto a conservar avisos y cumplir la licencia elegida. Las marcas/logos y ciertos personajes/demos están excluidos o tienen licencia propia; no reutilizar branding ni assets de demostración como si fueran código abierto.

**Decisión provisional:** candidato prioritario para estudiar arquitectura y algoritmos de rigging/animación; no copiar el editor entero ni integrar código hasta revisar módulos concretos, dependencias, avisos y pruebas.

### 4.2 pixi-bones — no es, por ahora, un motor de rigging reutilizable

Repositorio localizado: https://github.com/modjke/pixi-bones  
Rama consultada: `development`.

Su `package.json` depende de PixiJS `^8.9.2`, pero el repositorio es muy pequeño. El `src/main.js` revisado solo inicializa PixiJS, crea una cuadrícula de sprites de conejito y rota un contenedor. No se encontró README ni archivo LICENSE en las rutas comprobadas, y el código visible no implementa huesos, esqueleto, deformación de malla ni editor de rigging.

**Decisión provisional:** descartar como fuente de rigging. Puede servir únicamente como ejemplo mínimo de inicialización de PixiJS 8, algo que nuestro motor ya hace.

### 4.3 “Bones” e “IceBones”

En esta primera auditoría no se pudo identificar de forma inequívoca un repositorio independiente llamado “Bones” o “IceBones” que corresponda a las descripciones previas. No se deben tratar como candidatos confirmados hasta disponer de URL exacta y verificar repositorio, actividad, código y licencia.

## 5. Estrategia de integración

No reemplazar Living Paper Engine por otro motor. Mantener la propiedad del formato visual y de las características de papel.

Separar conceptualmente:
- **Core de papel propio:** geometría, capas, materiales, pliegues, volumen, sombras y contacto.
- **Core de animación de personajes:** rig, pose, IK, skins y evaluación temporal; estudiar si partes del core Rigby2D se pueden adaptar.
- **Adaptador de render:** convertir poses/mallas a primitivas y mallas PixiJS 8, manteniendo el acabado de papel.
- **Secuenciación propia:** escenas, cámara, timeline, audio y comportamiento, reutilizando solo componentes cuya integración y licencia estén verificadas.

Toda integración debe pasar por un prototipo aislado y pruebas de equivalencia visual, deformación, estabilidad y rendimiento. Evitar copiar archivos grandes sin entender interfaces o dependencias. Mantener avisos de copyright y licencias por cada componente externo.

## 6. Próximas tareas de auditoría

1. Revisar módulos del core de Rigby2D: modelo de esqueleto, evaluación de pose, deformación de mallas, IK, pistas y serialización.
2. Identificar dependencias y qué partes son independientes del renderer/editor.
3. Revisar la API exacta de PixiJS 8 usada por nuestro `PaperMesh`, buffers de vértices y ciclo de actualización.
4. Definir un formato de personaje de papel que relacione huesos, piezas, mallas, pliegues, materiales y sombras.
5. Diseñar un prototipo de personaje sencillo con torso, cabeza, brazos y piernas, antes de implementar el secuenciador completo.
6. Mantener el proxy físico separado hasta demostrar su utilidad e integración.

## 7. Reglas de trabajo

- Trabajar solo en `feature/living-paper-engine-foundation`.
- No modificar `main`, no fusionar ramas y no abrir PR sin autorización expresa.
- No crear repositorios nuevos ni activar servicios de pago.
- Verificar estado, SHA, archivos y CI antes de cada cambio relevante.
- No declarar rendimiento, compatibilidad ni pruebas exitosas sin medición verificable.
- Conservar los prototipos y tests anteriores mientras se separa qué sirve a la nueva dirección.
