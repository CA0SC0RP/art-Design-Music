# Auditoría independiente de ChatGPT Principal — contrato y arquitectura

**Alcance:** lectura de documentación y esquema actualmente disponibles en `main`, más contraste con la propuesta de contrato v2 y la dirección artística.  
**Estado:** hallazgos documentales; no se modificó `main`, el esquema, las pruebas ni los recursos.

## 1. Hallazgo prioritario: modelo de bandas de audio inconsistente

Hay tres definiciones que no coinciden:

- El contrato v2 permite `audioBinding.band` con `none`, `bass`, `mid`, `treble` y `energy`.
- El esquema `works/work.schema.json` define `analysis.bands` con solo `bass`, `mid` y `treble`, y `additionalProperties: false`.
- El ejemplo de datos precalculados del contrato incluye también `energy`.

Por tanto, `energy` puede ser una banda referenciada por un canal y aparece en el formato de datos precalculados, pero no está declarada en el objeto `analysis.bands` del esquema de la obra. La futura especificación V0 debe resolverlo explícitamente: definir si `energy` es una banda derivada universal que no necesita configuración de frecuencias, o si debe incorporarse formalmente al esquema en una futura versión. No cambiar v2 unilateralmente.

## 2. Regla de unicidad de canales

El contrato dice que puede haber como máximo un canal de cada tipo por capa. El esquema limita `motion.channels` a cuatro elementos, pero una validación por esquema de la cantidad no demuestra que los cuatro tipos sean únicos. Esta regla debe quedar en el validador semántico y tener pruebas negativas para duplicados.

## 3. Diferenciar reloj, análisis y eventos musicales

La arquitectura y la dirección artística requieren una línea temporal compartida. El contrato v2 actual describe modulación por bandas de audio, pero no define todavía eventos musicales discretos, compases, marcas temporales, clips, ciclos de sprites ni bindings a comportamientos. La nueva propuesta debe separar claramente:

- reloj de reproducción (fuente temporal autoritativa);
- eventos/partitura (tiempo, compás o posición musical);
- análisis de audio (señal secundaria y opcional);
- comportamiento visual (reglas/curvas evaluadas desde el reloj).

El fallo del análisis o del audio no debe detener el reloj visual ni romper la escena.

## 4. Alcance del primer vertical slice

Para reducir riesgo y evitar arquitectura prematura, propongo que la especificación identifique un mínimo técnico verificable:

1. una obra y una escena;
2. fondo y marco estáticos;
3. grafo de escena con identificadores estables y orden explícito;
4. un reloj determinista con pausa, reanudación y búsqueda temporal;
5. un único comportamiento procedural sencillo, inicialmente sin respuesta al audio;
6. recursos provisionales claramente marcados;
7. validador de manifiesto y referencias de recursos.

Sprites, ciclos de agua, análisis en vivo, partitura musical completa, efectos avanzados, WebGL y Android TV deben quedar modelados como extensiones/fases, no ser requisitos para demostrar el primer render.

## 5. Invariantes que deben sobrevivir a cualquier extensión

- Maestra original y su hash permanecen intactos.
- Coordenadas se miden sobre la maestra original; v0.1 no se reutiliza.
- Marco completo, fijo y superior; exterior negro OLED puro.
- Recursos provisionales no se presentan como finales.
- Ninguna aprobación artística la puede otorgar una IA.
- Contrato/esquema v2 no se altera sin una decisión de versionado y aprobación.
- No se fusiona ni despliega sin aprobación.

## 6. Estado real y cautela

La documentación de estado indica que todavía no existen motor, visor, validador real, capas finales, sprites finales ni audio final. El resultado histórico de 30 pruebas superadas y 15 omitidas corresponde a una ejecución anterior en la rama de propuesta; no debe afirmarse como resultado del HEAD actual sin volver a ejecutar las pruebas.

## 7. Acción solicitada

Incorporar estos puntos en `docs/propuesta-modelo-escena-animacion-partitura-v0.md`, especialmente el desacuerdo de `energy`, la unicidad de canales y la separación entre reloj, partitura y análisis. Si se propone cambiar el contrato, presentar una propuesta de versión nueva separada; no editar el esquema v2.

---
**Conclusión:** la arquitectura general es viable como dirección, pero el modelo de datos debe cerrar estas ambigüedades antes de implementar el runtime.
