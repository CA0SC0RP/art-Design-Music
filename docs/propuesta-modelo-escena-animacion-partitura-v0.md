# Propuesta V0 — modelo de escena, animación y partitura audiovisual

**Estado:** especificación de diseño para revisión; no aprobada, no implementada y no incorporada al contrato v2.  
**Fecha:** 2026-10-30  
**Repositorio:** `CA0SC0RP/art-Design-Music`  
**Rama:** `colaboracion/canal-entre-ias`  
**Decisión de referencia:** `colaboracion/mensajes/003-revision-arquitectura-v0.md`

## 0. Propósito y límites

Definir un modelo declarativo, versionable y reutilizable que describa cómo se organiza una obra en escenas, cómo se anima y cómo una partitura musical coordina eventos visuales. El modelo debe servir para obras distintas sin codificar nombres, posiciones ni estética de una obra particular.

Este documento es una **propuesta V0**. No es JSON Schema, no cambia `works/work.schema.json`, no añade carpetas de implementación, no crea recursos y no autoriza programación. El ejemplo JSON es ilustrativo; sus IDs y referencias son ficticios y no afirman que existan un `work.json` de producción o recursos finales.

### Decisiones heredadas de Principal (obligatorias)

- Contrato v2, esquema, campos y pruebas permanecen intactos.
- Las capacidades nuevas se proponen en un formato separado y versionado; si luego se integran en el contrato de obra, requieren una nueva versión con migración, compatibilidad y pruebas.
- MVP: una escena, nodos de capa estática, reloj determinista y un movimiento acotado; no implementar de entrada máscaras, efectos, varios renderizadores, Android TV ni catálogo complejo.
- Canvas 2D es la primera implementación candidata, pero esta especificación no lo implementa.
- No mover ni editar la imagen maestra. No reutilizar coordenadas preliminares v0.1.
- Audio y análisis son opcionales; su ausencia o fallo no puede ocultar ni bloquear la escena.
- No fijar presupuestos de memoria/FPS sin mediciones en iPad Safari y TCL 55Q650G.
- Ningún movimiento puede superar límites autorizados ni exponer superficies no reconstruidas y aprobadas.

## 1. Separación de responsabilidades

Se proponen tres documentos lógicos:

1. **Obra visual (`work.json`, contrato v2):** identidad, lienzo, maestra, capas PNG, geometría, orden, estados, reconstrucción, límites seguros y audio base. Es la autoridad de las capas y sus autorizaciones.
2. **Experiencia (`experience.json`, formato propuesto `adm-experience/0.1`):** escenas, nodos, orden de composición, clips, tracks, ciclos, behaviors, bindings y referencias a recursos de la obra.
3. **Partitura (`score.json`, formato propuesto `adm-score/0.1`):** tempo/compás cuando existan, duración, secciones, eventos musicales y señales visuales asociadas.

Para el vertical slice se permite incrustar escenas, animación y partitura en un solo `experience.json`; separarlos en archivos distintos no debe cambiar la semántica.

**Fuente de verdad:** v2 define qué imagen/capa existe, dónde está y cuánto puede moverse; Experience define cuándo y de qué forma se solicita un movimiento; Score define cuándo ocurre una intención musical. Ninguna capa puede autorizarse a sí misma mediante Experience o Score.

## 2. IDs, unidades y convenciones

- IDs ASCII minúscula, dígitos y guiones; únicos en cada colección y referencias resueltas sin ambigüedad.
- Tiempo: segundos decimales desde el inicio de la experiencia (`t=0`); reloj monotónico de reproducción, no reloj de pared.
- Posición: deltas en píxeles del lienzo maestro v2; rotación en grados; escala como factor; opacidad en [0,1]. Son transformaciones relativas a la geometría base; nunca reescriben PNG ni `placement`.
- Interpolación V0: `step`, `linear`, `smoothstep`. Cúbica diferida hasta definir tangencias y límites.
- Repetición: `once`, `loop`, `ping-pong`; ciclos deterministas en sus extremos.
- Números finitos únicamente; rechazar NaN, Infinity y cadenas numéricas.
- Duraciones positivas; intervalos temporales semiabiertos [start,end), salvo eventos puntuales.

## 3. Modelo de escena

### 3.1 Entidades

**Work reference.** La experiencia identifica la obra mediante `workId` y referencia explícita a su contrato/archivo v2. No copia ni redefine capas.

**Scene.** Unidad de composición reproducible: `id`, `name`, `durationSec`, `nodes[]`, opcionalmente `loop`, clips y secciones asociados. Transiciones complejas quedan fuera del MVP.

**Node.** El único tipo requerido para el primer vertical slice es `layer`, con referencia a una capa existente v2 mediante `layerId`. El nodo puede tener alias y estado habilitado, pero no duplica geometría, archivo, zIndex, estado ni aprobación. El orden final debe respetar el `zIndex` v2; no se invierte silenciosamente.

Tipos previstos, no requeridos por MVP:
- `sprite`: secuencia de poses/frames con duración por frame, dimensiones, pivote, loop y política alfa; diferido hasta acordar recurso, hash y aprobación.
- `group`: agrupación con transformación común; diferido.
- `mask` y `effect`: diferidos; no son necesarios para el primer slice.

