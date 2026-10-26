# Cuadro Vivo — control de calidad de capas y composición

Estado: lista de control para aplicar durante la reconstrucción por capas. No certifica capas todavía inexistentes.

> **Nota (propuesta, 2026-10-26):** en las capas recortadas permitidas por el contrato v2, el control de «lienzo exacto» se sustituye por comprobar `size`, `placement`, `scale` y `alphaBounds` declarados (`contrato-de-capas-y-work-json.md`, sección 3).

## Principio de trabajo

La imagen maestra aprobada es la referencia visual. El objetivo es reproducir su composición mediante capas independientes, no modificar la maestra ni aceptar una aproximación solo porque resulte atractiva.

## Control antes de aprobar cada capa

- [ ] Lienzo exacto de 3840 × 2160 px, relación 16:9.
- [ ] Posición, escala, silueta y paleta comparadas con la imagen maestra.
- [ ] Estética consistente de papel recortado: bordes, sombras y profundidad.
- [ ] Transparencia limpia donde corresponda; no hay fondo accidental.
- [ ] Sin halos, bordes blancos, píxeles sueltos ni contornos dentados visibles al 100%.
- [ ] Sin elementos añadidos que no existan en la referencia.
- [ ] La capa está nombrada, versionada y guardada sin sobrescribir el original.
- [ ] Se ha probado sobre fondos claros y oscuros para descubrir defectos de borde.

## Control de composición

- [ ] Todas las capas comparten tamaño de lienzo y origen (0,0); no se alinean a ojo.
- [ ] El orden de apilado corresponde a la profundidad de la escena.
- [ ] El marco ornamental aparece completo en los cuatro lados y permanece fijo.
- [ ] La distribución general, el horizonte, el sol, el río, los bosques y el ciervo coinciden con la referencia.
- [ ] No hay huecos detrás de objetos que se pretenda animar.
- [ ] Las sombras y la iluminación son coherentes entre capas.
- [ ] La composición completa se compara con la maestra en una vista lado a lado y en superposición al 50%.
- [ ] Se guarda una imagen de prueba con todas las capas y una lista de diferencias detectadas.

## Control de animación

Antes de animar un objeto, comprobar que:
- existe una capa independiente;
- el fondo detrás del objeto está reconstruido de forma convincente;
- el movimiento previsto no expone bordes o zonas vacías;
- el movimiento es pequeño y suave, apropiado para un cuadro vivo;
- la sincronización musical no provoca saltos, vibración o distracción;
- el marco permanece inmóvil.

## Secuencia de montaje recomendada

1. Fondo de cielo.
2. Montañas lejanas, medias y cercanas.
3. Sol y resplandor, si pueden separarse limpiamente.
4. Bosques por planos.
5. Cascada y río.
6. Neblina.
7. Vegetación del primer plano.
8. Ciervo y aves.
9. Marco fijo en la capa superior.
10. Composición completa, comparación con la maestra y corrección de diferencias.
11. Pruebas de movimiento de un elemento a la vez.
12. Prueba audiovisual con la pista musical.

## Regla de aprobación

No declarar el trabajo «perfecto» ni «listo» sin inspección real. Registrar cada defecto encontrado y corregirlo antes de seguir. Si no se puede reconstruir una zona oculta sin inventar detalles, mantenerla fija o limitar el movimiento que la expondría.

## Estado real a fecha de esta revisión

- La imagen maestra 4K existe en la raíz del repositorio.
- El plan de separación por capas y el flujo de producción están documentados.
- Las máscaras de la primera prueba son preliminares, no aprobadas para producción.
- Las nuevas capas artísticas todavía deben generarse y validarse; esta lista es el procedimiento de revisión, no una afirmación de que el montaje ya esté terminado.
