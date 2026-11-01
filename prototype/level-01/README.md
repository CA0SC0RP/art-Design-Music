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

## Animaciones internas añadidas
- El cielo anima por separado las dos masas de nubes con desplazamientos lentos y alternados.
- Las cuatro estrellas tienen ciclos de brillo escalonados.
- El río incorpora reflejos y trazos de superficie con desplazamiento continuo y pulsos suaves.
- Estas animaciones se implementan dentro de los SVG, no mediante el desplazamiento completo de la capa.
- La validación visual en Safari del iPad sigue pendiente; no se declara aprobada hasta que el usuario la compruebe.