**Regla de escena mínima:** una escena puede contener solo nodos `layer` estáticos. Bastan dos capas existentes y aprobadas (por ejemplo, fondo y marco, si existen y se aprueban); no se exige sprite, máscara, efecto ni transición.

### 3.2 Geometría y composición

- Geometría base proviene exclusivamente de v2: `placement`, `pivot`, `zIndex`, `alphaBounds`, `safeBounds`.
- El nodo no redefine x/y/width/height; solo vincula y habilita una capa.
- El marco `kind: frame` permanece fijo, opaco, completo y por encima de todo. Ningún clip, track, behavior, binding o evento puede seleccionarlo.
- Controles de interfaz quedan fuera del grafo; el fondo OLED no se interpreta como nodo móvil.

## 4. Modelo de animación

### 4.1 Reloj de reproducción

La experiencia mantiene un único `playheadSec`. Toda evaluación visual y musical deriva de ese tiempo; el estado se calcula como función del tiempo absoluto, no acumulando deltas por frame. Esto permite pausar, reanudar, buscar y repetir sin deriva. Callbacks de UI y temporizadores independientes no son relojes.

### 4.2 Track

Un track anima una propiedad concreta de un nodo o parámetro de behavior. Campos conceptuales: `id`, `target`, `valueType`, `keyframes[]`, `blend` y `fillMode`.

Propiedades V0: `offsetPx` (vector 2D), `rotationDeg`, `scaleFactor`, `opacity`. Keyframes declaran `atSec`, `value` e `interpolation`. En V0 solo `replace`; suma/multiplicación simultánea se difieren. Keyframes deben estar estrictamente ordenados, sin tiempos duplicados y con valores del tipo declarado.

Los valores de track no conceden permisos: se validan contra límites de la capa y autorización v2. El MVP puede validar primero una escena completamente estática; un track se agrega solo después de validar seguridad del movimiento.

### 4.3 Clip y ciclo

Un clip agrupa tracks con `id`, `durationSec`, `startAtSec`, `repeat`, `phaseSec` y `enabled`. Repetición: `once`, `loop`, `ping-pong`. En `loop`, el estado final debe coincidir con el inicial en cada propiedad que deba ser continua; si no, se informa discontinuidad y no se declara seamless. Clips solapados que escriban el mismo target/property se rechazan en V0; no hay blending implícito.

### 4.4 Behaviors reutilizables

Un behavior es una función determinista registrada por nombre y versión; produce parámetros visuales desde tiempo normalizado y parámetros declarados. Ejemplos conceptuales: `sway/1`, `float/1`, `breathe/1`, `drift/1`, `wing-flap/1`, `water-flow/1`.

Cada behavior define parámetros y defaults, duración/frecuencia/fase, propiedades de salida permitidas, límites máximos, continuidad y fallback. `wing-flap` y `water-flow` requieren recursos/frames aprobados; no se simulan mediante deformaciones improvisadas. Para el primer prototipo, como máximo un behavior simple (por ejemplo `sway/1`) sobre una capa cuya geometría y reconstrucción estén aprobadas.

### 4.5 Bindings

Un binding enlaza un origen (`scoreEvent`, parámetro de audio opcional o señal de behavior) con un target/property y un mapeo limitado: `source`, `target`, `property`, `mapping`, ganancia y límites. V0 no permite expresiones arbitrarias, código embebido ni scripts. Audio en vivo solo modula intensidad dentro de un intervalo aprobado; no autoriza movimiento.

## 5. Modelo de partitura audiovisual

### 5.1 Metadatos musicales

La partitura puede declarar `tempoBpm`, `meter`, `keyOrMode`, `durationSec`, `loop`, `audioRef` y `sections[]`. Los metadatos son opcionales salvo duración de la línea temporal. No se impone un género global. V0 recomienda tempo constante; mapas de tempo y cambios de compás se difieren. `atSec` es el tiempo canónico.

### 5.2 Secciones y eventos

Una sección agrupa un intervalo y etiqueta una frase musical. Evento conceptual:
- `id`, `atSec`, `durationSec` opcional;
- `kind`: `accent`, `phrase`, `swell`, `transition`, `cue`;
- `intensity` en [0,1];
- `tags[]` y `visualBindings[]` opcionales.

Los eventos son metadatos autorales de la composición, no detección automática de golpes. Para gestos intencionales se prefieren eventos temporizados derivados de la pista compuesta. Análisis en vivo bass/mid/treble/energy es modulación secundaria suavizada, nunca el único medio de sincronizar un gesto importante.

### 5.3 Reloj y audio

- El playhead de experiencia es la referencia temporal única.
- Cuando hay audio, el adaptador informa su posición y la alinea al playhead con política documentada. No se asume latencia cero; compensación solo con medición real.
- Clips/eventos se evalúan desde el playhead sincronizado, nunca desde `setTimeout` o temporizadores de UI.
- Audio comienza tras gesto del usuario cuando la plataforma lo exige.
- Si no hay pista, no carga o el navegador bloquea reproducción, la escena permanece visible y los ciclos autónomos siguen funcionando. Los eventos pueden seguir con reloj interno si el modo silencioso lo declara.
- Si falta análisis, la modulación se neutraliza a su valor base; no se detienen clips ni se exceden límites.
- Política recomendada para V0: cuando el audio es reloj maestro, pausar audio pausa playhead; en modo silencioso se usa reloj interno. No mezclar políticas en una sesión sin transición explícita.

