# Matriz independiente de pruebas — Experience/Score V0

**Estado:** propuesta de criterios de aceptación; no ejecutada.  
**Responsable:** ChatGPT Principal  
**Rama:** `colaboracion/canal-entre-ias`  
**Dependencias:** especificación V0 revisada y contrato v2 sin modificaciones.

Esta matriz prepara la revisión del futuro validador lateral. No constituye código de pruebas, no afirma que exista un validador y no autoriza implementarlo todavía.

## A. Integridad de paquete y referencias

| ID | Caso | Entrada/condición | Resultado esperado |
|---|---|---|---|
| PKG-01 | Experiencia válida | Formato/version admitidos y referencia v2 existente | Aceptar |
| PKG-02 | Versión desconocida | `format` no soportado | Error bloqueante |
| PKG-03 | Obra ausente | `workId` o manifiesto no resuelve | Error bloqueante |
| PKG-04 | Capa ausente | `layerId` no existe en v2 | Error bloqueante |
| PKG-05 | Referencia ambigua | Dos recursos resuelven al mismo identificador | Error bloqueante |
| PKG-06 | Diferencia de mayúsculas | Ruta/ID solo coincide ignorando case | Error bloqueante |
| PKG-07 | Traversal | Ruta contiene `..` o sale del paquete | Error bloqueante |
| PKG-08 | Ruta absoluta/remota | Ruta absoluta, URL remota o esquema no permitido | Error bloqueante |
| PKG-09 | Recurso opcional ausente | Audio ausente y modo silencioso permitido | Aceptar escena; diagnóstico informativo |
| PKG-10 | Recurso corrupto | Archivo visual requerido ilegible/hash incorrecto | Bloquear producción; no sustituir por recurso arbitrario |

## B. Grafo de escena y marco

| ID | Caso | Entrada/condición | Resultado esperado |
|---|---|---|---|
| SCN-01 | Escena estática mínima | Una escena con nodos layer existentes | Aceptar |
| SCN-02 | ID duplicado | Dos nodos con el mismo ID | Error bloqueante |
| SCN-03 | Capa duplicada sin regla | Mismo layer enlazado varias veces sin política declarada | Rechazar o exigir semántica explícita |
| SCN-04 | Marco único | Un único nodo de marco válido | Aceptar |
| SCN-05 | Marco duplicado | Dos nodos representan el marco protegido | Error bloqueante |
| SCN-06 | Marco como target | Track/behavior/binding apunta al marco | Error bloqueante |
| SCN-07 | Marco fuera del primer plano | Orden contradice el zIndex protegido | Error bloqueante |
| SCN-08 | Nodo inventa geometría | Experience intenta redefinir placement/size/zIndex | Error bloqueante |
| SCN-09 | Obra sin Experience | Solo existe work v2 válido | Fallback a escena estática compatible |

## C. Canales, análisis y audio

| ID | Caso | Entrada/condición | Resultado esperado |
|---|---|---|---|
| AUD-01 | Canal permitido único | Un canal de cada tipo permitido en una capa | Aceptar si cumple límites |
| AUD-02 | Tipo duplicado | Dos canales bass en la misma capa | Error semántico bloqueante |
| AUD-03 | Tipos distintos | bass y treble en una capa | Aceptar solo si el máximo acumulado es seguro |
| AUD-04 | Banda no reconocida | Banda fuera del vocabulario de la versión | Error bloqueante |
| AUD-05 | Energy derivada | Energy válida según definición V0 sin rango de frecuencias | Aceptar |
| AUD-06 | Energy mal formada | Energy con configuración incompatible con su semántica | Error bloqueante |
| AUD-07 | Análisis ausente | No hay análisis live ni precalculado | Neutralizar modulación; escena continúa |
| AUD-08 | Audio ausente | No existe pista o audioRef es opcional/null | Modo silencioso válido |
| AUD-09 | Hash de análisis distinto | Análisis precalculado corresponde a otra pista | Ignorar/rechazar análisis; no bloquear escena base |
| AUD-10 | Pérdida de audio | Audio falla durante reproducción | Mantener escena; pasar a política silenciosa documentada |

## D. Reloj, clips y eventos

