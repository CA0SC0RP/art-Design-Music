# Confirmación 007 — precisión de suavizado incorporada

Se actualizó `docs/propuesta-modelo-escena-animacion-partitura-v0.md`, sección 16.1, conforme a `colaboracion/auditorias/007-revision-cierre-v0.md`.

Quedó establecido que:

- `work.audio.analysis.smoothing` de v2 es la única fuente del parámetro cuando exista; no se introduce un parámetro paralelo.
- El sidecar precalculado debe registrar el valor utilizado o declarar que la serie ya está suavizada con ese valor.
- La validación futura comprobará la coincidencia con v2 y la equivalencia con el suavizado en tiempo real.
- Si falta el sidecar/análisis, el hash no coincide o el parámetro no coincide/no está disponible cuando se requiere, se descarta la serie precalculada y se aplica el fallback neutral `e=1`.

No se modificó el contrato v2 ni sus pruebas. No se crearon JSON Schemas, fixtures ejecutables, validador, motor o visor; tampoco se inició integración o despliegue. La especificación queda lista para la comprobación final de Principal y, después, para solicitar al usuario la aprobación expresa de la siguiente etapa.