## 6. Ejemplo JSON ilustrativo — fixture estático del MVP

Este es el **fixture mínimo conceptual** del primer slice: una escena estática, dos referencias a capas ya existentes y aprobadas en v2 (fondo y marco), reloj determinista y partitura sin eventos. Los IDs son ficticios. No contiene clips ni autoriza movimiento. En producción, las capas deben resolverse por sus IDs reales y cumplir el contrato v2.

```json
{
  "format": "adm-experience/0.1",
  "id": "example-static-experience",
  "work": {
    "id": "example-work",
    "contract": "adm-work/2",
    "manifest": "work.json"
  },
  "timeline": {
    "durationSec": 24,
    "clock": "experience",
    "loop": false
  },
  "scenes": [
    {
      "id": "opening",
      "durationSec": 24,
      "loop": false,
      "nodes": [
        { "id": "background-node", "type": "layer", "layerId": "approved-background-layer" },
        { "id": "frame-node", "type": "layer", "layerId": "approved-frame-layer" }
      ]
    }
  ],
  "animation": {
    "clips": [],
    "behaviors": [],
    "bindings": []
  },
  "score": {
    "format": "adm-score/0.1",
    "durationSec": 24,
    "sections": [],
    "events": []
  }
}
```

**Advertencias:** no es un manifiesto validado por esquema; aún no existe JSON Schema para estos formatos. Los recursos citados son IDs ilustrativos, no archivos ni aprobaciones reales. El marco permanece fijo y jamás puede ser target. Este fixture estático no depende de audio, sprites, análisis ni movimiento.

El movimiento futuro se describe por separado y no forma parte del fixture mínimo: solo podría añadirse un track/behavior a un nodo que refiera una capa concreta ya clasificada como móvil, con recurso, reconstrucción, zonas y límites aprobados. Nunca se infiere autorización a partir de un ejemplo ni se mueve el fondo o el marco por defecto.

## 7. Referencias y resolución de recursos

- Rutas relativas al directorio de obra; no aceptar rutas absolutas, URL remotas, `..`, enlaces simbólicos que salgan del paquete ni diferencias de mayúsculas/minúsculas.
- En V0, nodos `layer` resuelven `layerId` contra `layers[].id` del `work.json` v2. El archivo se toma de `layers[].file`, no se copia a Experience.
- `audioRef: work.audio` refiere al objeto `audio` de v2. Si `audio.src` es null o no existe, el modo silencioso es válido.
- Sprites, máscaras, efectos y análisis precalculado no se incorporan a Experience V0 hasta definir formato, hash, estado y aprobación.
- Cada referencia debe resolver a exactamente un elemento. Referencia faltante, duplicada, con case mismatch o fuera del paquete es error bloqueante.
- Carga diferida no cambia el orden visual ni la aprobación.

## 8. Validación propuesta (no implementada)

### Estructura y referencias
- **EXP-1:** formato/version reconocidos.
- **EXP-2:** IDs únicos en experiencias, escenas, nodos, clips, tracks, behaviors, bindings, secciones y eventos.
- **EXP-3:** referencias a work, layer, node, clip y sección resueltas exactamente una vez.
- **EXP-4:** duración de escena positiva; tiempos/duraciones finitos, no negativos y dentro de la línea temporal.
- **EXP-5:** nodo layer referencia capa existente y no duplica geometría, archivo, aprobación o zIndex.
- **EXP-6:** marco único, zIndex máximo y nunca target.
- **EXP-7:** rutas relativas seguras, case-sensitive y dentro del paquete.

### Animación y seguridad
- **ANM-1:** keyframes ordenados, sin tiempos repetidos y tipos consistentes.
- **ANM-2:** clips solapados no escriben mismo target/property.
- **ANM-3:** loops declaran continuidad; no se promete seamless si extremos difieren.
- **ANM-4:** behavior/version registrados; parámetros dentro de rangos y outputs permitidos.
- **ANM-5:** cualquier movimiento se valida contra v2: capa no es frame/static, safeBounds cubre desplazamiento máximo, reconstruction requerida y zonas/aprobaciones vigentes.
- **ANM-6:** propiedades permitidas por tipo de capa y reglas v2.
- **ANM-7:** combinación de canales/behaviors/bindings se valida por máximo acumulado, no por amplitudes aisladas.
- **ANM-8:** marco jamás puede ser target.
- **ANM-9:** behavior desconocido nunca ejecuta código dinámico; fallback estático y warning.

### Partitura y audio
- **SCR-1:** duración de partitura coincide con timeline o declara región menor.
- **SCR-2:** tiempos/duraciones de eventos válidos y dentro de la partitura.
- **SCR-3:** intensidad y parámetros de binding dentro de rangos.
- **SCR-4:** tempo/compás válidos y resolución de beat a segundos determinista.
- **SCR-5:** audioRef resuelve a audio v2 o null; audio faltante no bloquea escena.
- **SCR-6:** análisis precalculado futuro ligado al hash exacto de la pista.
- **SCR-7:** evento/binding no supera límites ni apunta al marco.

Estados y aprobaciones se heredan de v2; Experience no replica ni sustituye evidencias. Un nodo puede referir recurso provisional en previsualización claramente marcada, nunca como producción ni como autorización de movimiento.

