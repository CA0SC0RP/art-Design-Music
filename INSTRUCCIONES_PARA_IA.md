# Cuadro Vivo — instrucciones para IA

## Propósito
Cuadro Vivo es una experiencia de arte visual en movimiento basada en cuadros artesanales de papel recortado, con profundidad, iluminación ambiental y música diseñada junto con la escena. No es un videojuego de caricaturas ni una película narrativa; la animación debe ser suave, orgánica y musical.

## Distribución de responsabilidades
- **ChatGPT — dirección creativa/visual y musical:** analiza la referencia, propone composición y comportamiento, diseña la dirección musical y la partitura audiovisual, produce/especifica capas y sprites, revisa alineación, transparencia y coherencia visual.
- **Claude — ingeniería:** arquitectura, visor, motor de renderizado y animación, soporte para capas/sprites/ciclos, audio, sincronización musical, controles, pruebas técnicas e integración.
- **Usuario — dirección creativa y aprobación:** aprueba composiciones, recursos y decisiones importantes; valida resultados en dispositivos reales.

## Reglas obligatorias
1. La imagen maestra aprobada es referencia; nunca sobrescribirla ni modificarla como parte del trabajo de capas.
2. Todas las escenas deben parecer hechas de papel: animales, vegetación, agua, cielo, sol, niebla, nubes, casas, rocas y efectos atmosféricos. Usar bordes de corte, textura de cartulina, sombras entre planos y profundidad.
3. No copiar personajes, escenarios ni diseños de Tearaway; solo sirve como referencia conceptual de la materialidad artesanal.
4. El exterior del marco ornamental dorado será negro OLED puro (#000000), sin una segunda superficie de madera. El marco se mantiene completo y fijo.
5. No cambiar composición, paleta, marco, elementos ni estilo sin aprobación explícita.
6. No usar estética cartoon ni asumir que una imagen generada cumple 3840×2160. Verificar resolución y calidad reales.
7. Todo elemento visible debe tener un movimiento sutil cuando sea coherente. Los movimientos tienen ritmos y fases distintos; no mover todo al mismo tiempo ni de manera frenética.
8. Considerar capas espaciales, sprites/hojas de poses y ciclos largos según el elemento. Agua y cascadas requieren continuidad; niebla y nubes deben desplazarse como capas; animales pueden tener ciclos discretos; el movimiento de objetos inertes debe justificarse musicalmente.
9. La música se diseña junto con cada cuadro. Referencias iniciales: ambient, lo-fi y chillout, con libertad para variar el género en cada obra.
10. La sincronización debe combinar eventos/marcas temporales de la composición con análisis de audio suavizado cuando aporte valor. No depender solo de umbrales de graves/agudos ni mapear mecánicamente una frecuencia a un objeto.
11. Los huecos detrás de elementos móviles deben reconstruirse coherentemente; si no se puede, reducir o eliminar el movimiento y solicitar aprobación cuando corresponda.
12. Cada recurso documenta nombre, archivo, dimensiones, origen/posición, orden, transparencia, movimiento, margen seguro, dependencias y reconstrucción.
13. No inventar archivos, pruebas, commits o despliegues. Verificar y comunicar el estado real.
14. No tratar recursos provisionales como finales. Solo el usuario marca un recurso como `aprobado`; una IA puede dejarlo, como máximo, en `en_revision`.
15. No sobrescribir ni eliminar archivos existentes sin autorización.
16. Trabajar en ramas separadas de `main`; entregar cambios para revisión antes de fusionar.
17. Toda coordenada se mide sobre la imagen maestra original. Las coordenadas del paquete v0.1 no se reutilizan automáticamente.
18. Si una herramienta solo tiene acceso de lectura o trabaja en un entorno local, decirlo claramente. No afirmar que los cambios están en GitHub hasta verificarlos allí.
19. Documentar decisiones, estado, bloqueos y siguiente paso en los archivos del proyecto.

## Flujo de cambios
1. Leer este archivo, `ESTADO_PROYECTO.md`, `BITACORA.md`, `ARQUITECTURA.md`, `docs/contrato-de-capas-y-work-json.md`, `docs/plan-de-validacion-automatica.md` y `docs/direccion-artistica-y-partitura-audiovisual.md`.
2. Verificar repositorio, rama y estado actual de GitHub.
3. Separar hechos implementados, propuestas y decisiones pendientes.
4. Trabajar solo dentro del alcance autorizado y en una rama.
5. Ejecutar pruebas reales y registrar resultados.
6. Resumir cambios, archivos, limitaciones y próximos pasos.

## Alcance inicial para Claude
Puede comenzar con una auditoría técnica y una propuesta de modelo de datos para capas, sprites, ciclos de animación y eventos de partitura audiovisual. Definir cómo cargar ciclos y sincronizarlos con eventos temporales, cómo combinar estos con análisis de audio suavizado y cómo validar límites de movimiento. Crear pruebas de concepto técnicas con recursos claramente marcados como provisionales si hace falta. No generar/reemplazar la maestra, no producir capas finales sin la referencia aprobada y no fusionar ramas ni desplegar sin permiso.

## Contrato visual-técnico
El formato compartido está definido en `docs/contrato-de-capas-y-work-json.md` y `works/work.schema.json`; las comprobaciones previstas, en `docs/plan-de-validacion-automatica.md`. Son propuestas hasta que el usuario las apruebe. No introducir campos incompatibles sin documentarlos y acordarlos.
