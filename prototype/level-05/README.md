# Nivel 05 — Ecosistema reactivo

Prototipo técnico 16:9 que explora relaciones entre viento, luz, agua y fauna.

## Comportamientos
- Viento escalonado: copas, ramas y pastos reaccionan con fases diferentes; semillas recorren el paisaje.
- Luz ambiental: rayos atraviesan el bosque y una sombra suave de nube cruza el valle.
- Agua: cascada descendente, dos corrientes de río, reflejos y ondas con desfases.
- Fauna: aves que cruzan en una sola dirección, mariposas con ciclos suaves, luciérnagas independientes y peces con recorridos curvos.
- Profundidad mediante planos de montañas, bruma, bosque y primer plano.

## Continuidad de loops
- Los trazos del río desplazan el patrón exactamente por su periodo completo (64+42 y 82+60 unidades); al cerrar el ciclo, el patrón vuelve a coincidir.
- La cascada repite su patrón de guiones por su longitud total.
- Las aves se atenúan antes de reiniciar; no invierten bruscamente el sentido.
- Las ondas se desvanecen antes de reiniciar y tienen desfases entre sí.
- Los movimientos oscilatorios se reservan para ramas, pastos, alas y reflejos; la corriente conserva su dirección.

## Controles y accesibilidad
- Velocidad global de 0.5× a 1.8×; afecta duraciones, no coordenadas.
- Pausa/reanudación.
- La preferencia de movimiento reducido del sistema desactiva las animaciones automáticamente.

## Alcance
SVG original provisional. No usa imagen maestra, recursos finales, audio, bibliotecas, APIs ni servicios externos. No hay gasto asociado. No representa el motor final ni valida todavía el rendimiento en iPad.

## Validación pendiente
Abrir en Firefox y Safari de iPad. Comprobar composición, continuidad del río y cascada, viento escalonado, fauna, control global de velocidad, pausa y rendimiento. La publicación de Actions no equivale a aprobación visual.