## 9. Política de fallback

| Fallo/ausencia | Comportamiento seguro |
|---|---|
| Audio no existe, no carga o está bloqueado | Mostrar escena; modo silencioso; render no se detiene |
| Análisis no disponible | Neutralizar modulación; mantener animación base dentro de límites |
| Evento desconocido | Ignorar con diagnóstico; no lanzar excepción |
| Behavior desconocido/no registrado | Nodo estático; warning |
| Clip/track inválido | Rechazar clip antes de iniciar; escena estática si es segura |
| Recurso visual faltante/corrupto | No sustituir por imagen arbitraria; placeholder solo en diagnóstico o bloquear producción |
| Referencia v2 ausente | Error bloqueante; no inventar nodo |
| Aprobación/hash obsoleto | No reproducir movimiento; exigir revisión |
| Efecto/máscara no soportado | Fallback a composición base solo si conserva integridad; si no, bloquear |
| Desfase de audio | Resincronizar según política medida; nunca acumular timers |

## 10. Relación exacta con contrato v2

### Se reutiliza, sin duplicar
Identidad/lienzo; maestra/hash/mediciones; `layers[].id`, `kind`, `file`, `layout`, `size`, `scale`, `placement`, `alphaBounds`, `zIndex`, `pivot`; `status`, `measurement`, `approval`, `reconstruction`, `safeBounds`; `frame.layerId`, marco fijo/ventana visible; `audio` y sus referencias/estado/análisis.

### No se toca en v2
No se añaden `scenes`, `nodes`, `sprites`, `clips`, `tracks`, `behaviors`, `bindings`, `events` ni `score` al esquema v2. No se alteran canales, límites, estados, rutas, pruebas o aprobaciones. No se convierte esta propuesta en nuevos campos de `work.json` sin revisión.

### Requeriría versión nueva o extensión formal
Si Experience/Score se integran al paquete de obra, crear nueva versión (por ejemplo v3) o formato complementario formalmente versionado, con asociación a la obra, compatibilidad, migración de v2 sin experiencia a escena estática, preservación de IDs/hash/aprobaciones, serialización de sprites/partitura, esquema formal y reglas de compatibilidad.

**Regla transitoria:** hasta resolver precedencia, no permitir que tracks V0 y `motion.channels` v2 animen simultáneamente la misma capa. El consumidor elige una fuente de movimiento por capa y falla de forma cerrada si ambas están activas.

## 11. Ruta de migración y pruebas

1. Principal revisa nombres, entidades, alcance MVP y compatibilidad v2.
2. Decidir manifiestos laterales o v3; no editar v2.
3. Redactar JSON Schema 2020-12 independiente para Experience/Score y fixtures pequeños.
4. Pruebas estructurales: IDs duplicados, referencias faltantes, rutas inseguras, tipos incorrectos, tiempos inválidos, marco como target.
5. Pruebas semánticas: límites acumulados, safeBounds, reconstrucción aprobada, continuidad, conflictos y fallback.
6. Pruebas de reloj: t=0, mitad, fin, pausa, reanudación, búsqueda, loop y ping-pong.
7. Compatibilidad v2: obra sin Experience = escena estática; preservar IDs y aprobaciones; ninguna coordenada v0.1.
8. Vertical slice futuro: una escena, dos nodos estáticos existentes/aprobados; después un behavior simple autorizado. Audio opcional y modo silencioso.
9. Medir carga, memoria y fluidez en iPad Safari y TCL 55Q650G antes de presupuestos finales o Android TV.

Ninguna de estas pruebas se ejecutó al redactar el documento; son criterios de aceptación propuestos.

## 12. MVP y fuera de alcance

**Incluido en el primer vertical slice futuro:** una obra con work.json v2 válido y recursos aprobados; una escena; nodos layer existentes; composición estática y reloj determinista; opcionalmente un clip/track o behavior simple tras validar seguridad; partitura vacía o evento temporal de prueba; modo silencioso.

**Fuera de alcance:** editor visual; catálogo multiobra completo y transiciones complejas; sprites/hojas y aleteo; flujo/deformación de agua, máscaras y efectos; blending de clips; tempo maps/análisis avanzado; WebGL, Android TV y presupuestos finales.

## 13. Riesgos y decisiones pendientes

1. **Manifiesto lateral o v3:** recomendación: lateral durante prototipo, con referencias estrictas a v2; decidir futura integración.
2. **Fuente de movimiento duplicada:** resolver precedencia/migración entre `motion.channels` y tracks antes de implementar.
3. **Semántica de ciclo:** definir tolerancia numérica y si discontinuidad bloquea o advierte.
4. **Audio como reloj maestro:** confirmar pausa de audio y avance en modo silencioso.
5. **Modelo de sprite:** acordar atlas vs archivos, hash, dimensiones, pivote y aprobación.
6. **Eventos musicales:** confirmar tiempos absolutos, beats o ambos; V0 recomienda atSec canónico y beats como metadato.
7. **Movimiento MVP:** elegir capa solo tras comprobar recurso/reconstrucción aprobados; no asumir que ciervo, sol o aves preliminares son aptos.
8. **Recursos reales:** el índice actual indica que aún no existe work.json de producción ni capas/audio finales aprobados; el primer slice depende de ello.

## 14. Decisión solicitada a ChatGPT Principal

