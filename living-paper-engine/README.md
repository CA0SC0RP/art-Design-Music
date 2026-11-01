# Living Paper Engine — código experimental conservado

**Estado actual:** esta carpeta contiene el laboratorio técnico de la etapa anterior, orientado a geometría, materiales y animación de papel recortado. No es todavía el motor ni el editor de caricaturas.

El nuevo objetivo del repositorio es un estudio visual para crear caricaturas y microhistorias, con prioridad de uso en iPad. La dirección vigente está documentada en:
- `../docs/direccion-motor-caricaturas-ipad.md`
- `../docs/auditoria-reutilizacion-motor-caricaturas-ipad-2026-11-01.md`

## Qué contiene esta carpeta

El laboratorio usa PixiJS 8.10.1 desde CDN e incluye:
- escenario 2D, contenedores y transformaciones;
- piezas de papel y materiales experimentales;
- trayectorias, articulaciones y flexión;
- deformación de mallas, anclajes y pliegues;
- relieve, cantos, sombras y contacto entre capas;
- inspector HTML para ajustar parámetros de la demostración.

## Cómo interpretar este código

La inicialización de PixiJS, el escenario, el ciclo de actualización, las transformaciones, la pausa/velocidad y algunas ideas de jerarquía y trayectorias pueden ser reutilizables.

Los módulos de papel, pliegues, contacto entre hojas, volumen y cantos son especializados. No deben convertirse en requisitos del nuevo motor de caricaturas.

El laboratorio actual no ofrece todavía selección táctil directa de personajes, un sistema completo de huesos y poses, una línea de tiempo narrativa, guardado de proyectos ni exportación de historias.

## Conservación

Esta carpeta y sus archivos se mantienen como antecedente técnico. No eliminar ni reemplazar módulos durante la transición. La nueva prueba de estudio visual deberá construirse de forma aislada y reversible, después de revisar la arquitectura.

## Pruebas

Las pruebas unitarias existentes cubren módulos matemáticos y partes de la geometría experimental. No prueban por sí solas la integración gráfica ni la compatibilidad con Safari/iPad. No declarar compatibilidad hasta realizar una prueba real en el dispositivo.
