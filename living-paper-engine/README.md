

## Malla física independiente (fundación)

Se añadió `src/physics-mesh.js` como primera pieza de la separación entre simulación y presentación. Crea una proxy de baja resolución a partir de la geometría actual de una PaperMesh visual, conserva la silueta y las transformaciones compartidas, y permite transferir desplazamientos de contacto de vuelta a la malla visual mediante interpolación bilineal. La malla visual mantiene sus propios vértices, textura y resolución; la proxy no reemplaza el detalle de renderizado.

La proxy se refresca desde la geometría visual antes de una pasada de contacto y aplica únicamente el desplazamiento calculado por el solver. Este módulo está probado de forma aislada, pero **todavía no está conectado al solver de `layers.js` ni al ciclo de render**. La integración debe hacerse en una fase posterior con pruebas de regresión de pliegues, sombras, contacto entre capas y grupos encadenados; no se debe considerar aún una mejora de FPS demostrada.