Responder en un mensaje nuevo:
- ¿Se aceptan `adm-experience/0.1` y `adm-score/0.1` como formatos laterales a v2 durante prototipo?
- ¿Se acepta `layer` como único nodo requerido del MVP, dejando sprite/group/mask/effect para extensiones?
- ¿Se acepta `atSec` como tiempo canónico, con tempo/compás como metadatos y reloj único?
- ¿Qué política se elige para audio pausado y modo silencioso?
- ¿Se autoriza, tras aprobar esta especificación, preparar esquemas y fixtures (todavía sin motor/visor)?

**Hasta recibir respuesta:** no programar, no modificar esquema v2 ni tests existentes, no crear recursos ni directorios de implementación, no tocar la maestra, no cambiar `main`, no fusionar ramas y no desplegar.


## 15. Addendum — incorporación de auditoría de ChatGPT Principal (2026-10-30)

Este apartado incorpora los hallazgos de `colaboracion/auditorias/004-auditoria-contrato-arquitectura.md`. No modifica el contrato v2 ni cambia el estado de aprobación de esta propuesta.

### 15.1 Inconsistencia de `energy` en el contrato v2

La auditoría detecta una discrepancia real: `audioBinding.band` y el ejemplo de análisis precalculado contemplan `energy`, mientras que `analysis.bands` en `works/work.schema.json` solo declara `bass`, `mid` y `treble`, con propiedades adicionales cerradas.

**Tratamiento en esta propuesta:**
- No se debe asumir que `energy` es actualmente una banda configurable válida dentro de `analysis.bands` del contrato v2.
- Como recomendación para una versión futura, `energy` podría definirse como una magnitud derivada universal (sin configuración de rango de frecuencias), distinta de las bandas configurables `bass`, `mid` y `treble`.
- Esa interpretación es una propuesta semántica, no una corrección del contrato vigente. Hasta que Principal/usuario aprueben una decisión de versionado, los consumidores deben tratar esta discrepancia como limitación conocida y no depender de `energy` como dato precalculado validado por el esquema v2.
- Cualquier formalización deberá hacerse en una versión nueva o extensión formal; no editar unilateralmente v2 ni sus fixtures.

### 15.2 Unicidad de canales por capa

El límite de cuatro elementos en `motion.channels` no garantiza que exista como máximo un canal de cada tipo. La regla se debe comprobar semánticamente.

Se añade el criterio futuro **MOV-UNIQUE-1**: para cada capa, rechazar canales duplicados del mismo tipo, incluso si la lista respeta el máximo de elementos del esquema. Añadir pruebas negativas independientes para cada tipo duplicado y una prueba positiva con tipos distintos. Este criterio pertenece al validador y a sus pruebas; no se afirma que el esquema v2 actual lo garantice.

### 15.3 Separación de reloj, partitura, análisis y comportamiento

Se precisan cuatro responsabilidades, sin crear relojes competidores:

1. **Reloj de reproducción:** único `playheadSec` monotónico de la experiencia; pausa, reanudación, búsqueda y loop se resuelven en esta línea temporal.
2. **Partitura/eventos:** datos autorales discretos con tiempos `atSec` (y metadatos de compás/tempo opcionales). Un evento no es un reloj ni una detección de audio.
3. **Análisis de audio:** señal secundaria opcional, muestreada/alineada respecto al playhead; no crea tiempo, no dispara por sí sola gestos críticos y su fallo neutraliza la modulación.
4. **Comportamiento visual:** función determinista evaluada desde el playhead y parámetros explícitos; puede recibir eventos o análisis como entradas acotadas, pero nunca amplía permisos ni límites de movimiento.

El `playheadSec` es siempre la representación temporal canónica que consume la escena. Con audio activo, el adaptador lee `audio.currentTime` y usa esa posición observada para sincronizar/corregir el playhead; no existe un segundo reloj de escena. La tolerancia de deriva y cualquier corrección se fijarán tras mediciones, sin asumir latencia cero. Sin audio, el playhead avanza con el reloj interno monotónico. Pausa congela playhead y audio; reanudar alinea el audio al playhead actual antes de continuar; seek actualiza el playhead y busca la pista a la misma posición. Si el navegador bloquea el audio, la pista termina inesperadamente o se pierde, se conserva el último playhead y se continúa en modo silencioso con reloj interno (si la experiencia no ha terminado); la escena nunca se oculta ni se congela por ese fallo. Al pasar de silencio a audio, se busca la posición actual del playhead antes de reproducir. La pérdida de análisis solo neutraliza la señal. Ningún temporizador de UI puede avanzar una línea temporal paralela.

### 15.4 Primer vertical slice en dos pasos verificables

Para reflejar la auditoría sin rebajar las restricciones de seguridad, el primer slice se divide:

- **Slice A — render/validación estáticos:** una obra, una escena, fondo y marco estáticos, IDs estables, orden heredado del contrato v2, reloj determinista con pausa/reanudación/búsqueda y validador de manifiesto/referencias. Puede utilizarse un recurso provisional únicamente en previsualización/diagnóstico, marcado inequívocamente como provisional; nunca como producción ni como aprobación artística.
- **Slice B — comportamiento procedural mínimo:** un único comportamiento sencillo, sin respuesta al audio, y solo sobre una capa cuyo recurso, reconstrucción, límites y aprobación estén comprobados. Si no existe una capa apta, Slice A sigue siendo el resultado válido y no se fuerza movimiento.

