# Cuadro Vivo — bitácora

## 2026-10-26 — Organización del trabajo
- Se acuerda evitar duplicar tareas entre asistentes.
- ChatGPT: dirección y producción visual, especificación y revisión de capas.
- Claude: arquitectura, motor, visor, audio, controles e integración.
- El usuario mantiene la aprobación creativa y técnica de decisiones importantes.
- No modificar `main` directamente ni reemplazar la imagen maestra sin autorización.

## 2026-10-26 — Propuesta técnica de Claude
- Propuesta: web modular, JavaScript y Canvas 2D; Web Audio y alternativa precalculada; definición `work.json` por obra; galería y posible contenedor Android TV futuro.
- Riesgos señalados: memoria con capas 4K, rendimiento en TCL, políticas de audio del navegador y necesidad de pruebas en dispositivos reales.
- Estado: propuesta, no implementación.

## 2026-10-26 — Contrato v2, esquema y plan de validación (propuesta en rama)
- Rama `contrato/capas-v2-esquema-y-validacion`, creada desde `main` (`f81b03c`). Es una propuesta pendiente de revisión; nada se ha integrado en `main`.
- Verificado en GitHub: la rama `preparacion/contrato-datos-y-protocolo` ya estaba integrada en `main` (PR #1). `main` no tenía `works/`, `src/`, audio ni capas.
- Verificado sobre la maestra: PNG RGB de 8 bits, 3840 × 2160, sin perfil de color; SHA-256 registrado en `README.md`. No se modificó.
- Comprobación visual de las cajas del paquete v0.1 contra la maestra (copia temporal, recortes al 100 %): la del sol no incluye el disco solar y la de aves deja fuera al menos otro grupo de 5; solo la del venado coincide de forma aproximada. Por eso las coordenadas deben medirse de nuevo (nota en `docs/auditoria-capas-v0-1.md`).
- Archivos nuevos: `works/index.json`, `works/work.schema.json`, `docs/plan-de-validacion-automatica.md`. Reescrito: `docs/contrato-de-capas-y-work-json.md`. Corregidos: `README.md`, `ESTADO_PROYECTO.md`. Retocados con notas o líneas puntuales: `INSTRUCCIONES_PARA_IA.md`, `ARQUITECTURA.md`, `docs/auditoria-capas-v0-1.md`, `docs/flujo-produccion-por-capas.md`, `docs/control-calidad-capas-composicion.md`, `docs/plan-de-separacion-de-capas.md`.
- Propuestas técnicas (pendientes de aprobación): `schemaVersion` 2; capas `fullCanvas` o `cropped` con `size`, `scale`, `placement` y `alphaBounds`; mediciones registradas con el hash de la maestra; vocabulario de estados único con aprobación del usuario atada al hash del archivo; zonas de reconstrucción `behind-element` y `frame-bleed`; canales de movimiento `translate`, `rotate`, `scale` y `opacity` con límites duros y por tipo de capa; marco único, fijo y con el `zIndex` más alto; `render.fit` siempre `contain`.
- Comprobaciones ejecutadas (ad hoc, en una carpeta temporal; el validador no existe y esas pruebas no se han guardado en el repositorio): `work.schema.json` es un esquema válido 2020-12; el ejemplo del contrato valida contra él; 26 casos negativos construidos a mano fueron rechazados por el esquema y 8 controles positivos fueron aceptados; sin claves duplicadas en los JSON; reglas del índice; 13 enlaces relativos entre documentos resuelven; la maestra es idéntica a la de `main`.
- No ejecutado: validador del plan (no está implementado), reglas entre campos (zIndex únicos, marco en primer plano, archivos y hashes), comprobaciones de píxeles y composición contra la maestra (no hay capas), pruebas en iPad Safari y en el TCL 55Q650G.
- El esquema solo comprueba forma y reglas locales; que `zIndex` sean únicos o que el marco esté arriba son reglas del plan, aún sin implementar.

## 2026-10-27 — Corrección técnica del contrato v2 (misma rama, sin PR ni cambios en `main`)
- Pedido del usuario tras revisar la propuesta: conservar la estructura y cerrar cinco huecos técnicos.
- Esquema (ejecutado en pruebas): `date` solo acepta fechas reales de calendario (patrón comparado con `datetime.date` para todos los días de 0001 a 9999, más `minLength`/`maxLength` 10 para rechazar el salto de línea final); `safeBounds` > 0 en cualquier eje exige `reconstruction.required: true`, al menos una zona y todas las zonas `aprobado`.
- Limitación de JSON Schema, documentada: no puede sumar ni comparar campos. Por eso `x + width ≤ 3840` e `y + height ≤ 2160` para todo rectángulo (GEO-1) y `opacity.min ≤ opacity.max` (MOV-10) son reglas del validador, **aún no implementado**. Las pruebas incluyen una comprobación de referencia mínima de ambas y un caso que muestra que el esquema solo las deja pasar.
- Nuevo `tests/test_contrato_v2.py`. Resultado real: 45 pruebas, 30 superadas, 15 omitidas (reglas pendientes), 0 fallos. Con el patrón de fecha antiguo fallan 10 pruebas y sin la regla de `safeBounds` fallan 6 (comprobado en una copia temporal).
- Sin cambios: imagen maestra (mismo SHA-256), capas, motor. Los límites de movimiento siguen siendo valores propuestos, pendientes de pruebas visuales y de rendimiento.

## Registro futuro
Anotar cada decisión aprobada, cambio de esquema, archivo creado, prueba ejecutada y limitación encontrada. Distinguir hechos verificados de propuestas. No registrar una operación como completada hasta verificar su resultado.

## 2026-10-27 — Dirección artística, sprites y música compuesta con la escena
- El usuario acordó que todas las obras deben parecer construidas con papel recortado, no óleo ni cartoon: cartulina visible, bordes recortados, sombras entre planos y profundidad artesanal. Tearaway es una referencia conceptual de materialidad, no para copiar diseños.
- Para el primer cuadro, marco ornamental dorado completo y fijo; exterior detrás del marco negro OLED puro (#000000), sin madera adicional.
- Se acuerda que todos los elementos puedan tener vida sutil: animales, plantas, agua/río, cascada, nubes, niebla, sol/luz, pájaros, casa y otros objetos de la escena cuando el movimiento sea coherente. No es una película ni una animación frenética.
- El plan visual debe combinar capas espaciales con sprites/hojas de poses y ciclos largos para elementos como el río. Cada objeto tendrá comportamiento, velocidad, fase y amplitud propios.
- La música será original y se diseña junto con cada cuadro. Referencias iniciales: ambient, lo-fi y chillout; cada obra puede variar de género y emoción. Tempo tentativo para el primer cuadro: alrededor de 72 BPM, pendiente de composición.
- La partitura audiovisual debe definir marcas temporales/eventos musicales para movimientos concretos y complementarse con análisis de audio suavizado. Evitar basarse solo en graves/agudos o activar objetos mecánicamente por frecuencia.
- Idea futura para otra obra: paisaje gótico con castillo lejano, niebla/humo de papel y murciélagos en vuelo, con música misteriosa. No forma parte del primer cuadro.
- Se creó la rama `direccion-artistica-musica-sprites-2026-10-27` desde `contrato/capas-v2-esquema-y-validacion` y el documento `docs/direccion-artistica-y-partitura-audiovisual.md`. Esta rama no está fusionada. No se generaron capas finales, sprites ni música.
- Siguiente: Claude lee toda la documentación, entrega una auditoría del estado real y propone/implementa solo un modelo técnico aislado para capas, sprites/ciclos y eventos musicales, sin tocar la maestra, sin afirmar que hay recursos finales y sin fusionar/desplegar.

## 2026-10-29 — Auditoría técnica del estado actual (sin cambios de contrato, esquema, pruebas ni código)
- **Fecha y objetivo:** 2026-10-29. Auditar el estado real del repositorio tras los cambios del 27-10 y proponer la siguiente fase. Fase de solo lectura, mediciones y documentación.
- **Rama y commit de partida:** `auditoria/estado-2026-10-29`, creada desde `main` en `e2c7399` (fusión del PR #2). Sin cambios pendientes al empezar.
- **Archivos creados o modificados:** nuevo `docs/auditoria-tecnica-2026-10-29.md`; modificados `ESTADO_PROYECTO.md` (sección de ramas y línea de pruebas) y esta bitácora. No se tocaron contrato, esquema, plan, índice, `tests/`, `README.md` ni la imagen maestra.
- **Cambios y motivo:** el informe contiene la auditoría y la propuesta de fase siguiente. `ESTADO_PROYECTO.md` se corrigió porque registraba `main` en `f81b03c` y las ramas del contrato y de dirección artística como no fusionadas; ambas están contenidas en `main`. Las entradas anteriores de esta bitácora y los textos obsoletos de `README.md:43` y `docs/plan-de-validacion-automatica.md:150` se dejan sin editar (el informe los lista en P1) hasta que lo apruebes.
- **Pruebas ejecutadas y resultados reales** (scripts temporales fuera del repositorio, salvo el primero):
  - `python3 -I tests/test_contrato_v2.py` sobre `e2c7399`: 45 pruebas, 30 superadas, 15 omitidas, 0 fallos, 4,05 s. Árbol limpio después.
  - Los 69 casos de las pruebas, con `jsonschema` 4.26.0 y con Ajv 8.18.0: 0 discrepancias de veredicto.
  - Patrón de fecha compilado como ECMAScript contra el calendario de JavaScript: 3 719 628 fechas, 0 discrepancias.
  - Ajv con `strict: true`: no compila (`strictRequired`). Con `strict: "log"`: compila con 31 avisos (6 `strictRequired`, 25 `strictTypes`).
  - 16 sondeos de huecos: el esquema acepta 14 documentos que violan reglas del plan aún sin implementar y rechaza 2 (canal `frames` y `kind` inexistente).
  - Mediciones indicativas sobre la maestra (resolución efectiva y borde exterior), sin modificarla; blob y SHA-256 idénticos.
- **No ejecutado:** validador (no existe), reglas entre campos, PNG reales, composición contra la maestra, pruebas en iPad Safari y TCL 55Q650G. No se pudo instalar Ajv desde npm (registro inalcanzable); se usó una copia preinstalada.
- **Problemas encontrados:** textos de estado contradictorios con el repositorio; maestra canónica sin confirmar; el contrato v2 no cubre sprites, ciclos, aleteo, eventos musicales ni el negro OLED; Ajv estricto no compila el esquema; 18 reglas del plan sin prueba ni marcador; sin `.gitignore` ni `requirements`.
- **Pendiente:** tus decisiones D1 a D9 del informe (§8.1). No se inicia la siguiente fase sin tu aprobación.


## 2026-11-01 — Inicio del prototipo de cinco capas y política de recursos
- **Objetivo:** demostrar primero la composición y el movimiento independiente con cinco planos sencillos, sin utilizar arte final ni consumir generaciones de imágenes.
- **Rama y punto de partida:** `prototipo/prueba-cinco-capas-01`, creada desde `auditoria/estado-2026-10-29`. No se modificó `main`.
- **Archivos creados:**
  - `prototype/level-01/index.html`: visor web 16:9 con cinco capas, animaciones suaves independientes y control de pausa/reanudación.
  - `prototype/level-01/assets/01-cielo.svg`
  - `prototype/level-01/assets/02-montanas.svg`
  - `prototype/level-01/assets/03-bosque.svg`
  - `prototype/level-01/assets/04-rio.svg`
  - `prototype/level-01/assets/05-primer-plano.svg`
  - `prototype/level-01/README.md`: alcance, limitaciones y protocolo de prueba.
  - `docs/politica-de-recursos-visuales.md`: fuentes, licencias, atribución, capas, sprites, hojas de sprites, secuencias de poses y control de costos.
- **Implementación:** cinco SVG originales provisionales como archivos separados; composición por profundidad; movimientos CSS sutiles y diferenciados; botón de pausa/reanudación; respeto por la preferencia de movimiento reducido del sistema.
- **Protecciones:** no se usó ni modificó la imagen maestra; no se añadieron recursos externos ni finales; no se generaron gastos; no se tocó `main`.
- **Pruebas:** no se ha ejecutado todavía en navegador ni en iPad Safari. Los archivos están creados en la rama, pero la funcionalidad visual queda pendiente de verificación real.
- **Siguiente paso:** habilitar acceso de prueba desde Safari, verificar carga de los cinco SVG y comportamiento de pausa/movimiento, corregir cualquier problema y solo entonces avanzar.

- **Publicación de prueba:** se añadió `.github/workflows/prototipo-cinco-capas.yml` para GitHub Pages (runner estándar `ubuntu-latest`). La consulta de ejecuciones de Actions devolvió cero ejecuciones; por tanto, no se confirma que Pages esté habilitado ni que exista una URL pública funcional. Pendiente comprobar el flujo y no compartir una URL como operativa hasta que termine correctamente.


## 2026-10-31 — Corrección de animaciones internas tras prueba visual fallida
- El usuario informó que el prototipo publicado seguía completamente estático.
- Inspección directa de `index.html` y de los cinco SVG de la rama: se encontró que cielo, nubes y estrellas eran estáticos; el río tenía solo una forma y dos trazos estáticos. El CSS movía únicamente el SVG completo de algunas capas, lo cual no implementaba los comportamientos solicitados.
- Se actualizó `prototype/level-01/assets/01-cielo.svg`: dos ciclos lentos e independientes para las nubes y parpadeo escalonado de cuatro estrellas.
- Se actualizó `prototype/level-01/assets/04-rio.svg`: reflejos y trazos de agua con desplazamiento continuo, además de dos pulsos de ondas.
- Se actualizó `prototype/level-01/README.md` y `ESTADO_PROYECTO.md` para registrar el cambio y distinguirlo de una prueba aprobada.
- No se modificó `main`, no se tocó la imagen maestra y no se incurrió en gastos.
- Pendiente: confirmar que GitHub Pages publicó el último commit y validar en Safari del iPad. No se afirma todavía que el movimiento haya sido comprobado en dispositivo real.


## 2026-11-01 — Validación en Firefox y prueba de 14 sprites
- El usuario confirmó que el prototipo de cinco capas se ve animado en Firefox. Se registra como validación visual reportada por el usuario en ese navegador. Chrome continúa sin mostrar correctamente el movimiento; la causa no está diagnosticada. Safari de iPad sigue pendiente.
- Se creó `prototype/level-02/index.html` en la rama `prototipo/prueba-cinco-capas-01`: 14 sprites vectoriales de prueba, con ciclos independientes para vuelo/aleteo de aves, vuelo/batido de mariposas, caída/rotación de hojas y nado/cambio de dirección de peces. Incluye botón de pausa y soporte de movimiento reducido.
- Se modificó `.github/workflows/prototipo-cinco-capas.yml` para publicar el Nivel 01 en la raíz de Pages y el Nivel 02 bajo `/level-02/`, sin cambiar el punto de entrada anterior.
- Commits de esta etapa: creación del Nivel 02 `e2c0321`; publicación conjunta `51c906d`.
- No se modificó `main`, la imagen maestra ni se usaron recursos finales, audio, APIs externas o generación de imágenes. No hay gasto asociado.
- Pendiente: comprobar ejecución exitosa de GitHub Actions y abrir el Nivel 02 en Firefox; verificar los 14 sprites, pausa/reanudación y fluidez. Luego probar Safari en iPad y revisar Chrome por separado.


## 2026-11-01 — Nivel 03: escena viva avanzada
- Se añadió `prototype/level-03/index.html` como prueba más compleja, a petición del usuario.
- Incluye 12 estrellas con parpadeos independientes, luna con resplandor pulsante, nubes a dos velocidades, 3 aves con vuelo/aleteo, 5 luciérnagas, 2 mariposas, 3 hojas, árboles con balanceo, cascada con flujo, dos corrientes de río, tres ondas y 2 peces con cambio de dirección.
- Se añadieron controles para pausar/reanudar y ajustar la velocidad global; se respeta `prefers-reduced-motion`.
- Se amplió el workflow de Pages para publicar el Nivel 03 en `/level-03/` sin retirar los prototipos anteriores.
- Commits de esta prueba: escena `e64140b`; workflow `f64b4f3`; README `aee466a`; actualización del estado `81b1738`.
- No se tocó `main`, no se empleó imagen maestra, no se generó arte final ni audio y no hubo gasto externo.
- Pendiente de verificar: ejecución de Pages y prueba visual del Nivel 03 en Firefox; después Safari en iPad. La incidencia de Chrome no se considera resuelta.


## 2026-11-01 — Nivel 04: Ecosistema vivo
- A petición del usuario se creó `prototype/level-04/index.html` en la rama `prototipo/prueba-cinco-capas-01`.
- La escena añade profundidad por planos, bruma, nubes, viento compartido en árboles/ramas/hojas/flores, tres aves, cascada, bruma de agua, corrientes y reflejos del río, ondas, peces, mariposas y luciérnagas.
- Se conservan pausa/reanudación y velocidad global de 0.5× a 1.8×. La velocidad modifica los tiempos de animación, no la posición de los objetos.
- Se añadió `prototype/level-04/README.md` y se actualizó `.github/workflows/prototipo-cinco-capas.yml` para publicar en `/level-04/` junto a los niveles anteriores.
- Commits: escena `c649da4`; README `7055c5c`; workflow `e9aea3c`.
- Recursos SVG provisionales; sin imagen maestra, recursos finales, audio, APIs externas ni gastos. No se modificó `main`.
- Pendiente: comprobar Actions/Pages y validación visual del usuario en navegador, incluyendo distribución de elementos, viento, agua, velocidad y pausa.


## Actualización — 2026-11-01: Nivel 05, Ecosistema reactivo
- A petición del usuario se creó `prototype/level-05/index.html` como una nueva escena SVG provisional 16:9.
- La prueba incorpora viento escalonado en copas, ramas y pastos; semillas transportadas por el viento; rayos de luz y sombra móvil de nubes; cascada, dos patrones de corriente del río, reflejos y ondas; aves, mariposas, luciérnagas y peces; planos de profundidad y bruma.
- Se conservan pausa/reanudación y control global de velocidad de 0.5× a 1.8×. El control modifica las duraciones de los ciclos, no las posiciones de los elementos.
- Se añadieron `prototype/level-05/README.md` y publicación de GitHub Pages en `/level-05/`, manteniendo niveles 01–04.
- Se codificó continuidad de los patrones del río desplazando cada dash pattern por su periodo completo (106 y 142 unidades), corriente siempre en el mismo sentido; las aves y semillas se atenúan antes de reiniciar, y las ondas se desvanecen con desfases. Es una intención técnica que todavía requiere revisión visual del usuario.
- Se corrigieron las duraciones CSS de las animaciones de agua a unidades de tiempo (segundos) antes de publicar.
- Los recursos siguen siendo SVG vectoriales provisionales. No se usa imagen maestra, arte final, audio, servicios externos ni gasto. No se modificó `main`.
- **Validación pendiente:** comprobar ejecución de Actions y publicación; después revisar en Firefox y Safari del iPad composición, continuidad de loops, movimiento, velocidad, pausa y rendimiento. No declarar aprobado hasta recibir la comprobación visual del usuario.


## 2026-11-01 — Cambio de objetivo: motor de caricaturas para iPad y cierre del proyecto anterior

- **Objetivo:** sustituir el concepto de cuadros de papel recortado/arte en movimiento por un motor y estudio visual para crear caricaturas animadas y microhistorias, manejable desde iPad.
- **Rama y punto de partida:** feature/living-paper-engine-foundation. La rama se verificó mediante lectura de archivos antes de los cambios; no se modificó main.
- **Decisión de colaboración:** ChatGPT queda como único asistente de IA del flujo. Claude y otros asistentes no reciben tareas ni participan en la lectura o implementación.
- **Experiencia deseada:** escenario visual editable, selección de personajes y objetos, panel de propiedades, acciones y animación, línea de tiempo y organización de escenas. Primera meta: seleccionar un elemento desde Safari en iPad, cambiar posición/tamaño, reproducir un movimiento sencillo y revisar el resultado.
- **Límite documentado:** inicialmente ChatGPT modificará el código en GitHub y el usuario actualizará la vista previa en iPad. No existe aún conexión directa/continua entre ChatGPT y el lienzo de Safari; un puente específico queda como posibilidad futura.
- **Audio:** música y sonido serán propios de cada microhistoria; la propuesta ambient/lo-fi/chillout de 72 BPM deja de ser requisito.
- **Archivos nuevos:** docs/direccion-motor-caricaturas-ipad.md.
- **Archivos actualizados:** README.md, INSTRUCCIONES_PARA_IA.md, ARQUITECTURA.md, ESTADO_PROYECTO.md, docs/auditoria-tecnica-2026-10-29.md, docs/contrato-de-capas-y-work-json.md, docs/plan-de-validacion-automatica.md, docs/direccion-artistica-y-partitura-audiovisual.md y docs/partitura-audiovisual-mountains-that-breathe-propuesta-v0-1.md.
- **Cierre de auditoría:** D1–D9 se cerraron por cambio de alcance. No se implementarán el validador, CI ni ampliaciones del contrato v2 para capas. La auditoría queda como registro histórico; el contrato v2 no está aprobado para el nuevo motor.
- **Protecciones:** no se eliminó ningún archivo ni prototipo; no se tocó la imagen maestra; no se modificó main; no se fusionó ni desplegó; no se activaron servicios ni gastos.
- **Pruebas:** se verificó la lectura y actualización de los archivos en GitHub mediante el conector. No se ha implementado ni probado todavía el editor nuevo en Safari/iPad.
- **Siguiente paso:** auditoría de solo lectura de living-paper-engine/ y prototype/ para clasificar qué código puede reutilizarse en el primer escenario editable.



## 2026-11-01 — Auditoría de reutilización para estudio de caricaturas iPad

- **Alcance:** lectura directa de código y documentos en living-paper-engine/ y prototype/; no se modificó código ejecutable.
- **Estado de rama al recibir el inventario del usuario:** feature/living-paper-engine-foundation sincronizada con origin y sin cambios locales reportados.
- **Hallazgos:** el laboratorio PixiJS contiene escenario 2D, transformaciones de piezas, ciclo de actualización, pausa/velocidad, trayectorias y jerarquías de articulación experimentales. La interfaz demo usa un inspector HTML y selección por lista; no se encontró selección táctil directa en el escenario.
- **Límites:** no existe un editor completo de personajes, skinning/IK, poses, timeline narrativo, secuenciador, persistencia de proyectos, deshacer/rehacer ni exportación de historias. Los módulos de pliegues, contacto entre hojas, volumen, cantos y deformación son específicos del diseño anterior.
- **Prototipos:** level-01 a level-05 son demostraciones SVG de composición y movimiento ambiental; no son editores de caricaturas.
- **Documento nuevo:** docs/auditoria-reutilizacion-motor-caricaturas-ipad-2026-11-01.md.
- **Documentación actualizada:** living-paper-engine/README.md; living-paper-engine/PROJECT_DIRECTION_AND_REUSE_AUDIT.md marcado como antecedente archivado; ESTADO_PROYECTO.md.
- **Pruebas:** se inspeccionó el código mediante GitHub. No se ejecutaron tests ni pruebas en navegador/iPad en esta revisión.
- **Protecciones:** no se modificó código ejecutable, no se eliminaron recursos, no se tocó main, no se fusionó ni desplegó, no se activaron servicios externos ni gastos.
- **Siguiente paso:** diseñar e implementar una prueba aislada del estudio visual para iPad, con selección táctil directa, arrastre, escala, rotación y animación básica.



## 2026-11-01 — Investigación de Umamo y primera prueba del estudio de caricaturas
- Rama de trabajo: `feature/living-paper-engine-foundation`. No se modificó `main`, no se fusionó ni se abrió PR.
- Se investigó Umamo: modelado de marionetas 2D, importación de arte por capas, jerarquía, mallas, UV, parámetros e historial. Se confirmó que todavía no implementa animación; iPadOS carece de renderizador funcional y el proyecto está en alfa. Licencia GPL-3.0: se decide no copiar ni integrar su código en el producto.
- Documento nuevo: `docs/investigacion-umamo-y-decision-arquitectura-2026-11-01.md`. Commit: `df8eafe5f62da08761b3e22adf9bc755f503339a`.
- Prototipo aislado nuevo: `prototype/caricature-studio-v01/index.html`. Incluye escenario SVG adaptable, personaje geométrico provisional, selección y arrastre mediante Pointer Events, controles de escala y rotación, y reproducción/pausa de un movimiento sencillo. HTML, CSS y JavaScript están contenidos en un solo archivo; no carga bibliotecas, APIs ni recursos externos.
- Commit del prototipo: `83bea924d207a7b5eae15d219d2f23b1321e0e4d`.
- Verificación realizada: ambos archivos existen y se recuperaron desde la rama. No se ejecutó un navegador, no se probó Safari/iPad y no se declara compatibilidad todavía.
- No se instalaron dependencias, no se usaron servicios pagos y no se copió código de los repositorios investigados.
- Próximo paso: abrir el prototipo mediante la vista previa de Codespaces y probar toque, arrastre, escala, rotación, reproducción y pausa en Safari del iPad; corregir según el resultado.
- Revisión estática posterior del prototipo: se corrigió el cálculo de rotación al cruzar ±180° y se limitaron los desplazamientos del personaje para reducir salidas del escenario. Commit: `ca457d0d9c01efd398f9c7a08a06b4fdc8c77cda`. Esta revisión no sustituye una prueba de navegador.


## 2026-11-01 — Decisión de producto: estudio web y salida de vídeo
- Se define el producto como un estudio web accesible desde Safari, Chrome y Firefox; no se desarrollará un APK Android como producto principal.
- Cada cuadro/obra podrá ser una historia/caricatura independiente, organizada como proyecto con personajes, escenarios, escenas, animación y audio.
- La salida principal será un vídeo descargable y publicable. El renderizado sigue siendo necesario: el motor debe calcular fotogramas, componer imagen y audio y codificar el archivo final.
- La animación dibujada a mano no es un objetivo del producto; las fuentes de investigación se usan para extraer técnicas útiles para personajes digitales, jerarquía, rigging, mallas, timeline y dirección de diálogos.
- Se investigará primero la exportación local en navegador. No se activa hosting, almacenamiento remoto, render remoto, API pagada ni suscripción sin permiso explícito.
- Política preventiva de licencias documentada: priorizar licencias permisivas; no copiar código GPL de Umamo; verificar individualmente runtimes, dependencias, modelos, fuentes, música, voces y recursos antes de incorporarlos.
- Documento nuevo: `docs/vision-estudio-web-y-exportacion-de-caricaturas-2026-11-01.md`. Commit inicial: `e15480b486882461f8b3ea0eae1c31a4744efeb9`.
- Se actualizaron `README.md` y `ESTADO_PROYECTO.md`. No se modificó `main`, no hubo fusión ni PR.
- Siguiente paso técnico: validar el prototipo en iPad; después separar el estado de escena de la representación SVG y crear un primer documento de proyecto guardable/restaurable.


## 2026-11-01 — Decisiones de editor, navegadores y renderizado local

- El usuario confirma la estética central: caricaturas y microhistorias construidas visualmente como papel artesanal recortado en 2D, con perspectiva, profundidad, texturas de alta calidad, bordes nítidos, iluminación y sombras entre capas. La calidad visual tiene prioridad sobre reducir el tamaño del archivo.
- Se confirma el orden: (1) editor completo de personajes con partes, jerarquías, rig/huesos, deformación, texturas, poses y expresiones; (2) escenas y animación; (3) líneas de tiempo; (4) renderizador local; (5) exportación de vídeo desde iPad; (6) un único APK reproductor de vídeos para Android TV, no un motor de renderizado.
- Se aprueba separar desarrollo y renderizado: GitHub Codespaces se utiliza para desarrollar y probar el software; el iPad será el dispositivo objetivo para editar y renderizar localmente. No se contratarán servidores GPU ni granjas de renderizado. No activar servicios de pago sin autorización.
- Safari en iPad queda como navegador de referencia para la primera validación. Se intentará compatibilidad adicional con Chrome, Firefox y Opera en iPad. Se probarán por separado las funciones del editor y las capacidades de exportación; no se asumirán capacidades de escritorio ni compatibilidad no verificada.
- Objetivo inicial de movimiento: salida 24/30 fps, con cadencias de animación de 12/15 dibujos por segundo cuando convenga al estilo. 60 fps queda como opción para casos justificados, no como objetivo predeterminado.
- Objetivo de calidad: 4K UHD (3840×2160), texturas de alta resolución y, si la cadena técnica lo soporta, color de 10 bits/HDR10. Los contenedores/códecs se decidirán después de pruebas reales; no se promete codificación 4K/HDR solo por poder reproducir vídeos 4K HDR en YouTube.
- Documento nuevo: `docs/decisiones-editor-personajes-y-render-local-2026-11-01.md`. Commit: `c0d8ecbb540215f17fa69af9995efb622c2bf3be`.
- Se añadió el enlace al documento en `README.md`. Commit: `d301446f25472d704d53785da4fb7a1565b23f44`.
- No se modificó `main`, no hubo merge, PR ni despliegue; no se activaron servicios externos ni gastos.
- Estado real: el prototipo `prototype/caricature-studio-v01/index.html` sigue siendo una prueba inicial; no existe aún editor completo ni renderizador local, y no se han certificado navegadores o exportación 4K/HDR.
- Siguiente trabajo: continuar el editor de personajes como prioridad, sin adelantar el exportador ni el APK de TV.


## 2026-11-01 — Alineación de documentos operativos con las decisiones vigentes

- Se corrigieron los documentos de estado y trabajo para que no sigan presentando el escenario de prueba como la primera meta del producto.
- Archivos actualizados: `ESTADO_PROYECTO.md`, `README.md`, `docs/vision-estudio-web-y-exportacion-de-caricaturas-2026-11-01.md`, `docs/direccion-motor-caricaturas-ipad.md`, `ARQUITECTURA.md` e `INSTRUCCIONES_PARA_IA.md`.
- Se estableció como prioridad de desarrollo el editor visual completo de personajes. El escenario existente queda clasificado como prototipo técnico inicial.
- Se documentó Safari como navegador de referencia inicial y Chrome, Firefox y Opera como objetivos adicionales de compatibilidad en iPad; editor y exportación deben probarse por separado.
- Se aclaró que Codespaces es para desarrollo y que el objetivo es renderizar localmente en iPad, sin servidores de renderizado.
- Se mantuvo la regla de no modificar `main`, no fusionar, no abrir PR ni desplegar. No se activaron servicios ni hubo gastos.
- No se ejecutaron pruebas de navegador ni de renderizado; estos cambios son de documentación y alineación de decisiones.


## 2026-11-01 — Primer prototipo de editor articulado de personajes

- Creado `prototype/character-editor-v01/index.html` con un lienzo SVG adaptable y una jerarquía recursiva de piezas padre-hijo.
- Incluye presets iniciales de personaje (torso, cuello, cabeza, cabello, ojos, brazos, antebrazos, manos, muslos, piernas y pies) y árbol (tronco, ramas, ramitas y grupos de hojas). Las piezas hijas heredan transformaciones de sus padres.
- Incluye selección desde jerarquía/lienzo, arrastre, inspector de posición/rotación/escala, cambio de padre, añadir piezas, duplicar, eliminar y cambiar orden.
- Incluye guardado local en el navegador, restauración automática y exportación JSON.
- Documento técnico: `docs/prototipo-editor-articulado-personajes-v0-1.md`.
- Es un prototipo funcional inicial de estructura rígida; no implementa todavía skinning, IK, deformación de malla, pivotes editables visualmente, poses guardadas ni texturas de papel de producción.
- No se ejecutaron pruebas de navegador ni se validó en iPad. No se modificó `main`, no se abrió PR ni se desplegó. No se activaron servicios ni gastos.
- Próximo paso: validar el prototipo en iPad y después mejorar edición de pivotes/articulaciones y poses antes de añadir deformación avanzada.

- Mejora posterior del prototipo: el arrastre convierte el puntero al espacio local del elemento padre, para evitar tratar las coordenadas de una pieza hija como si fueran coordenadas globales. Cambio guardado en `prototype/character-editor-v01/index.html`.


## 2026-11-01 — Editor articulado v0.2: pivotes y límites de giro
- Se amplió `prototype/character-editor-v01/index.html` con un pivote visible y arrastrable en la pieza seleccionada, además de controles numéricos X/Y.
- Al cambiar el pivote, el editor compensa la transformación de la pieza para mantener su geometría en la misma posición visual.
- Se añadieron límites de rotación mínimo/máximo por pieza; el control de articulación se restringe al rango configurado.
- Se mantiene compatibilidad de carga con proyectos locales v1: al abrirlos se inicializan pivote (0,0) y límites −180°/180°. Las exportaciones nuevas usan esquema v2.
- Se actualizó `docs/prototipo-editor-articulado-personajes-v0-1.md` con las capacidades y limitaciones reales.
- Commits de código: `fef4099bf08271a15d221a7ba14dbdea1dfb4e6a`, `73d72e46f0f73f26028fc6496ec2405be30b2e26`, `af757c5794018ffa93bccb26f2146913168cb567`, `0bdb1ff7246c897c9df12186cebe18eeb2651323`, `639859fc7031c70823591d8cdfa2db957a762c2d` y `63efde1d29fbaf7734b2ec77eb92c4d4ff9b2311`. Documento actualizado en el commit `5928e4f65c668519d3d61fad6c3c784510b63045`.
- **Verificación estática:** sintaxis JavaScript validada; no hay IDs DOM duplicados ni referencias a IDs inexistentes. No se ha ejecutado navegador ni validado el manejo táctil en Safari/iPad. Tampoco se ha certificado IK, skinning ni deformación de malla; no forman parte de esta iteración.
- No se modificó `main`, no hubo merge, PR, despliegue, instalación de dependencias ni gastos.


## 2026-11-01 — Editor de personajes v0.3: biblioteca de poses
- Se añadió una biblioteca de poses por proyecto en `prototype/character-editor-v01/index.html`.
- El usuario puede nombrar y guardar el estado actual de todas las piezas (posición X/Y, rotación y escala), seleccionar poses existentes, aplicarlas con transición suave (~520 ms) y eliminarlas.
- Las poses se almacenan en el objeto del proyecto, se guardan en localStorage y se incluyen en el JSON exportado. Los proyectos previos sin campo `poses` cargan con biblioteca vacía.
- La transición usa interpolación con easing y se cancela al comenzar una manipulación manual o cambiar de preset.
- Commits de esta etapa: implementación `22c269a5f075113d6c7450a818c703c500c0b2a6`, ajuste de cancelación y controles `f89d60a5b2495340359bfe0b5e6cfb0f91ea68ac`; documentación `e2a33c4431aa1c77121fad34fc9445632cb8a973`; estado `99bd45e41cf0dfc456956563179384a62f7d2ff6`.
- **Verificación:** sintaxis JavaScript comprobada; falta ejecutar el editor en navegador, probar guardar/aplicar/eliminar y confirmar transiciones en Safari/iPad.
- No se modificó `main`, no hubo merge, PR, despliegue, dependencias nuevas ni gastos.


## 2026-11-01 — Editor de personajes v0.4: acciones coordinadas
- Se añadieron cuatro acciones de prueba al editor: saludo, dos fases de caminata y reposo. Las acciones coordinan transformaciones de brazo/antebrazo/mano y muslo/pierna inferior/pie usando la jerarquía existente.
- Las acciones se aplican mediante la transición de poses; el resultado puede guardarse como una pose reutilizable. Si faltan las piezas esperadas, se informa que la acción requiere el preset Personaje.
- Se documentó expresamente que estas acciones no implementan IK ni posicionamiento automático de extremos.
- Código: `prototype/character-editor-v01/index.html`; documentación: `docs/prototipo-editor-articulado-personajes-v0-1.md`.
- Commit de código: `d94c8c9e91a9fb570d09493d33571c7fb29fcaae`.
- No se ha ejecutado la interfaz en navegador ni validado en Safari/iPad; no se declara prueba funcional visual. No se modificó `main`, no hubo merge, PR, despliegue, dependencias nuevas ni gastos.


## Actualización — 2026-11-01: primera cinemática inversa 2D v0.5
- Se incorporó un solver geométrico de dos segmentos para las cuatro cadenas del preset Personaje: brazo izquierdo/derecho y pierna izquierda/derecha.
- El usuario elige la cadena, define un objetivo X/Y relativo al torso y selecciona el lado de flexión. El solver calcula las rotaciones de los dos segmentos y las aplica mediante la transición existente.
- Se valida alcance, límites angulares, pivotes neutros, escala unitaria y alineación de segmentos. Si no se cumplen los requisitos, se muestra un mensaje y no se aplica la solución.
- Es IK 2D rígida inicial; no hay todavía arrastre del objetivo, colisiones, restricciones anatómicas avanzadas ni skinning/deformación de malla.
- Código: `prototype/character-editor-v01/index.html`; documentación: `docs/prototipo-editor-articulado-personajes-v0-1.md`.
- Commit de código: `3c2d7366a4ae316dcb9b7efe87504f5eeb186c4c`.
- Verificación estática: sintaxis JavaScript correcta, sin IDs duplicados ni referencias DOM inexistentes. No se ha ejecutado la interfaz en navegador ni validado el solver visualmente en Safari/iPad.
- No se modificó `main`, no hubo merge, PR, despliegue, dependencias nuevas ni gastos.


## 2026-11-01 — Editor de personajes v0.6: objetivos IK manipulables en el lienzo
- Se añadieron marcadores SVG para los objetivos de las cuatro cadenas IK del preset Personaje (brazo izquierdo/derecho y pierna izquierda/derecha).
- El marcador se puede tocar y arrastrar directamente en el lienzo. Durante el movimiento, el puntero se convierte a coordenadas locales del torso y el solver recalcula las articulaciones sin transición retardada.
- Se añadieron controles para fijar/liberar el objetivo. Cada cadena conserva su objetivo en memoria al cambiar de selección; los objetivos aún no se persisten en el proyecto ni en el JSON.
- El solver conserva la última pose válida cuando el objetivo se sale del alcance o la solución viola los límites. El modelo continúa siendo una cadena rígida de dos segmentos y mantiene las precondiciones geométricas documentadas.
- Se actualizó el documento técnico a v0.6. Código: `prototype/character-editor-v01/index.html`; documentación: `docs/prototipo-editor-articulado-personajes-v0-1.md`.
- Commits de código de esta etapa: `062981972060aaaec5d5961ac6500dce1657db76`, `9f54d9fe5ea2f879e617ab0e8ef746456d6f997e`, `8cf1153defcad22af77b4631f7bb04a5abad80f7`, `d431986a46a2d9b815c2c8c3cb765ce5f76cb530`. Documento: `22d58ff87cbbd45cd2a9b149d5945bff6cb93046`.
- **Verificación:** se revisó el código fuente y se confirmó que los controles y eventos están presentes. No se ha ejecutado el editor en navegador ni probado el arrastre táctil, el solver visual o el bloqueo en Safari/iPad; no se declara validación funcional.
- No se modificó `main`, no hubo merge, PR, despliegue, dependencias nuevas ni gastos.
- Siguiente paso: validación manual en Safari del iPad con las cuatro cadenas, objetivos dentro/fuera del alcance, ambos lados de flexión y fijar/liberar.


## 2026-11-01 — Editor de personajes v0.7: interacción táctil prioritaria y mouse
- Se formaliza como requisito permanente que la interfaz priorice el uso táctil en iPad y admita también mouse/puntero conectado. Las mismas herramientas principales deben funcionar con ambas entradas.
- El prototipo ya utiliza Pointer Events para unificar mouse, toque y lápiz/puntero. Se ampliaron áreas de controles, campos, sliders y filas de jerarquía en dispositivos con puntero grueso; se conserva feedback hover y precisión para mouse.
- Se actualizó la indicación del lienzo para explicar que las piezas se pueden tocar y arrastrar o manipular con mouse.
- Limitación explícita: zoom/pan multitáctil y gestos de navegación aún no están implementados. No se declara compatibilidad real validada en Safari/iPad ni con mouse físico; falta prueba manual en el dispositivo.
- Código: `prototype/character-editor-v01/index.html`. Commit: `e1b3081015703bd05f338b23c5f2d89f7c78d9f5`.
- Documento técnico: `docs/prototipo-editor-articulado-personajes-v0-1.md`. Commit: `3c3c7a30c1089822b8a0ccc952bb8603ffb9be2e`.
- Estado actualizado en `ESTADO_PROYECTO.md`. No se modificó `main`, no hubo merge, PR ni despliegue; no se añadieron dependencias ni gastos.
- Siguiente paso: probar en Safari del iPad con dedo y mouse conectado; revisar selección, arrastre, pivotes, objetivos IK, sliders y precisión de controles.


## Iteración v0.8 — preparación de validación táctil

- Se corrigió la regla CSS base de botones: parte de sus propiedades había quedado fuera del selector, por lo que no se aplicaban correctamente borde, color, radio y relleno.
- Se sincronizó la etiqueta visible del editor a v0.8; el encabezado mostraba v0.6 aunque la documentación ya describía v0.7.
- Se reforzó el lienzo para evitar selección accidental de texto y desplazamiento de overscroll durante la manipulación, conservando `touch-action:none` en el SVG para que los gestos de edición se reciban como Pointer Events.
- Se añadieron estilos de foco visible para botones, campos y selectores.
- **Verificación estática:** JavaScript pasó compilación sintáctica con `new Function`; no se encontraron IDs DOM duplicados; balance de llaves CSS revisado. No se ejecutó navegador ni se probó todavía en Safari del iPad.
- **Siguiente paso:** prueba táctil manual en Safari: seleccionar y mover piezas, arrastrar pivotes y los cuatro objetivos IK, fijar/liberar, usar sliders, guardar y exportar JSON. Mouse queda para una validación posterior.


## 2026-11-01 — Solver IK v0.9: restricciones anatómicas iniciales

- Se extrajo el cálculo IK de dos segmentos a un módulo independiente `prototype/character-editor-v01/ik-solver.js`.
- Se añadió validación de datos finitos, longitudes, alcance geométrico y sentido de flexión.
- Se limitaron inicialmente hombro/cadera a ±165° y codo/rodilla a una flexión direccional máxima de 150°, respetando cualquier límite individual más estricto ya configurado.
- El solver calcula y valida la solución antes de aplicar cambios, para evitar dejar articulaciones parcialmente actualizadas si el objetivo es inválido.
- Se añadió `tests/ik-solver.test.js` con pruebas automatizadas basadas en Node.js, sin dependencias externas. La ejecución de la suite en Codespaces todavía debe confirmarse.
- Cambios guardados en la rama `feature/living-paper-engine-foundation`; no se modificó `main`, no hubo merge, PR, despliegue ni gastos.
- Pendiente inmediato: ejecutar la suite en Codespaces y después preparar una prueba táctil sencilla en Safari del iPad. No se declara validación de navegador.



## 2026-11-01 — Robustez geométrica del solver IK v0.9.2

- Se eliminó el umbral arbitrario de una unidad para objetivos IK cercanos al origen. Ahora se utiliza el alcance real de los segmentos y se rechaza únicamente la singularidad de distancia cero, junto con objetivos geométricamente inalcanzables.
- Se añadió validación explícita de rangos articulares invertidos y parámetros no finitos.
- Se amplió la prueba de reconstrucción del extremo a ocho posiciones en distintos cuadrantes y ambos sentidos de flexión; se añadieron casos de longitudes desiguales y límites inválidos.
- GitHub Actions ejecutó correctamente sintaxis, suite matemática ampliada y comprobación de integración del solver externo. La validación de navegador y Safari/iPad sigue pendiente.
- Cambios limitados a la rama `feature/living-paper-engine-foundation`; sin merge, despliegue, dependencias nuevas ni gastos.



## 2026-11-01 — Importación validada de proyectos JSON

- Se incorporó al editor un botón para importar archivos JSON exportados anteriormente.
- Se añadió `prototype/character-editor-v01/project-io.js` para validar y normalizar proyectos v1/v2, jerarquías, IDs, formas, colores, transformaciones y poses antes de cargarlos.
- Se añadió límite de 10 MB y escape de contenido de texto para reducir riesgos al procesar archivos JSON externos o modificados.
- Se añadieron pruebas automatizadas de importación y seguridad de datos. GitHub Actions ahora valida ambos módulos, ejecuta las suites, comprueba la sintaxis del JavaScript del editor y revisa las referencias de integración.
- La ejecución completa del workflow terminó correctamente. La importación todavía requiere prueba manual en Safari/iPad; no se declara validación de navegador.
- Todo permanece en `feature/living-paper-engine-foundation`, sin modificar `main`, sin despliegue, sin nuevas dependencias y sin gastos.



## 2026-11-01 — Reparentado con conservación de transformación

- Se corrigió el comportamiento del selector de padre: cambiar la relación jerárquica ya no debe desplazar visualmente la pieza de forma inesperada.
- Se creó `prototype/character-editor-v01/rig-geometry.js` para resolver transformaciones mundiales y calcular una transformación local equivalente, considerando posición, rotación, escala y pivote del padre.
- El cambio rechaza ciclos y soluciones fuera de los límites articulares sin mutar el rig. Los descendientes conservan su transformación mundial al cambiar el padre de un ancestro.
- Se añadieron cuatro pruebas automatizadas de geometría jerárquica y se incorporaron al workflow de GitHub Actions, que completó correctamente las verificaciones.
- Pendiente: validación visual y táctil real en Safari del iPad.



## 2026-11-01 — Expresiones faciales iniciales del personaje

- Se añadieron cejas y boca al personaje base y cinco expresiones seleccionables: neutral, alegre, triste, sorprendida y enojada.
- Cada expresión modifica la inclinación de las cejas, la forma de la boca y la escala de los ojos. Las expresiones pueden guardarse en la biblioteca de poses.
- Se amplió el formato de pose para conservar las formas de las piezas; el importador valida las formas admitidas y mantiene compatibilidad con poses antiguas sin ese campo.
- Los proyectos de personaje anteriores reciben los rasgos faciales faltantes al abrirse; el preset nuevo ya los incorpora.
- Se añadió una prueba automatizada para la persistencia de formas faciales. La ejecución completa de GitHub Actions terminó correctamente.
- Se trata de una primera biblioteca de expresiones, no de un sistema avanzado de deformación facial ni sincronización labial.



## 2026-11-01 — Primera textura de papel y controles ampliados

- Se combinó el sombreado proyectado con un grano SVG de baja intensidad en las piezas del personaje y el árbol, buscando una apariencia menos plana sin introducir imágenes externas.
- Se ampliaron los rangos de posición y escala del inspector para que los cambios de jerarquía y las transformaciones acumuladas sigan siendo editables.
- Esta textura es provisional; las texturas artesanales de producción y los bordes de papel todavía están pendientes.
- El cambio pasó las comprobaciones automatizadas de sintaxis e integración; la evaluación visual en Safari/iPad sigue pendiente.
