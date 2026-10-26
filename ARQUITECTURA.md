# Cuadro Vivo — arquitectura propuesta

**Estado:** propuesta; no implementada ni validada en dispositivos.

## Responsabilidades
1. **Motor:** reloj de animación, composición, transformaciones limitadas, carga de recursos y acceso a datos de audio.
2. **Aplicación/visor:** galería, selección de obra, reproducción/pausa, controles táctiles, teclado y mando.
3. **Definición de obra:** metadatos, capas ordenadas, rutas de recursos, parámetros de movimiento y configuración de audio.
4. **Adaptadores de plataforma:** navegador web primero; posible contenedor Android TV después.

## Tecnología inicial
- HTML, CSS y módulos JavaScript sin compilación obligatoria.
- Canvas 2D como primera implementación para componer capas y controlar transformaciones.
- Web Audio API para reproducción y análisis en tiempo real cuando el navegador lo permita; datos precalculados como alternativa.
- GitHub Pages es una opción de publicación, pendiente de configuración y pruebas.
- Android TV/WebView y generación de APK son etapas futuras, no parte del primer prototipo.

## Reglas de renderizado
- El marco se conserva completo y fijo.
- Coordenadas de referencia: 3840×2160. El renderizador puede escalar la resolución interna de forma adaptativa.
- No es obligatorio decodificar todas las capas a tamaño completo simultáneamente; medir carga, memoria y rendimiento.
- Limitar desplazamientos según el margen seguro declarado por capa.
- Movimiento sutil y diferenciado; no todas las capas reaccionan a la música al mismo tiempo.
- La configuración de la obra no debe depender de la interfaz.

## Audio
- Iniciar reproducción mediante acción del usuario cuando la plataforma lo exija.
- La obra debe seguir mostrándose aunque el análisis musical no esté disponible.
- El análisis en tiempo real puede obtener energía suavizada de graves, medios, agudos y energía global.
- No afirmar compatibilidad final hasta probar Safari y el televisor real.

## Validación
Medir carga, fluidez y estabilidad con recursos representativos. Los marcadores de demostración deben estar claramente etiquetados. Las pruebas automatizadas no sustituyen las pruebas reales en iPad Safari y TCL 55Q650G.

## Estructura objetivo provisional
```text
index.html
styles/
src/engine/
src/app/
src/audio/
works/index.json
works/mountains-that-breathe/work.json
works/mountains-that-breathe/layers/
works/mountains-that-breathe/audio/
works/_demo/
tests/
docs/
android/  # etapa futura
```

La estructura final se confirmará al aprobar `docs/contrato-de-capas-y-work-json.md`. No mover ni duplicar la maestra sin verificar su ubicación y acordar una ruta canónica.
