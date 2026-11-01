# Prueba técnica — Nivel 01: cinco capas

Prototipo desechable para comprobar que cinco imágenes independientes pueden componerse y moverse por separado.

## Abrir
Abrir `index.html` en un servidor web estático. La prueba está pensada para Safari en iPad y pantallas 16:9.

## Qué incluye
- Cinco archivos SVG independientes con transparencia donde corresponde.
- Orden de composición por profundidad.
- Movimientos CSS suaves y con duraciones diferentes.
- Control para pausar/reanudar.
- Respeto por `prefers-reduced-motion`.

## Qué no incluye
No usa la imagen maestra, imágenes externas, sprites de personajes, audio ni recursos finales. Los SVG son figuras vectoriales originales y provisionales, creadas para comprobar la mecánica. Todavía no se ha probado en Safari real.

## Siguiente validación
1. Publicar o servir la carpeta como sitio estático.
2. Abrir en Safari del iPad.
3. Confirmar carga de las cinco capas, composición, pausa/reanudación y ausencia de saltos.
4. Solo después aumentar la complejidad.
