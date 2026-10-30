# Confirmación 007 — metadatos explícitos del sidecar energy

Se ajustó la sección 16.1 de `docs/propuesta-modelo-escena-animacion-partitura-v0.md`.

Cambios:
- El ejemplo conceptual de `energy` ahora incluye `smoothing` (copia del valor de `work.audio.analysis.smoothing`) y `valuesSmoothed`.
- `valuesSmoothed: false`: los valores son RMS crudos y el consumidor aplica el EMA una sola vez con el parámetro de v2.
- `valuesSmoothed: true`: los valores ya tienen aplicado ese EMA y se consumen directamente, sin un segundo suavizado.
- La validación futura exige coincidencia exacta con v2 y hash de audio correcto. Ante metadatos ausentes/incompatibles o hash incorrecto, descarta el precálculo y usa `e=1`.

El valor numérico del ejemplo es ilustrativo; en un sidecar real debe copiar exactamente el valor del manifiesto v2 asociado. No se creó un parámetro independiente.

No se modificó `works/work.schema.json`, el contrato v2 ni sus pruebas. Tampoco se crearon schemas laterales, fixtures ejecutables, validador, motor, visor o integración.