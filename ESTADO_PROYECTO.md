# Cuadro Vivo — estado del proyecto

**Estado:** preparación. Contrato de capas v2, esquema de datos y plan de validación **propuestos y pendientes de revisión del usuario**. No hay motor, visor, validador, capas finales ni audio. No declarar nada de eso como implementado.

**Actualizar este archivo al fusionar cualquier rama:** contiene datos que cambian (commits, ramas).

## Visión
Experiencia de arte visual en movimiento basada en cuadros de papel recortado, con profundidad ambiental, color intenso y música. Primera obra: **Mountains That Breathe**. Objetivo futuro: galería de ocho obras. Primera plataforma: prototipo web, probado en Safari del iPad; la aplicación para Android TV es una etapa posterior.

## Responsabilidades
- ChatGPT: dirección y producción de capas visuales.
- Claude: motor, visor, audio, controles e integración.
- Usuario: decisiones creativas y aprobación de entregas.

## Estado verificado el 26-10-2026 (leyendo GitHub y el repositorio clonado)
- `main` está en `f81b03c` (fusión del PR #1). La rama `preparacion/contrato-datos-y-protocolo` ya está integrada en `main`.
- Archivos en `main`: `README.md`, `ESTADO_PROYECTO.md`, `INSTRUCCIONES_PARA_IA.md`, `ARQUITECTURA.md`, `BITACORA.md`, la imagen maestra y seis documentos en `docs/` (auditoría v0.1, contrato, control de calidad, flujo de producción, plan de separación y referencia histórica).
- No existen en `main`: `works/`, `src/`, `tools/`, `android/`, audio ni capas.
- Imagen maestra: PNG RGB de 8 bits, 3840 × 2160, sin perfil de color incrustado; SHA-256 `d216046d9f78331c5372f867afc56a90a7b9f9659e27e026b28a89958cf2cfdc`.
- Rama de trabajo `contrato/capas-v2-esquema-y-validacion`, creada a partir de `main` en `f81b03c`: añade `works/index.json`, `works/work.schema.json`, `docs/plan-de-validacion-automatica.md` y `tests/test_contrato_v2.py`, y actualiza el contrato y los documentos de proyecto. Pendiente de revisión; no está integrada en `main` y no hay PR abierto.
- Corrección técnica del 2026-10-27 en esa rama: fechas reales de calendario en el esquema; `safeBounds` > 0 exige reconstrucción con todas sus zonas aprobadas (esquema); reglas GEO-1 (rectángulos dentro del lienzo) y MOV-10 (`opacity.min ≤ max`) especificadas en el plan, que el esquema no puede expresar y **aún no tienen validador**.
- Pruebas ejecutadas (`python3 -I tests/test_contrato_v2.py -v`): 45 pruebas, 30 superadas, 15 omitidas por ser reglas pendientes de implementar, 0 fallos. Detalle y lista de pendientes en `docs/plan-de-validacion-automatica.md`, sección 4. No hay validador, integración continua, pruebas con PNG reales ni pruebas visuales o de rendimiento en iPad o televisor; los límites de movimiento siguen siendo valores propuestos.
- El informe anterior (commit `04d983b`, siete archivos, protocolo sin publicar) quedó superado.

## Decisiones provisionales
- Web modular, HTML/CSS/JavaScript sin compilación obligatoria, Canvas 2D como primer prototipo.
- Separación entre motor, interfaz y definición de cada obra.
- Configuración por obra en `work.json` (esquema v2 propuesto).
- Audio con análisis Web Audio en tiempo real y posibilidad de datos precalculados.
- No comprometerse con 4K interno hasta medir rendimiento en iPad y TCL 55Q650G.
- Android TV será una etapa posterior; no se considera implementada.

## Pendientes inmediatos
1. El usuario revisa la rama `contrato/capas-v2-esquema-y-validacion` y decide sobre el contrato v2, el esquema y el plan de validación (decisiones pendientes al final del contrato y del plan).
2. Medir de nuevo las coordenadas de cada elemento sobre la maestra original. Las coordenadas del paquete preliminar v0.1 no se reutilizan.
3. ChatGPT prepara recursos visuales solo con la imagen maestra real como referencia; ninguna capa es final hasta que el usuario la apruebe.
4. Solo después de aprobar contrato y plan: validador y prototipo técnico, en ramas independientes de `main`.
5. Verificar ubicación real de audio y de cualquier recurso local antes de afirmar que están guardados en GitHub. Hoy no hay audio en el repositorio.

## No confundir
- Documento de diseño ≠ código implementado.
- Recurso provisional ≠ recurso aprobado.
- Archivo local de una IA ≠ archivo guardado en GitHub.
- Revisión automatizada ≠ prueba en iPad o televisor reales.
- Coordenadas preliminares v0.1 ≠ medición sobre la maestra original.
