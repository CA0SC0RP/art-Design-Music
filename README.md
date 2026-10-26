# Cuadro Vivo — Mountains That Breathe

## Estado del proyecto

Primera pieza visual aprobada: paisaje de montañas construido como capas de papel recortado, enmarcado por un marco ornamental de madera y dorado. El marco forma parte integral de la composición y debe permanecer visible en sus cuatro lados.

### Imagen maestra
- Archivo de trabajo local: `cuadro_vivo_mountains_that_breathe_master_4k.png`
- Resolución preparada: 3840 × 2160 (UHD 4K), relación 16:9.
- Formato: PNG RGB.
- Imagen fuente aprobada: 1672 × 941.
- Método de ampliación: Lanczos con enfoque moderado para reforzar bordes existentes.
- Nota de calidad: la ampliación aumenta la resolución de salida; no equivale a recuperar detalle original que no estuviera en la fuente. Revisar texturas y contornos al 100% antes de declarar la maestra como final.

### Reglas visuales no negociables
1. Mantener intacta la composición aprobada: montañas, árboles, río y cascada, niebla, flores, ciervo, aves, cielo y marco.
2. No recortar ni ocultar ningún lado del marco.
3. Mantener orientación horizontal 16:9.
4. La escena debe sentirse como un diorama de papel en capas, no como un visualizador genérico.
5. Los movimientos deben ser sutiles y naturales; evitar que todos los elementos reaccionen a la música al mismo tiempo.

### Próximos pasos
1. Revisar la imagen 4K a tamaño completo y corregir artefactos si los hay.
2. Preparar una versión maestra sin pérdida y copias de trabajo.
3. Separar capas con transparencia, reconstruyendo las zonas ocultas detrás de cada elemento móvil.
4. Crear animaciones suaves y un mapeo musical para la pista “Mountains That Breathe — warm, atmospheric, uplifting lo-fi”.
5. Probar el resultado en pantalla horizontal y preparar la adaptación a Android TV.

### Estructura prevista
- `artwork/master/` — imagen maestra aprobada.
- `artwork/layers/` — elementos separados con transparencia.
- `audio/` — pista original y datos de análisis.
- `src/` — motor de animación, sincronización musical y reproducción.
- `docs/` — decisiones visuales, arquitectura y pruebas.

**Importante:** no se debe considerar que la imagen PNG está guardada en este repositorio hasta que exista y se verifique un archivo binario en GitHub. Este README registra el estado y las reglas del proyecto.


## Protocolo de colaboración y estado técnico

Antes de trabajar, las IA deben leer:
- [Instrucciones para IA](INSTRUCCIONES_PARA_IA.md)
- [Estado del proyecto](ESTADO_PROYECTO.md)
- [Arquitectura propuesta](ARQUITECTURA.md)
- [Bitácora de decisiones](BITACORA.md)
- [Contrato de capas y work.json](docs/contrato-de-capas-y-work-json.md)

**Reparto de trabajo:** ChatGPT prepara y revisa los recursos visuales; Claude desarrolla el motor, visor, audio e integración; el usuario aprueba las decisiones creativas y entregas. Cuadro Vivo es arte visual en movimiento inspirado en cuadros de papel recortado, no un videojuego.

Los documentos técnicos en esta rama son propuestas de preparación; no significan que exista una aplicación implementada ni que las capas finales estén listas. Revisar los archivos reales y el estado de GitHub antes de afirmar lo contrario. Esta documentación se encuentra en la rama de preparación y aún no está fusionada en `main`.
