# Revisión 007 — evaluación de correcciones de especificación V0

**Emisor:** ChatGPT Principal  
**Estado:** revisión técnica favorable con una precisión menor pendiente; no es aprobación del usuario ni autorización de implementación.  
**Documento:** `docs/propuesta-modelo-escena-animacion-partitura-v0.md`

## 1. Resultado de revisión

Se revisaron las secciones 15, 16 y 17, la respuesta de Segunda Instancia a la revisión 005 y su respuesta a la matriz 006.

Los cuatro puntos obligatorios quedan incorporados de forma suficiente:

- **V0-R1 — energy:** RMS global de PCM normalizado, separado de las bandas bass/mid/treble y del esquema v2. El fallback `e=1` conserva la amplitud base de la fórmula del contrato.
- **V0-R2 — unicidad:** MOV-UNIQUE-1 rechaza tipos duplicados de canal de movimiento por capa efectiva; la aclaración distingue estos tipos de las bandas de audio.
- **V0-R3 — reloj:** playhead único; audio como referencia observada de sincronización; modo silencioso con reloj interno; política definida para pause, resume, seek, pérdida y fin de audio.
- **V0-R4 — MVP:** el ejemplo principal ahora es estático; el movimiento queda separado y condicionado a recurso, reconstrucción, límites y aprobación.

También se resolvieron las precisiones sobre keyframes, `audioRef`, envolventes acumuladas, severidad de diagnósticos, duplicación de `layerId`, marco y conversión de tempo. La matriz 006 se conserva como propuesta de pruebas, no como resultados ejecutados.

## 2. Precisión pendiente — suavizado uniforme de energy

La sección 16.1 define el RMS por ventana y una fórmula EMA, pero debe quedar inequívoco que el análisis precalculado y el análisis en tiempo real producen la misma señal suavizada.

Añadir una regla breve:
- El parámetro de suavizado procede de `work.audio.analysis.smoothing` cuando existe, respetando el valor declarado por v2.
- El sidecar precalculado debe registrar el valor de suavizado utilizado, o declarar explícitamente que sus valores ya están suavizados con ese parámetro. El validador futuro debe comprobar que coincide con el valor de v2.
- Si no existe audio/análisis, si falta el sidecar, si el hash no coincide o si el parámetro no coincide, se ignora la señal precalculada y se aplica el fallback neutral `e=1`.
- No introducir un segundo parámetro independiente que pueda producir diferencias entre precomputado y tiempo real.

No modificar el esquema v2 para esta precisión.

## 3. Decisión técnica de Principal

**Acepto técnicamente la dirección y considero que las correcciones sustantivas V0-R1…V0-R4 están satisfechas.** Los formatos `adm-experience/0.1` y `adm-score/0.1` pueden seguir como formatos laterales propuestos; `layer` sigue siendo el único nodo requerido; `atSec` sigue siendo el tiempo canónico.

La especificación puede pasar a cierre documental cuando se incorpore la precisión del apartado 2. Esto no equivale a aprobar el contrato v2 ni a autorizar motor, visor, integración, recursos o despliegue.

## 4. Siguiente puerta de aprobación

Una vez que Segunda Instancia incorpore esa precisión y publique la confirmación, Principal hará una comprobación final de lectura. Después se solicitará al usuario la aprobación expresa para preparar únicamente:
- JSON Schemas independientes para Experience/Score (y, si se decide mantenerlo como formato formal, el sidecar de análisis);
- fixtures pequeños de validación, sin recursos artísticos de producción.

Hasta esa aprobación expresa, no crear esquemas ni fixtures ejecutables. No tocar v2, pruebas existentes, imagen maestra ni `main`; no fusionar ni desplegar; no contratar servicios ni consumir créditos.
