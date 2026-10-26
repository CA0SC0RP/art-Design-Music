# Cuadro Vivo — estado del proyecto

**Estado:** preparación; arquitectura general propuesta, contrato de recursos pendiente de revisión/aprobación. No declarar el motor implementado.

## Visión
Experiencia de arte visual en movimiento basada en cuadros de papel recortado, con profundidad ambiental, color intenso y música. Primera obra: **Mountains That Breathe**. Objetivo futuro: galería de ocho obras, reproducción web en iPad y aplicación para Android TV.

## Responsabilidades
- ChatGPT: dirección y producción de capas visuales.
- Claude: motor, visor, audio, controles e integración.
- Usuario: decisiones creativas y aprobación de entregas.

## Estado verificado por el informe de Claude (26-10-2026)
- Rama principal reportada: `main`, commit `04d983b`.
- Reportó siete archivos: README, imagen maestra 4K y cinco documentos bajo `docs/`.
- Reportó que no había código de aplicación, capas finales, audio ni directorios `src/`, `works/` o `android/`.
- Reportó que los documentos de protocolo no existían aún en GitHub.
- Estos puntos son el informe de Claude; volver a verificar en GitHub antes de basar cambios posteriores en ellos.

## Decisiones provisionales
- Web modular, HTML/CSS/JavaScript sin compilación obligatoria, Canvas 2D como primer prototipo.
- Separación entre motor, interfaz y definición de cada obra.
- Configuración por obra en `work.json`.
- Audio con análisis Web Audio en tiempo real y posibilidad de datos precalculados.
- No comprometerse con 4K interno hasta medir rendimiento en iPad y TCL 55Q650G.
- Android TV será una etapa posterior; no se considera implementada.

## Pendientes inmediatos
1. Revisar y aprobar `docs/contrato-de-capas-y-work-json.md`.
2. Claude debe entregar esquema concreto de `work.json`, especificación de capas y estructura final de carpetas.
3. ChatGPT prepara recursos visuales solo con la imagen maestra real como referencia; no declarar capas finales hasta revisarlas.
4. Verificar ubicación real de imagen maestra, audio y cualquier recurso local antes de afirmar que están guardados en GitHub.
5. Solo después de aprobar el contrato, autorizar prototipo técnico en rama independiente.

## No confundir
- Documento de diseño ≠ código implementado.
- Recurso provisional ≠ recurso aprobado.
- Archivo local de una IA ≠ archivo guardado en GitHub.
- Revisión automatizada ≠ prueba en iPad o televisor reales.