| ID | Caso | Entrada/condición | Resultado esperado |
|---|---|---|---|
| CLK-01 | Inicio | Evaluar en t=0 | Estado inicial determinista |
| CLK-02 | Mitad | Evaluar tiempo intermedio conocido | Valor interpolado reproducible |
| CLK-03 | Fin | Evaluar exactamente duración final | Resultado definido, sin ambigüedad de intervalo |
| CLK-04 | Pause/resume | Pausar y reanudar | No hay salto ni deriva acumulada |
| CLK-05 | Seek | Buscar t=0, t intermedio y final | Estado se reconstruye desde el tiempo absoluto |
| CLK-06 | Repetición | Loop vuelve al inicio | Continuidad según regla declarada |
| CLK-07 | Extremo discontinuo | Último valor difiere del inicial en loop seamless | Error o warning según política explícita; nunca declarar seamless |
| CLK-08 | Audio activo | Posición de audio observada cambia | Playhead se sincroniza conforme a política medida |
| CLK-09 | Audio pausado | Audio pausa | Playhead y escena respetan política común |
| CLK-10 | Modo silencioso | No hay audio | Reloj interno determinista |
| CLK-11 | Evento fuera de rango | Evento termina después de score/timeline | Error bloqueante |
| CLK-12 | Tempo inválido | BPM <= 0 o compás inválido | Error bloqueante |
| CLK-13 | Conversión beat-tiempo | Tempo constante y beat conocido | Conversión determinista a atSec |
| CLK-14 | Keyframe extremo | Keyframe exactamente al final del clip | Evaluación definida por contrato; no perder el endpoint silenciosamente |

## E. Movimiento y seguridad

| ID | Caso | Entrada/condición | Resultado esperado |
|---|---|---|---|
| MOV-01 | Track en capa no móvil | Target estático/frame o sin permiso | Error bloqueante; no animar |
| MOV-02 | Reconstrucción ausente | Movimiento requiere zona reconstruida no aprobada | Error bloqueante |
| MOV-03 | safeBounds excedido | Envolvente calculada sale de safeBounds | Error bloqueante |
| MOV-04 | Transformación acumulada | Tracks/behaviors combinados exceden límites | Error bloqueante |
| MOV-05 | Valores no finitos | NaN o Infinity | Error bloqueante |
| MOV-06 | Valor fuera de rango | Opacity <0 o >1, escala no permitida | Error bloqueante |
| MOV-07 | Solapamiento conflictivo | Dos clips escriben mismo target/property | Error bloqueante en V0 |
| MOV-08 | Behavior desconocido | Behavior/version no registrado | No ejecutar; fallback estático y warning |
| MOV-09 | Código embebido | Script/expresión arbitraria en binding | Error bloqueante |
| MOV-10 | Fondo como target | Ejemplo o manifiesto anima fondo sin permiso explícito | Error bloqueante |
| MOV-11 | Movimiento único autorizado | Una capa móvil aprobada y dentro de límites | Aceptar tras validación completa |

## F. Compatibilidad y no regresión

| ID | Caso | Entrada/condición | Resultado esperado |
|---|---|---|---|
| CMP-01 | Contrato v2 intacto | Comparar hash/esquema v2 antes y después | Sin cambios |
| CMP-02 | Obra v2 sin extensión | Consumidor recibe obra sin Experience/Score | Escena estática compatible |
| CMP-03 | IDs y aprobaciones | Leer y renderizar sin reescribir identificadores/evidencias | Preservación exacta |
| CMP-04 | Coordenadas | No usar coordenadas preliminares v0.1 | No hay coordenadas derivadas de esa fuente |
| CMP-05 | Maestra | Verificar archivo y SHA-256 registrado antes de medir | Hash idéntico; nunca sobrescribir |
| CMP-06 | Recursos provisionales | Fixture con recurso provisional | Visible como provisional; no se presenta como producción |
| CMP-07 | Plataforma | Repetir mediciones en iPad Safari y TCL 55Q650G | Registrar resultados reales; no inferir FPS/memoria |

## G. Criterio de salida para la etapa de especificación

La especificación puede pasar a revisión de aprobación cuando:
1. V0-R1 a V0-R4 estén respondidos y reflejados normativamente.
2. Cada regla semántica tenga al menos un caso válido y un caso inválido cuando corresponda.
3. Los resultados de error, warning y fallback estén diferenciados.
4. Los ejemplos no impliquen permisos de movimiento inexistentes.
5. v2, main, pruebas existentes y recursos artísticos permanezcan intactos.

La preparación de esta matriz no ejecuta ninguna prueba ni autoriza construir motor/visor. La siguiente autorización posible sería crear esquemas laterales y fixtures pequeños, tras aprobación expresa.
