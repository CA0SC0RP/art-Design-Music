# Living Paper Engine — instrucciones de trabajo

**Objetivo vigente desde 2026-11-01:** desarrollar un motor y estudio visual para crear caricaturas animadas y microhistorias, con una interfaz visual prioritaria para iPad. La dirección del producto está documentada en docs/direccion-motor-caricaturas-ipad.md.

## Propósito y experiencia

El usuario debe poder construir y editar una caricatura desde una interfaz visual en su iPad: ver el escenario, seleccionar personajes y objetos, modificar sus propiedades, definir movimientos y revisar la animación. La evolución prevista incluye línea de tiempo, varias escenas, diálogos, efectos, música original para cada historia y exportación de vídeo.

La primera prioridad es construir el editor visual completo de personajes: partes, jerarquías, rigs/huesos, articulación, deformación, texturas, poses y expresiones. Safari en iPad es el navegador de referencia inicial; también se intentará compatibilidad con Chrome, Firefox y Opera. No asumir que el editor completo, la conexión directa con ChatGPT o la exportación ya existen.

## Responsabilidades

- **ChatGPT:** único asistente de IA del flujo. Lee los archivos directamente desde GitHub cuando las herramientas lo permitan; diseña la arquitectura, escribe y modifica código, documenta decisiones, ejecuta o coordina pruebas verificables y revisa resultados.
- **Usuario:** dirección creativa, pruebas desde el iPad y aprobación de decisiones y entregas.
- **Otros asistentes de IA:** no forman parte del flujo de trabajo. No delegar tareas a Claude ni solicitarle lecturas, auditorías o implementaciones.

## Límites reales de la colaboración desde iPad

Al inicio, el ciclo será: el usuario describe el cambio en el chat; ChatGPT modifica el código en la rama autorizada; el usuario actualiza/abre la vista previa en el iPad y revisa el resultado. No afirmar que ChatGPT observa o controla en directo el lienzo de Safari. Un puente de edición en tiempo real es una función futura que deberá diseñarse e implementarse explícitamente.

## Reglas obligatorias

1. Verificar repositorio, rama y estado de los archivos antes de escribir.
2. Trabajar en feature/living-paper-engine-foundation mientras siga siendo la rama autorizada. No modificar main.
3. No fusionar ramas, abrir PR, desplegar ni publicar sin autorización expresa.
4. No crear repositorios; respetar el máximo acordado de cuatro.
5. No gastar dinero, activar servicios de pago ni conectar APIs externas sin autorización expresa.
6. No sobrescribir ni eliminar archivos existentes sin autorización. Preferir archivos nuevos cuando sea posible.
7. No inventar archivos, pruebas, commits, publicaciones ni resultados. Verificar cada operación.
8. Distinguir propuestas, prototipos, pruebas ejecutadas y funciones verificadas en el iPad.
9. No tratar recursos provisionales como finales. La aprobación creativa corresponde al usuario.
10. No imponer al motor nuevo la estética de papel recortado, el marco ornamental, la escena Mountains That Breathe, el paralaje ni el comportamiento ambiental del proyecto anterior.
11. La música y el sonido se diseñan para cada microhistoria cuando la narrativa esté definida; no imponer ambient, lo-fi, chillout ni un tempo global.
12. Priorizar una interfaz táctil clara y usable en iPad. Safari será el navegador de referencia inicial; probar también Chrome, Firefox y Opera en iPad. Evitar exigir que el usuario escriba código.
13. Mantener los recursos, prototipos y documentos anteriores como antecedentes hasta clasificarlos. No borrarlos durante la transición.
14. Registrar en la bitácora fecha, objetivo, rama y commit de partida, archivos afectados, cambios, pruebas reales, problemas y siguiente paso.
15. No declarar una función como compatible con Safari/iPad hasta que el usuario o una prueba verificable confirme su funcionamiento.

## Flujo de trabajo

1. Leer este archivo, ESTADO_PROYECTO.md, BITACORA.md, ARQUITECTURA.md y docs/direccion-motor-caricaturas-ipad.md.
2. Consultar documentación anterior solo cuando sea necesario para recuperar o clasificar trabajo reutilizable.
3. Verificar rama y archivos reales en GitHub.
4. Separar hechos, propuestas, código existente y decisiones pendientes.
5. Hacer cambios pequeños, aislados y reversibles en la rama autorizada.
6. Ejecutar pruebas adecuadas y registrar exactamente qué se comprobó.
7. Entregar al usuario el enlace de los archivos y los pasos mínimos para revisar desde el iPad.

## Alcance de desarrollo inmediato

Continuar el editor visual de personajes como primera prioridad. El prototipo actual de escenario y personaje geométrico es solo una prueba técnica; no debe confundirse con el editor completo. Diseñar e implementar de forma incremental herramientas de partes, jerarquía, pivotes, rig/huesos, deformación, texturas, poses y expresiones. Validar las interacciones táctiles en Safari del iPad y probar después Chrome, Firefox y Opera. No adelantar escenas completas, timeline, renderizador ni exportación hasta completar la base de personajes.

## Documentación anterior

La auditoría técnica del 2026-10-29, el contrato v2 de capas y la partitura audiovisual de Mountains That Breathe pertenecen al objetivo anterior. La auditoría queda cerrada como registro histórico; el contrato v2 no está aprobado para el motor nuevo; la partitura lo-fi queda obsoleta para la planificación activa. No continuar las tareas D1–D9 ni implementar el antiguo validador.