Sprites, análisis en vivo, partitura musical completa, agua, WebGL y Android TV siguen siendo extensiones/fases posteriores. El audio no es requisito para demostrar el primer render. Ningún recurso provisional autoriza movimiento o publicación de producción.

### 15.5 Criterios de aceptación añadidos

- **AUD-1:** `energy` no se trata como campo de `analysis.bands` validado en v2 hasta resolver formalmente la discrepancia.
- **AUD-2:** el validador semántico detecta canales duplicados por capa y dispone de pruebas negativas.
- **AUD-3:** partitura, análisis, reloj y behaviors conservan las responsabilidades separadas descritas en 15.3.
- **AUD-4:** el Slice A puede verificarse sin audio, sprites ni movimiento.
- **AUD-5:** el Slice B no se habilita sin recurso y reconstrucción aprobados; los recursos provisionales solo se muestran como tales en diagnóstico.

**Estado tras el addendum:** la auditoría queda incorporada a la propuesta documental. No se creó esquema, fixture, validador, motor ni visor; no se ejecutaron pruebas. La especificación sigue pendiente de aprobación de Principal/usuario.


## 16. Revisión de Principal — cierre de correcciones V0-R1 a V0-R4 y precisiones

Este apartado responde a `colaboracion/auditorias/005-revision-especificacion-v0.md`. Donde este apartado difiera de formulaciones anteriores, prevalece esta aclaración.

### 16.1 V0-R1 — semántica normativa de `energy`

Para los formatos complementarios V0, `energy` significa **energía RMS global de la señal de audio**, no una banda de frecuencia:

- Entrada: muestras PCM decodificadas, normalizadas a [-1, 1]. En estéreo se incluyen las muestras de ambos canales en la misma ventana.
- Cálculo por ventana: `energyRaw = sqrt(sum(sample²) / sampleCount)`. Por la normalización PCM, el resultado pertenece a [0,1].
- Serie precalculada: un valor por frame del análisis; si `frameRate = 30`, cada ventana nominal dura `1/30 s`. La última ventana puede ser parcial. La serie debe corresponder al `sourceSha256` exacto del audio.
- Suavizado en tiempo real: `energy[n] = smoothing * energy[n-1] + (1-smoothing) * energyRaw[n]`; el primer valor inicializa la serie. `smoothing` conserva el rango [0,1].
- **Parámetro único de suavizado:** cuando exista, el valor autoritativo es `work.audio.analysis.smoothing` del contrato v2. No se define un parámetro paralelo en Experience ni en el sidecar.
- **Equivalencia entre precálculo y tiempo real:** el sidecar de análisis debe registrar explícitamente el valor de `smoothing` utilizado o declarar que `energy.values` ya está suavizada con ese valor. El validador futuro comprobará que coincide exactamente con `work.audio.analysis.smoothing`; el análisis en tiempo real aplicará ese mismo valor y la misma fórmula.
- **Fallback por incompatibilidad:** si no existe audio/análisis, falta el sidecar, no coincide `sourceSha256` o el parámetro de suavizado falta/no coincide cuando sea requerido, se ignora la serie precalculada y se usa el fallback neutral `e=1`. No se mezclan series con parámetros distintos ni se intenta compensarlas.
- Representación complementaria propuesta: objeto `energy` separado de `bands`, con `method: "pcm-full-scale-rms"` y `values: number[]` en [0,1]. `bands` contiene únicamente `bass`, `mid` y `treble`, cada una con su configuración/serie de frecuencia. No se añade `energy` a `analysis.bands` de `work.json` v2.
- Consumo: si un binding solicita `energy` y existe una serie válida, usa su valor suavizado. Si falta, no coincide el hash o no se puede calcular, usa el valor neutral `e=1` de la fórmula de modulación actual; esto conserva la amplitud base y evita que la ausencia de análisis detenga el movimiento. El análisis sigue siendo opcional.

Ejemplo conceptual del sidecar complementario (no es un archivo creado ni un esquema aprobado):

```json
{
  "format": "adm-audio-analysis/0.1",
  "frameRate": 30,
  "durationSec": 24,
  "sourceSha256": "<sha256-del-audio>",
  "bands": {
    "bass": [],
    "mid": [],
    "treble": []
  },
  "energy": {
    "method": "pcm-full-scale-rms",
    "values": []
  }
}
```

La discrepancia histórica de v2 queda registrada, no reparada: el contrato menciona `energy`, pero `works/work.schema.json` no la declara dentro de `analysis.bands`. La representación anterior pertenece solo al formato complementario propuesto; cualquier cambio a v2 requiere una propuesta de versión futura y aprobación independiente.

### 16.2 V0-R2 — unicidad de tipos de canal por capa efectiva

Regla semántica bloqueante **MOV-UNIQUE-1**:

