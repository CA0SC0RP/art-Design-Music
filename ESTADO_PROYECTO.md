# Cuadro Vivo — estado del proyecto

**Estado:** preparación. El contrato de capas v2, el esquema de datos y el plan de validación siguen siendo propuestas pendientes de revisión del usuario. No hay motor, visor, validador, capas finales, sprites finales ni audio final. No declarar nada de eso como implementado.

**Actualizar este archivo al fusionar cualquier rama:** contiene datos que cambian (commits, ramas).

## Visión
Experiencia de arte visual en movimiento basada en cuadros de papel recortado, con profundidad ambiental, color intenso y música compuesta junto con la escena. Primera obra: **Mountains That Breathe / Montañas en armonía**. Objetivo futuro: galería de ocho obras. Primera plataforma: prototipo web, probado en Safari del iPad; Android TV es una etapa posterior.

## Responsabilidades
- ChatGPT: dirección visual, diseño y especificación musical, producción/revisión de recursos visuales y partitura audiovisual.
- Claude: arquitectura, motor, visor, sistema de animación, audio, controles, integración y pruebas técnicas.
- Usuario: decisiones creativas y aprobación de recursos y entregas.

## Estado de ramas verificado el 29-10-2026
- `main` está en `e2c7399`: fusión del PR #2 por `CA0SC0RP` el 27-10-2026 a las 14:18 (-0600). Incluye el contrato v2, `works/work.schema.json`, `works/index.json`, `docs/plan-de-validacion-automatica.md`, `tests/test_contrato_v2.py` y `docs/direccion-artistica-y-partitura-audiovisual.md`.
- Contenidas en `main`: `contrato/capas-v2-esquema-y-validacion` (`b137906`), `direccion-artistica-musica-sprites-2026-10-27` (`1fc7bea`) y `preparacion/contrato-datos-y-protocolo` (`cebbe47`).
- El contrato v2, el esquema y el plan siguen documentados como propuesta. La fusión los integró en `main`, pero no consta una aprobación explícita del usuario (decisión D1 en `docs/auditoria-tecnica-2026-10-29.md`).
- `auditoria/estado-2026-10-29` (desde `e2c7399`): auditoría técnica y propuesta de fase siguiente. No fusionada; espera revisión.
- Volver a verificar GitHub antes de afirmar que este estado sigue igual.

## Maestra original
El registro anterior identifica la imagen maestra como PNG RGB de 8 bits, 3840 × 2160, sin perfil de color incrustado; SHA-256 registrado: `d216046d9f78331c5372f867afc56a90a7b9f9659e27e026b28a89958cf2cfdc`. No sobrescribirla ni modificarla. Verificar que el archivo y el hash coincidan antes de usarlo para medir o producir capas.

## Estado técnico registrado anteriormente
- Propuesta: web modular, HTML/CSS/JavaScript y Canvas 2D como primer prototipo; audio mediante Web Audio/análisis en tiempo real y posibilidad de datos precalculados.
- Repetidas el 29-10-2026 sobre `main` (`e2c7399`): 45 pruebas, 30 superadas, 15 omitidas, 0 fallos. Los 15 marcadores omitidos son funciones vacías; además, 18 reglas del catálogo del plan no tienen prueba ni marcador (`docs/auditoria-tecnica-2026-10-29.md`, §2).
- No hay constancia verificada de un validador, motor, visor, pruebas con PNG de capas reales, audio final o pruebas reales en iPad/televisor.
- No reutilizar automáticamente coordenadas del paquete preliminar v0.1: volver a medir sobre la maestra real.

## Decisiones creativas acordadas el 27-10-2026
- Todas las escenas, sin excepción, deben parecer hechas de papel recortado: animales, plantas, agua, sol, cielo, nubes, niebla/humo, casas, rocas y elementos atmosféricos.
- Referencia de materialidad: diorama/teatro de papel en capas, bordes recortados, textura de cartulina, sombras y profundidad; no estilo cartoon ni apariencia de óleo. Inspiración conceptual en la materialidad de Tearaway sin copiar sus diseños.
- La escena maestra objetivo es panorámica 16:9, con objetivo de 3840×2160 y alta nitidez; comprobar la resolución real del archivo.
- Marco ornamental dorado completo y fijo. El exterior detrás del marco debe ser negro OLED puro (#000000), sin madera adicional.
- Todo elemento visible debe tener algún movimiento sutil cuando sea visualmente coherente. Usar capas de profundidad, sprites/secuencias de poses y ciclos largos cuando corresponda; no hacer que todo se mueva a la vez ni de forma frenética.
- El agua/río tendrá un ciclo continuo y fluido; cascada, niebla, nubes, árboles, animales, aves y luz podrán tener ritmos y fases independientes.
- La música se diseña para cada obra y junto con su comportamiento visual. Referencias iniciales: ambient, lo-fi, chillout; se puede variar por cuadro. Tempo tentativo del primer cuadro ~72 BPM, sujeto a composición y aprobación.
- La sincronización combinará eventos/marcas temporales derivados de la composición con análisis de audio suavizado. No depender solo de detección de graves/agudos ni mapear automáticamente un sonido a un objeto.
- Idea futura: cuadro gótico con castillo distante, niebla y murciélagos; no forma parte de la primera obra.

## Próximos pasos
1. Revisar la dirección creativa documentada en `docs/direccion-artistica-y-partitura-audiovisual.md`.
2. Preparar/aprobar una imagen maestra limpia del primer cuadro antes de cortar capas. La lámina conceptual con paneles no es la maestra final.
3. Crear inventario de elementos y tipos de animación, medir coordenadas sobre la maestra y definir reconstrucciones necesarias.
4. Diseñar música y partitura audiovisual en paralelo con el inventario de movimientos.
5. Claude puede avanzar con auditoría técnica, modelo de datos para sprites/ciclos/eventos musicales y pruebas de concepto sin alterar la maestra ni afirmar que los recursos finales existen.
6. Mantener cambios en ramas; no fusionar ni desplegar sin aprobación.
7. Auditoría entregada el 29-10-2026 (`docs/auditoria-tecnica-2026-10-29.md`). Falta tu respuesta a las decisiones D1 a D9 antes de iniciar la siguiente fase.
