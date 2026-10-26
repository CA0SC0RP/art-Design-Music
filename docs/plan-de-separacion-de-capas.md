# Cuadro Vivo — Plan de separación de capas

## Obra de referencia
- Escena: **Mountains That Breathe**
- Lienzo objetivo: **3840 × 2160 px, 16:9**
- La imagen maestra se conserva sin modificaciones como referencia.
- El marco ornamental queda fijo y debe permanecer íntegro.

## Estado actual
La extracción técnica preliminar v0.1 incluye:
- Fondo con reconstrucción aproximada detrás de algunos elementos.
- Máscara alfa preliminar del venado.
- Máscara alfa preliminar del disco solar.
- Máscara alfa preliminar de las aves.
- Copia de referencia original.

**Estas capas no están aprobadas para producción ni para animación final.** Las máscaras del venado y de las aves requieren limpieza de contorno; la reconstrucción de fondo requiere inspección visual y correcciones para eliminar artefactos.

## Orden de trabajo
1. Verificar dimensiones, alineación y perfil de color de todos los archivos.
2. Refinar el alfa del venado, incluidos astas, orejas y pelo, sin recortar detalles originales.
3. Refinar las siluetas de las aves y del sol, preservando sus bordes y el resplandor natural.
4. Reconstruir las zonas ocultas detrás de los elementos móviles y revisar a escala 100%.
5. Separar planos adicionales solo cuando puedan aislarse sin inventar bordes: montañas, bosque, agua, niebla y detalles de primer plano.
6. Mantener el marco completo como capa fija independiente, si la separación puede hacerse sin degradar la obra.
7. Componer cada capa sobre fondos contrastantes para detectar halos, bordes negros, píxeles opacos accidentales y huecos.
8. Probar desplazamientos pequeños antes de integrar las capas en la aplicación.

## Criterios de aceptación
- Todas las capas conservan el mismo lienzo de 3840 × 2160 y coordenadas compartidas.
- Los PNG móviles usan transparencia alfa real.
- No aparecen franjas negras, halos evidentes ni bordes recortados en los movimientos de prueba.
- Las áreas que quedan expuestas al mover objetos tienen fondo reconstruido suficiente.
- La composición, el color, el marco y el estilo artesanal de papel recortado se mantienen fieles a la imagen maestra.
- Las capas se etiquetan como preliminares hasta pasar la revisión visual.

## Estructura objetivo

> **Nota (propuesta, 2026-10-26):** esta estructura quedó superada por la de `ARQUITECTURA.md` (`works/<id>/layers/`), que mantiene la maestra en la raíz del repositorio. Los criterios de aceptación de abajo asumen lienzo completo; el contrato v2 también admite capas recortadas (sección 3).

```
artwork/
  master/
  layers/
  previews/
docs/
  plan-de-separacion-de-capas.md
```

No añadir capas a la estructura final hasta que se hayan validado. Guardar versiones y cambios de forma incremental para que la imagen maestra nunca se pierda.