- Al resolver cada nodo `layer` de Experience, obtener la capa efectiva por `layerId` en el `work.json` v2.
- En esa capa efectiva debe existir como máximo un canal de cada tipo permitido (`translate`, `rotate`, `scale`, `opacity`).
- Dos canales del mismo tipo en una misma capa producen error bloqueante, aunque tengan IDs diferentes y aunque la lista tenga cuatro elementos o menos.
- Canales de tipos distintos pueden coexistir solo si cada uno está permitido para el `kind`, la reconstrucción y las aprobaciones están vigentes, y la envolvente acumulada cumple `safeBounds` y todos los límites.
- La comprobación se hace por capa resuelta, no solo por IDs de canal o de nodo. Dos nodos que refieran la misma capa no pueden eludir la regla.

Pruebas negativas futuras: duplicar por separado `translate`, `rotate`, `scale` y `opacity` en una capa; cada fixture debe fallar. Prueba positiva: canales distintos, permitidos y dentro de límites. La regla no modifica el esquema v2.

### 16.3 V0-R3 — ciclo de vida del playhead y autoridad de sincronización

`playheadSec` es el único tiempo canónico de Experience, Score y evaluación visual. El adaptador de audio puede ser la **referencia de sincronización observada** mientras reproduce, pero la escena siempre consume el playhead. Política operativa propuesta:

| Acción/condición | Playhead y audio |
|---|---|
| Play con audio | El audio se inicia en la posición actual del playhead; su `currentTime` observado corrige/alinea el playhead |
| Play sin audio / modo silencioso | El reloj interno monotónico avanza el playhead |
| Pause | Pausa audio y congela el playhead |
| Resume | Busca/alinea audio al playhead congelado y reanuda; sin audio, reanuda reloj interno |
| Seek | Actualiza el playhead y busca audio a la misma posición si está disponible |
| Fin de pista | Si la experiencia aún no termina, conserva posición y continúa silenciosamente con reloj interno; si timeline terminó, finaliza |
| Audio bloqueado por navegador | No bloquear render; continuar silenciosamente y permitir reintento explícito del usuario |
| Pérdida/error de audio | Conservar último playhead observado y continuar con reloj interno, sin salto intencional |
| Pérdida de análisis | Neutralizar solo la modulación; reloj y escena siguen |
| Silencio → audio | Buscar la posición actual del playhead antes de reproducir |
| Audio → silencio | Continuar desde el último playhead observado con reloj interno |

La corrección de deriva se hará comparando posición observada y playhead; umbrales, frecuencia de corrección y compensación se definirán tras medir los dispositivos objetivo. No se declara latencia cero ni se fijan valores arbitrarios. Si una plataforma no permite buscar/reproducir, se mantiene el modo silencioso.

### 16.4 V0-R4 — fixture mínimo estático y movimiento futuro separado

La sección 6 ahora contiene únicamente el fixture estático mínimo: escena, nodos layer, arrays de animación vacíos, partitura vacía y reloj. Se eliminó el clip que desplazaba el fondo. El marco no es target y el fondo no se mueve por defecto.

El movimiento posterior no es un fixture del MVP. Para probarlo, se requerirá una fixture independiente con una capa específica ya aprobada para movimiento; su identidad y parámetros solo podrán fijarse después de verificar el recurso real, su reconstrucción, `safeBounds`, límites por tipo y aprobación humana. Ningún JSON ilustrativo otorga permisos.

### 16.5 Precisiones adicionales solicitadas

**Keyframes y límites del clip**
- `clip.startAtSec` es absoluto en la línea temporal.
- `keyframe.atSec` es relativo al tiempo local del clip, con intervalo permitido [0, durationSec].
- El intervalo activo del clip es [startAtSec, startAtSec + durationSec). Para `loop`, el tiempo local usa módulo `durationSec`; el keyframe en `durationSec` es el extremo terminal usado para validar continuidad y no sustituye al keyframe de 0 en el instante de wrap.
- Para `once`, en el instante final `fillMode: "hold"` conserva el valor terminal; `fillMode: "none"` vuelve al valor base. Para `ping-pong`, el extremo terminal se evalúa como punto de retorno y la dirección temporal se invierte sin crear un segundo reloj.
- Los keyframes deben ser estrictamente crecientes; se permite un keyframe terminal exactamente en `durationSec`.

**Resolución de `audioRef`**
- En `adm-score/0.1`, `audioRef: "work.audio"` es un identificador lógico reservado que resuelve exclusivamente al objeto `audio` de la raíz del `work.json` v2 asociado.
- No es URL, ruta de archivo ni JSON Pointer arbitrario. Si el campo está ausente, es `null` o `audio.src` es `null`, se selecciona modo silencioso.
- No se permiten rutas remotas, rutas absolutas ni referencias ambiguas.

**Envolvente acumulada y `safeBounds`**
- `safeBounds` es un límite máximo de desplazamiento autorizado, no una autorización genérica para trasladar, rotar o escalar.
- Cada transformación debe estar permitida por el tipo de capa y contar con reconstrucción/aprobación aplicable. Se calcula la transformación combinada `T(p,t)` respecto a la geometría base y se comprueba `D(p,t)=T(p,t)-p` para los puntos de control de la envolvente de `alphaBounds` (como mínimo sus esquinas y pivote) durante todo el ciclo.
- Debe cumplirse `max |D_x| <= safeBounds.xPx` y `max |D_y| <= safeBounds.yPx`. La cota considera traslación, rotación y escala simultáneas, no solo la amplitud individual de cada canal. Si la cota no puede demostrarse de forma conservadora, el movimiento se rechaza.
- Además se aplican límites por `kind`, velocidad, marco fijo, ventana visible y zonas de reconstrucción aprobadas. `safeBounds > 0` no sustituye ninguno de esos requisitos.

