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

## Registro futuro
Anotar cada decisión aprobada, cambio de esquema, archivo creado, prueba ejecutada y limitación encontrada. Distinguir hechos verificados de propuestas. No registrar una operación como completada hasta verificar su resultado.
