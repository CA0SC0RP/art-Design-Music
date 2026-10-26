# Cuadro Vivo — Mountains That Breathe

## Estado del proyecto

Primera pieza visual aprobada: paisaje de montañas construido como capas de papel recortado, enmarcado por un marco ornamental de madera y dorado. El marco forma parte integral de la composición y debe permanecer visible en sus cuatro lados.

Para el estado técnico, las ramas abiertas y lo pendiente, ver [ESTADO_PROYECTO.md](ESTADO_PROYECTO.md).

### Imagen maestra
- Archivo: `cuadro_vivo_mountains_that_breathe_master_4k.png`, en la raíz del repositorio. No se mueve ni se modifica.
- Verificado el 26-10-2026 en `main`: PNG de 3840 × 2160 (UHD 4K, 16:9), RGB de 8 bits, sin perfil de color incrustado.
- SHA-256: `d216046d9f78331c5372f867afc56a90a7b9f9659e27e026b28a89958cf2cfdc`.
- Imagen fuente aprobada: 1672 × 941.
- Método de ampliación: Lanczos con enfoque moderado para reforzar bordes existentes.
- Nota de calidad: la ampliación aumenta la resolución de salida; no equivale a recuperar detalle original que no estuviera en la fuente. Revisar texturas y contornos al 100 % antes de declarar la maestra como final.

### Reglas visuales no negociables
1. Mantener intacta la composición aprobada: montañas, árboles, río y cascada, niebla, flores, ciervo, aves, cielo y marco.
2. No recortar ni ocultar ningún lado del marco.
3. Mantener orientación horizontal 16:9.
4. La escena debe sentirse como un diorama de papel en capas, no como un visualizador genérico.
5. Los movimientos deben ser sutiles y naturales; evitar que todos los elementos reaccionen a la música al mismo tiempo.

### Próximos pasos
1. Revisar y aprobar el contrato de capas v2, el esquema `works/work.schema.json` y el plan de validación automática.
2. Medir de nuevo las coordenadas de cada elemento sobre la imagen maestra original; las coordenadas preliminares v0.1 no se reutilizan.
3. Producir y revisar las capas, reconstruyendo las zonas ocultas detrás de cada elemento móvil.
4. Implementar el validador y, solo después de aprobar contrato y plan, el prototipo web (primera plataforma, probado en Safari del iPad).
5. Crear animaciones suaves y un mapeo musical para la pista «Mountains That Breathe — warm, atmospheric, uplifting lo-fi».
6. En una etapa posterior, adaptación a Android TV.

### Estructura del repositorio
Existe hoy:
- `cuadro_vivo_mountains_that_breathe_master_4k.png` — imagen maestra.
- `docs/` — contrato de capas, flujo de producción, controles de calidad, plan de validación y referencias.
- `README.md`, `ESTADO_PROYECTO.md`, `INSTRUCCIONES_PARA_IA.md`, `ARQUITECTURA.md`, `BITACORA.md`.

Previsto (aún no existe salvo lo que indique `ESTADO_PROYECTO.md`):
- `works/index.json` y `works/work.schema.json` — índice de obras y esquema.
- `works/<id>/work.json`, `works/<id>/layers/`, `works/<id>/audio/` — cada obra, sus capas y su pista.
- `src/` — motor, visor y audio.
- `tools/` — validador.

La ruta canónica definitiva de la maestra está pendiente de aprobación del usuario; mientras tanto permanece en la raíz.

## Protocolo de colaboración y documentos técnicos

Antes de trabajar, las IA deben leer:
- [Instrucciones para IA](INSTRUCCIONES_PARA_IA.md)
- [Estado del proyecto](ESTADO_PROYECTO.md)
- [Arquitectura propuesta](ARQUITECTURA.md)
- [Bitácora de decisiones](BITACORA.md)
- [Contrato de capas y work.json](docs/contrato-de-capas-y-work-json.md)
- [Plan de validación automática](docs/plan-de-validacion-automatica.md)

**Reparto de trabajo:** ChatGPT prepara y revisa los recursos visuales; Claude desarrolla el motor, visor, audio e integración; el usuario aprueba las decisiones creativas y entregas. Cuadro Vivo es arte visual en movimiento inspirado en cuadros de papel recortado, no un videojuego.

Los documentos técnicos son propuestas hasta que el usuario los apruebe; no significan que exista una aplicación implementada ni que las capas finales estén listas. Revisar los archivos reales y el estado de GitHub antes de afirmar lo contrario. Cuando dos documentos se contradigan, rige el contrato de capas una vez aprobado y, mientras tanto, se pregunta al usuario.
