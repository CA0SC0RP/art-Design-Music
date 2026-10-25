# Auditoría técnica de capas — v0.1

Fecha: 2026-10-25

## Resultado
Se inspeccionaron los PNG preliminares del paquete local v0.1. Todos los archivos usan el lienzo 3840 × 2160, por lo que comparten las mismas coordenadas. Las capas móviles de venado, sol y aves son RGBA y tienen canal alfa con valores transparentes y opacos.

## Medidas del alfa
- Venado: caja de píxeles con alfa > 10: x=3187..3382, y=1249..1531.
- Sol: caja de píxeles con alfa > 10: x=2917..3034, y=454..571.
- Aves: caja de píxeles con alfa > 10: x=2272..2527, y=436..534.

Estas cajas son controles técnicos, no certifican la calidad visual de los contornos.

## Hallazgos
- **Venado:** la máscara está descrita en el manifiesto de origen como un recorte poligonal aproximado. Requiere inspección detallada de astas, patas, orejas y silueta; no aprobar para movimiento todavía.
- **Sol:** el recorte circular conservador no representa necesariamente con precisión el borde real ni el halo luminoso. Debe decidirse qué parte del resplandor permanece en el fondo y qué parte acompaña al disco.
- **Aves:** la máscara de polígonos es preliminar y las aves son pequeñas. El borde puede verse dentado o cortar puntas de alas y cola; no aprobar para movimiento todavía.
- **Fondo reconstruido:** debe compararse con el original en los píxeles que quedan expuestos al desplazar los elementos. No se considera reconstrucción final por el mero hecho de existir un archivo de fondo.
- **Marco:** mantenerlo fijo y protegerlo de cualquier recorte o reconstrucción accidental.

## Próxima comprobación
1. Ver los bordes al 100–200 % y sobre fondos claros, oscuros y de color contrastante.
2. Inspeccionar si hay halos, dientes, píxeles semitransparentes indeseados o restos del fondo original en los objetos.
3. Desplazar cada capa unos pocos píxeles sobre la base reconstruida y observar huecos y repeticiones.
4. Corregir las máscaras y la base antes de autorizar la animación.

## Estado
**PRELIMINAR — NO APROBADO PARA PRODUCCIÓN.** No se afirma que el fondo reconstruido ni las máscaras estén perfectos. La imagen maestra se conserva sin modificar.
