# Propuesta de estructura musical — Mountains That Breathe / Montañas en armonía

**Estado:** borrador creativo para revisión; no es composición, partitura definitiva ni autorización para producir audio.  
**Responsable:** ChatGPT Principal  
**Referencia:** `docs/direccion-artistica-y-partitura-audiovisual.md`

## 1. Objetivo sonoro

Diseñar una pieza original que se sienta como una extensión de la escena: contemplativa, orgánica, cálida y espaciosa. La música debe sostener la sensación de un paisaje de papel que respira, no convertirlo en un espectáculo rítmico ni en un visualizador de frecuencias.

Dirección inicial heredada:
- Ambient + lo-fi + chillout cinematográfico.
- Tempo de referencia: 72 BPM, todavía tentativo.
- Compás de trabajo propuesto: 4/4, pendiente de aprobación.
- Instrumentación por explorar: pads cálidos, piano o teclas suaves, textura armónica sostenida, bajo redondo discreto y percusión orgánica muy ligera.
- Sonidos de naturaleza, si se usan, deben integrarse con moderación y no competir con la música.

No se fija todavía tonalidad, progresión armónica, instrumentos definitivos, duración final ni mezcla.

## 2. Forma temporal de trabajo

Para poder diseñar una primera partitura de eventos sin comprometer la duración final, se propone una maqueta de **72 compases a 72 BPM en 4/4**. A ese tempo, cada compás dura aproximadamente 3,333 s y la maqueta completa dura 240 s (4:00).

La duración de cuatro minutos es un marco de trabajo, no una decisión final. Si se cambia el tempo o la duración, los eventos se recalculan desde compás/beat y se convierten a `atSec`; no se desplazan manualmente de forma independiente.

| Sección | Compases | Tiempo aproximado | Función musical | Intención visual general |
|---|---:|---:|---|---|
| Apertura | 1–8 | 0:00–0:26.7 | Presentar espacio, aire y armonía | La escena ya está visible; no necesita un golpe de entrada |
| Tema A | 9–24 | 0:26.7–1:20 | Introducir motivo principal sencillo | Primeras variaciones ambientales, muy contenidas |
| Expansión | 25–40 | 1:20–2:13.3 | Añadir profundidad y movimiento armónico | Aumenta ligeramente la sensación de amplitud, no la velocidad |
| Interludio | 41–48 | 2:13.3–2:40 | Reducir densidad y dejar respirar | Pausa visual relativa; los ciclos autónomos pueden continuar |
| Regreso | 49–64 | 2:40–3:33.3 | Recuperar el motivo con una variación | Retorno gradual de la plenitud, sin repetir exactamente cada gesto |
| Cierre | 65–72 | 3:33.3–4:00 | Resolver y dejar una cola natural | La escena permanece; la música se desvanece sin apagar el cuadro |

## 3. Reglas para la relación música–imagen

1. La escena estática debe poder reproducirse sin música.
2. Los ciclos ambientales continuos (por ejemplo, agua o niebla cuando existan recursos aprobados) no dependen de golpes individuales.
3. Los eventos de partitura representan decisiones de composición: entrada de una textura, inicio de una frase, swell o cierre. No son detección automática de beats.
4. El análisis de audio solo puede modular suavemente la intensidad dentro de límites previamente autorizados; nunca elige por sí solo qué objeto se mueve.
5. No se deben disparar movimientos importantes en cada compás. Reservar eventos para cambios de frase y transiciones musicales.
6. No todos los elementos reaccionan simultáneamente. Cada movimiento tendrá su propia fase y duración, si el recurso permite animarlo.
7. El marco permanece fijo y el exterior detrás del marco conserva negro OLED puro.
8. Si el audio se bloquea o falla, la escena continúa según el playhead y la política silenciosa de la especificación V0.

## 4. Catálogo provisional de eventos

Los eventos siguientes son marcas musicales abstractas. Los targets visuales se asignarán únicamente cuando existan capas reales y aprobadas; no se asigna aquí ningún objeto concreto ni se concede permiso de movimiento.

| Evento | Posición propuesta | Tipo | Intensidad orientativa | Función |
|---|---|---|---:|---|
| `intro-air` | Compás 1, beat 1 | `phrase` | 0.20 | Inicio de la atmósfera |
| `theme-a` | Compás 9, beat 1 | `phrase` | 0.40 | Presentación del motivo |
| `first-swell` | Compás 17, beat 1 | `swell` | 0.35 | Abrir la textura sin acento percusivo |
| `depth-change` | Compás 25, beat 1 | `transition` | 0.50 | Entrada de la sección de expansión |
| `soft-cue` | Compás 33, beat 1 | `cue` | 0.30 | Señal compositiva secundaria |
| `interlude` | Compás 41, beat 1 | `transition` | 0.20 | Retirar capas musicales |
| `theme-return` | Compás 49, beat 1 | `phrase` | 0.45 | Regreso del motivo |
| `final-swell` | Compás 65, beat 1 | `swell` | 0.35 | Preparar la resolución |
| `outro` | Compás 69, beat 1 | `cue` | 0.15 | Comenzar el cierre |

Con 72 BPM y 4/4, cada beat de negra equivale a 0,8333 s. Los tiempos absolutos se calcularán con la regla V0 `atSec = beatIndex × 60 / tempoBpm`; la numeración de compás es una ayuda editorial, no un reloj independiente.

## 5. Diseño de movimiento compatible con la dirección artística

- **Agua:** prioridad artística alta, pero requiere secuencia/ciclo de recurso aprobado y continuidad de bordes; no se debe simular con una deformación improvisada.
- **Niebla y nubes:** movimientos lentos por planos separados, con fases distintas; la opacidad debe ser suave y no parpadear.
- **Vegetación:** balanceo mínimo, solo en elementos cuya reconstrucción y pivote sean convincentes.
- **Animales y aves:** secuencias de poses reales; no fingir aleteo o respiración con escalado genérico si deforma la silueta de papel.
- **Sol/luz:** variación lenta de ambiente, no destellos ni pulsos de ecualizador.
- **Marco y fondo OLED:** siempre fijos.

Esta lista establece prioridades de diseño, no confirma que las capas o sprites existan ni que tengan permiso para moverse.

## 6. Decisiones pendientes del usuario

1. ¿Se conserva 72 BPM como tempo de partida o se deja abierto hasta escuchar un primer boceto?
2. ¿Se acepta 4/4 para la primera pieza o se prefiere decidir el compás después de explorar la melodía?
3. ¿La duración de trabajo de cuatro minutos es adecuada o se debe diseñar una pieza más breve/larga?
4. ¿La dirección debe inclinarse más a ambient orgánico, lo-fi con pulso discreto o chillout cinematográfico?
5. ¿Se permite incorporar sonidos ambientales naturales, o se prefiere música instrumental sin efectos de campo?

## 7. Límites

- No se ha compuesto ni generado audio.
- No se han creado eventos en un archivo `score.json`; la tabla es un mapa conceptual.
- No se han asignado targets de movimiento a capas reales.
- No se modificó el contrato v2, esquema, pruebas, imagen maestra ni recursos.
- Esta propuesta no aprueba recursos ni autoriza motor, visor o despliegue.