**Severidad de validación**
- **Error bloqueante:** formato/version desconocido; ID/referencia ausente o ambigua; ruta insegura; tipo/campo/tipo numérico inválido; tiempos fuera de rango; IDs duplicados; canal duplicado por capa; marco como target; recurso requerido faltante; movimiento sin aprobación/reconstrucción; límites o envolvente acumulada excedidos; conflicto de tracks simultáneos.
- **Warning/diagnóstico con fallback seguro:** audio opcional bloqueado/ausente; análisis opcional ausente o hash no coincidente; evento no reconocido que no afecta la estructura; behavior opcional desconocido en modo previsualización (se neutraliza el behavior y se mantiene el nodo estático).
- En modo producción, un behavior requerido desconocido, un recurso visual requerido ausente o cualquier incertidumbre de seguridad bloquea la reproducción de esa experiencia; nunca se sustituye por un recurso arbitrario.
- Cada diagnóstico futuro debe incluir código de regla, severidad, ruta del dato y explicación. Las reglas EXP/ANM/SCR deberán marcarse individualmente como error o warning en el catálogo del validador.

### 16.6 Estado de aprobación

Con estas correcciones, los puntos V0-R1 a V0-R4 quedan respondidos en la propuesta documental. Los formatos `adm-experience/0.1` y `adm-score/0.1` continúan siendo propuestas laterales, no integradas a v2. La especificación sigue pendiente de aprobación final de Principal/usuario. La recomendación de Principal para preparar JSON Schemas y fixtures pequeños se entiende como una autorización condicionada a que esta versión corregida sea revisada; no autoriza todavía su creación, ni motor, visor, integración, recursos o cambios a v2.



## 17. Alineación con la matriz independiente de pruebas 006

Se revisó `colaboracion/auditorias/006-matriz-pruebas-v0.md`. Esta matriz es una propuesta de criterios de aceptación, no código ni resultados de ejecución. Las siguientes precisiones alinean la semántica de Experience/Score:

### 17.1 Grafo y referencias

- Para V0, cada `layerId` puede aparecer como máximo una vez dentro de una misma escena. Duplicar el mismo `layerId` en dos nodos se rechaza (SCN-03); no hay instancias múltiples, alias de composición ni semántica de duplicación en este MVP.
- Debe existir exactamente un nodo que represente la capa protegida de marco cuando la obra v2 declara `frame.layerId`; no se permite omitirla, duplicarla ni representarla con otro `layerId`. Se conserva su `zIndex` superior.
- La validación estructural/reloj puede usar recursos provisionales solo en modo previsualización/diagnóstico, claramente etiquetados. La aceptación de producción requiere recursos existentes y aprobados. No se requieren audio, sprites ni recursos finales para verificar el reloj aislado.

### 17.2 Precisión terminológica para AUD-01…AUD-06

En las reglas de unicidad, “tipo de canal” significa el tipo de movimiento v2 (`translate`, `rotate`, `scale`, `opacity`), no la banda de audio (`bass`, `mid`, `treble`, `energy`). Por tanto, AUD-02 debe interpretarse como dos canales de movimiento del mismo tipo en la misma capa (por ejemplo, dos `translate`), no como “dos canales bass”. La banda de audio es un parámetro de modulación dentro de un canal, y su vocabulario se valida por separado. Se deja esta nota como aclaración técnica; no se modifica la matriz publicada por Principal.

### 17.3 Loop y extremos

- Un clip/track que declara continuidad seamless debe tener valores compatibles en sus extremos para cada propiedad animada. Si no coinciden, es **error bloqueante** para la declaración seamless.
- Un loop discontinuo solo puede aceptarse si se declara explícitamente como no-seamless; en ese caso se emite warning visible y el salto en el wrap es intencional. Nunca se etiqueta como seamless.
- El endpoint `atSec = durationSec` es válido como valor terminal; en loop se usa para comprobar continuidad con `atSec = 0`, y el instante exacto de wrap evalúa el inicio del ciclo. En `once` con `fillMode: hold`, se conserva el valor terminal al finalizar.

### 17.4 Conversión de tempo a tiempo absoluto

En V0 no hay tempo map. `tempoBpm` es constante y se interpreta como pulsos de negra por minuto; `beatIndex` cuenta negras desde el inicio. La conversión es:

`atSec = beatIndex * 60 / tempoBpm`

El compás etiqueta la agrupación métrica, no crea otro reloj. Si en el futuro se admiten otras unidades de beat o cambios de tempo, deberán declararse en una versión posterior; no inferirlos desde el denominador del compás.

### 17.5 Severidad y matriz

Las reglas PKG/SCN/EXP/ANM/SCR/MOV se clasifican según la sección 16.5: integridad, referencias, tiempos, unicidad y seguridad son errores bloqueantes; ausencia de audio/análisis opcional y eventos no reconocidos no estructurales producen fallback/diagnóstico. En previsualización se puede neutralizar un behavior desconocido y mostrar el nodo estático; en producción, un behavior requerido desconocido bloquea esa experiencia.

La matriz 006 amplía los casos de aceptación y debe conservarse como documento independiente. No se ejecutó ninguno de sus casos al incorporarlos a esta especificación.

