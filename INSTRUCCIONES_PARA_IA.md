# Cuadro Vivo — instrucciones para IA

## Propósito
Cuadro Vivo es una experiencia de **arte visual en movimiento inspirada en cuadros de papel recortado**, con profundidad, color intenso, iluminación ambiental y música. No es un videojuego. La aplicación es únicamente el medio de reproducción.

## Distribución de responsabilidades
- **ChatGPT — dirección y producción visual:** análisis de la referencia, definición y producción de capas, coherencia estética, especificaciones visuales, transparencia, alineación y revisión de composición.
- **Claude — ingeniería:** arquitectura, visor, motor de animación, audio, controles, pruebas técnicas e integración de recursos visuales aprobados.
- **Usuario — dirección creativa y aprobación:** aprueba cambios visuales y decisiones importantes; valida el resultado en dispositivos reales.

## Reglas obligatorias
1. La imagen maestra aprobada es referencia; nunca sobrescribirla ni modificarla como parte del trabajo de capas.
2. No cambiar composición, paleta, marco, elementos ni estilo sin aprobación explícita.
3. No inventar que archivos, pruebas, commits o despliegues existen. Verificar y comunicar el estado real.
4. No tratar recursos provisionales como finales. Etiquetar demos y marcadores claramente.
5. Cada capa debe documentar nombre, archivo, dimensiones, origen/posición, orden, transparencia, movimiento permitido y margen seguro.
6. Los movimientos son sutiles, diferenciados por elemento y compatibles con la estética artesanal de papel.
7. El marco ornamental permanece completo y fijo.
8. Los huecos detrás de elementos móviles deben reconstruirse de forma coherente; si no se puede, reducir o eliminar el movimiento.
9. No sobrescribir ni eliminar archivos existentes sin autorización.
10. Trabajar en ramas separadas de `main`; entregar cambios para revisión antes de fusionar.
11. Si una herramienta solo tiene acceso de lectura o trabaja en un entorno local, decirlo claramente. No afirmar que los cambios están en GitHub hasta verificarlos allí.
12. Documentar decisiones, estado, bloqueos y siguiente paso en los archivos de proyecto.
13. Toda coordenada de un elemento se mide sobre la imagen maestra original. Las coordenadas del paquete preliminar v0.1 no se reutilizan automáticamente.
14. Solo el usuario marca un recurso como `aprobado`; una IA puede dejarlo, como máximo, en `en_revision`.

## Flujo de cambios
1. Leer este archivo, `ESTADO_PROYECTO.md`, `ARQUITECTURA.md` y la bitácora.
2. Verificar el repositorio y la rama actuales.
3. Proponer el cambio y sus archivos afectados.
4. Implementar solo dentro del alcance autorizado.
5. Ejecutar pruebas reales disponibles y registrar sus resultados.
6. Resumir cambios, archivos, limitaciones y próximos pasos.

## Contrato visual-técnico
El formato compartido está definido en `docs/contrato-de-capas-y-work-json.md` y en `works/work.schema.json`; las comprobaciones previstas, en `docs/plan-de-validacion-automatica.md`. Son propuestas hasta que el usuario las apruebe. No introducir campos incompatibles sin documentarlos y acordarlos. Los recursos visuales aprobados son la fuente de verdad para la apariencia; el motor no debe reinterpretarlos creativamente.
