# Cuadro Vivo — producción por capas desde cero

Estado: flujo de trabajo aprobado para reconstruir la escena a partir de capas independientes. La imagen maestra existente se conserva como referencia visual y no se modifica.

> **Nota (propuesta, 2026-10-26):** donde este documento exige lienzos de 3840 × 2160 para todas las capas, el contrato v2 (`contrato-de-capas-y-work-json.md`, sección 3) permite además capas recortadas con posición y escala declaradas. Una vez aprobado el contrato, rige en caso de conflicto.

## Objetivo

Crear las capas por separado y componerlas para comprobar que el resultado coincide lo más posible con la imagen maestra aprobada. No se considera terminada una capa por existir: se valida visualmente dentro de la composición completa.

## Reglas que no se negocian

- Lienzo de todas las capas: 3840 × 2160 px, 16:9.
- La imagen maestra es la referencia de composición, color, escala y posición.
- El marco ornamental debe permanecer completo, visible en sus cuatro lados e inmóvil.
- Estética de diorama de papel recortado, con bordes y profundidad coherentes entre capas.
- No añadir elementos que no estén en la composición aprobada.
- Evitar recortes aproximados de la imagen aplanada cuando se pueda generar el elemento desde cero.
- Cada capa debe tener transparencia real donde corresponda y el mismo tamaño de lienzo para alinearse sin moverla.
- Guardar originales y pruebas por separado; nunca sobrescribir la maestra.

## Orden propuesto de capas

El orden siguiente va del fondo hacia el frente:

1. 01_sky_base — cielo y gradiente atmosférico, sin sol ni aves.
2. 02_distant_mountains — montañas lejanas, con contornos de papel.
3. 03_mid_mountains — montañas intermedias.
4. 04_near_mountains — relieves cercanos que enmarcan el valle.
5. 05_sun_glow — resplandor atmosférico del sol, si se puede separar sin halos artificiales.
6. 06_sun_disc — disco solar.
7. 07_far_forest — bosques lejanos.
8. 08_mid_forest — bosques intermedios.
9. 09_waterfall_river — cascada, río y reflejos; separar reflejos solo si ayuda al movimiento.
10. 10_mist — bancos de neblina en capas independientes.
11. 11_foreground_foliage — flores, hierbas y vegetación del primer plano.
12. 12_deer — ciervo completo como silueta coherente, incluyendo astas, orejas y patas.
13. 13_birds — aves como elementos separados si su movimiento lo requiere.
14. 14_frame — marco ornamental completo, fijo y por encima de la escena.

La lista se puede ajustar durante la inspección de la maestra; no se inventarán partes ocultas sin comprobar que sean necesarias para el movimiento.

## Procedimiento para cada capa

1. Crear el elemento respetando la composición maestra: ubicación, escala, silueta, paleta, iluminación y estilo de papel.
2. Prepararlo sobre un lienzo transparente de 3840 × 2160 px, sin recortar el lienzo al contorno del objeto.
3. Componerlo con las capas ya aprobadas y comparar contra la maestra.
4. Revisar bordes, halos, huecos, solapamientos y continuidad del fondo al 100%.
5. Ajustar antes de pasar a la siguiente capa.
6. Guardar la versión aprobada y una previsualización de la composición acumulada.

## Pruebas de aceptación

- La composición está alineada y conserva la proporción 16:9.
- El marco se ve completo en los cuatro lados.
- Al apilar las capas, el conjunto se parece a la maestra en distribución, color, luz y escala.
- No quedan huecos al probar un movimiento pequeño de ciervo, aves, neblina o agua.
- Las partes que deben permanecer fijas no se desplazan.
- La escena no se da por aprobada solo porque las capas individuales parezcan correctas.

## Estado actual

La imagen maestra 4K está en la raíz del repositorio. Las máscaras preliminares de la versión anterior son únicamente referencias y no se consideran material final. La producción nueva comienza con capas diseñadas de forma independiente y se valida mediante composición incremental.
