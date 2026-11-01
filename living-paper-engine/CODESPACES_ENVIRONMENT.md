# Living Paper — entorno de desarrollo con GitHub Codespaces

Estado: entorno elegido; configuración técnica pendiente de validación.
Fecha: 2026-11-01

## Decisión

GitHub Codespaces será el entorno principal de desarrollo y ejecución de Living Paper mientras se construye y prueba el sistema. El usuario trabajará desde Safari en su iPad; no necesita transferir manualmente el repositorio ni instalar el motor en el iPad para desarrollarlo.

## Repositorio y rama

- Repositorio: `CA0SC0RP/art-Design-Music`
- Rama autorizada: `feature/living-paper-engine-foundation`
- No trabajar en `main`.
- No fusionar ramas ni abrir/mergear Pull Requests sin autorización expresa.
- No crear repositorios adicionales.
- No activar servicios de pago ni incurrir en gastos sin autorización.

## Qué hará Codespaces

Codespaces proporciona un entorno de cómputo remoto donde podremos:
- Abrir directamente el repositorio y la rama de trabajo.
- Instalar dependencias de desarrollo.
- Ejecutar pruebas y herramientas de compilación.
- Levantar el servidor web de Living Paper Studio y los servicios locales de desarrollo.
- Ejecutar el motor y su API durante las sesiones de trabajo.
- Exponer un puerto del entorno para abrir la vista web desde Safari, sujeto a los permisos de visibilidad del puerto.
- Guardar cambios mediante Git en la rama de trabajo.

Codespaces será un servidor de desarrollo/pruebas, no se considerará alojamiento permanente 24/7. Las sesiones pueden detenerse por límites de uso o inactividad. El proyecto debe poder cerrarse y retomarse sin depender de que un proceso siga vivo.

## Flujo de acceso previsto

1. Abrir el repositorio en GitHub.
2. Seleccionar la rama `feature/living-paper-engine-foundation`.
3. Crear/abrir un Codespace desde esa rama.
4. Esperar a que termine la preparación del entorno.
5. Ejecutar el comando documentado para iniciar el servidor de desarrollo.
6. Abrir el puerto publicado desde Safari en el iPad.
7. Trabajar en Studio, revisar la vista previa y guardar cambios en la rama.

Los comandos definitivos, versiones de runtime, dependencias y configuración de puertos se documentarán después de auditar el proyecto y ejecutar el primer arranque real. No se debe inventar un comando de inicio antes de verificar los archivos del repositorio.

## Organización técnica prevista

- `living-paper-engine/`: motor gráfico y pruebas del motor.
- `living-paper-studio/`: futura interfaz web de producción.
- `assistant-bridge/`: futura capa de operaciones estructuradas entre el asistente y Studio.
- `living-paper-player/`: futura aplicación Android de reproducción.
- Documentación del proyecto: decisiones, arquitectura, flujo de producción, entorno, pruebas y exportación.

La creación de carpetas nuevas se hará conforme se implemente cada componente; esta estructura es una orientación y no implica que todos los módulos ya existan.

## Persistencia y continuidad

- Código y documentación: guardar en GitHub, en la rama de trabajo.
- Recursos de producción: definir almacenamiento y versionado apropiados antes de incorporar grandes volúmenes de imágenes/audio al repositorio.
- Estado de cada historia: guardar como proyecto/datos estructurados para poder reabrirlo.
- No depender del historial de una conversación para conservar decisiones técnicas.
- Antes de detener un Codespace: guardar archivos, ejecutar pruebas pertinentes y confirmar los cambios en Git.

## Límites y control de costos

- Usar primero la cuota gratuita disponible en la cuenta.
- Revisar los límites vigentes de cómputo y almacenamiento antes de iniciar sesiones largas.
- Detener o eliminar Codespaces que ya no se necesiten para evitar consumo innecesario.
- Una sesión de Codespaces no es un servidor permanente y puede detenerse por inactividad o límites de duración.
- No habilitar recursos de pago ni aumentar cuotas sin autorización explícita.

## Seguridad

- No guardar claves API, tokens ni contraseñas en el repositorio.
- Usar secretos de Codespaces cuando se autorice conectar servicios externos.
- Mantener los puertos privados salvo que exista una razón concreta para hacerlos públicos.
- Assistant Bridge debe aceptar operaciones tipadas y validadas, con confirmación para acciones sensibles; no ejecutar shell arbitrario a partir de texto del modelo.
