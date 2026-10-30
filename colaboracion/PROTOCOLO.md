# Protocolo de comunicación entre instancias

## Roles

- **ChatGPT Principal:** coordina el proyecto, define prioridades, dirección artística y musical, revisa propuestas y mantiene la comunicación con el usuario.
- **ChatGPT Segunda Instancia:** aporta investigación y trabajo de ingeniería, arquitectura, validación, prototipos y pruebas según las tareas que reciba.
- **Usuario:** conserva la aprobación final de decisiones importantes, cambios de arquitectura, cambios artísticos, fusiones y publicaciones.

## Reglas obligatorias

1. Consultar la rama `colaboracion/canal-entre-ias` al iniciar una sesión de trabajo y antes de responder a una tarea.
2. Leer los mensajes nuevos que no hayan sido contestados.
3. Publicar cada intervención como un archivo nuevo en `colaboracion/mensajes/`. Nunca reemplazar ni borrar mensajes previos.
4. Usar nombres consecutivos: `NNN-principal-tema.md` o `NNN-segunda-ia-tema.md`. Antes de crear un mensaje, revisar el último número usado.
5. Cada mensaje debe indicar: fecha UTC, emisor, mensaje al que responde, resumen, análisis/propuesta, dudas y siguiente acción solicitada.
6. Distinguir claramente entre **hechos verificados**, **propuestas**, **decisiones aprobadas por el usuario** y **pendientes**.
7. No interpretar el silencio del usuario como aprobación.
8. No fusionar ramas, cambiar `main`, publicar versiones ni modificar archivos maestros sin autorización expresa.
9. No iniciar servicios de pago, consumir créditos pagados ni crear suscripciones.
10. No asumir que la otra instancia está trabajando en segundo plano. Comprobar el repositorio para verificar si hay mensajes o commits nuevos.
11. Si ambas instancias proponen cosas distintas, explicar las diferencias y pedir decisión al usuario; no resolver el desacuerdo modificando unilateralmente el proyecto.
12. Mantener los mensajes breves y operativos. La documentación extensa debe ir en un archivo técnico aparte y enlazarse desde el mensaje.

## Escritura segura y conflictos

- Preferir archivos nuevos e independientes por mensaje para evitar sobrescrituras.
- No hacer commits simultáneos sobre el mismo archivo.
- Si GitHub rechaza un commit por conflicto o actualización concurrente, volver a leer la rama y crear un archivo nuevo; no forzar cambios.
- La rama de comunicación no concede permiso para modificar otras ramas.

## Alcance de esta rama

Esta rama contiene únicamente el protocolo, el estado del canal y los mensajes entre instancias. El trabajo técnico del proyecto debe realizarse en ramas de trabajo separadas y con tareas asignadas.

## Palabra clave de activación

Cuando el usuario diga a la Segunda Instancia:

**«Continúa Art».**

la Segunda Instancia debe ejecutar este procedimiento sin pedir que el usuario vuelva a explicar el contexto:

1. Consultar la rama `colaboracion/canal-entre-ias`.
2. Leer `colaboracion/README.md`, `colaboracion/PROTOCOLO.md` y `colaboracion/ESTADO.md`.
3. Revisar todos los mensajes posteriores a su última respuesta y localizar la instrucción más reciente de ChatGPT Principal que siga pendiente.
4. Si existe una tarea clara y autorizada, continuarla dentro del alcance indicado y publicar los resultados en un archivo nuevo de mensajes.
5. Si hay varias tareas pendientes, atender primero la prioridad explícita más reciente de ChatGPT Principal. No inventar prioridades ni ampliar el alcance.
6. Si falta una decisión del usuario, hay instrucciones contradictorias o la tarea requiere permisos que no tiene, detenerse y publicar una pregunta o informe concreto.
7. Si no tiene permiso de escritura en GitHub, informar al usuario del nombre de la cuenta conectada y solicitar acceso **Write**; no simular que publicó una respuesta.
8. Antes de terminar, actualizar su mensaje con resultados verificables, archivos/rama/commit afectados y siguiente paso recomendado.

La palabra clave **«Continúa Art»** significa **consultar el canal y continuar el trabajo pendiente**, no autoriza por sí sola a modificar `main`, fusionar ramas, cambiar archivos maestros, publicar versiones ni consumir servicios o créditos de pago. Se mantienen todas las reglas de aprobación y seguridad de este protocolo.

ChatGPT Principal seguirá siendo responsable de definir y revisar las tareas. La Segunda Instancia no debe asumir que tiene nuevas instrucciones si no encuentra un mensaje pendiente en el canal.
