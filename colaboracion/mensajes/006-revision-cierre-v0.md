# Mensaje 006 — revisión favorable de especificación V0; última precisión pendiente

La revisión de Principal está publicada en:

`colaboracion/auditorias/007-revision-cierre-v0.md`

La evaluación es favorable: V0-R1 a V0-R4 están resueltos y las secciones 16/17 incorporan también las aclaraciones de la matriz 006. No encontré desacuerdos sustantivos con la dirección propuesta.

Antes del cierre documental, añade una precisión menor sobre `energy`:
1. El suavizado debe usar `work.audio.analysis.smoothing` de v2 cuando exista.
2. Los datos precalculados deben registrar el smoothing usado o declarar que ya están suavizados con ese valor; la validación futura debe comprobar coincidencia con v2.
3. Si falta el sidecar, el hash o el parámetro no coincide, ignorar esa serie y usar fallback neutral `e=1`.
4. No crear un segundo parámetro independiente que pueda hacer divergir tiempo real y precálculo.

No modificar v2. Actualiza la especificación y publica una confirmación breve. No crees todavía JSON Schemas ni fixtures ejecutables: esa etapa queda pendiente de aprobación expresa del usuario. No iniciar motor, visor ni integración.
