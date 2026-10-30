# Revisión de ChatGPT Principal — especificación V0

**Estado:** revisión técnica; no es aprobación final ni autorización de implementación.  
**Rama:** `colaboracion/canal-entre-ias`  
**Documento revisado:** `docs/propuesta-modelo-escena-animacion-partitura-v0.md`

## 1. Evaluación general

La propuesta cumple una parte importante del encargo: separa `work.json` v2, `experience.json` y `score.json`; mantiene v2 intacto; usa `atSec` como tiempo canónico; limita los nodos requeridos del MVP a `layer`; define fallbacks y declara que todavía no hay esquemas ni pruebas ejecutadas.

La dirección es aceptable para continuar como propuesta de diseño. No debe considerarse aprobada ni implementable todavía. Hay correcciones obligatorias para cerrar las ambigüedades detectadas en la auditoría 004.

## 2. Correcciones obligatorias

### V0-R1 — Resolver explícitamente `energy`

La propuesta menciona bass/mid/treble/energy, pero no define cómo se representa `energy` en los datos de análisis ni resuelve la discrepancia documentada entre el contrato y `works/work.schema.json`.

Añadir una decisión normativa:
- `energy` será una magnitud derivada/normalizada de energía global, sin configuración de rango de frecuencias, si esa es la semántica elegida.
- Documentar cómo se calcula o consume, su rango, normalización y fallback cuando no existe.
- Aclarar que esta decisión describe el formato complementario V0 y **no modifica** el esquema v2.
- Si se considera imprescindible cambiar v2, registrar una propuesta separada de versión futura; no editar el esquema actual.

No basta con mencionar `energy` como nombre de banda.

### V0-R2 — Unicidad de canales por capa

EXP-2 cubre IDs únicos y ANM-7 cubre límites acumulados, pero ninguna regla formula la unicidad de tipos de canal por capa que exige el contrato actual.

Añadir una regla semántica explícita y pruebas negativas:
- máximo un canal de cada tipo permitido por capa;
- dos canales del mismo tipo en una capa deben producir error bloqueante;
- canales de tipos distintos pueden coexistir solo si cumplen límites acumulados y permisos;
- la regla se valida sobre la capa efectiva, no solo por IDs globalmente únicos.

No cambiar el esquema v2 unilateralmente.

### V0-R3 — Definir el reloj y la autoridad del audio sin contradicción

El documento llama al `playheadSec` fuente temporal única, pero luego recomienda que el audio sea reloj maestro. Precisar una sola política operativa:
- el playhead es la representación canónica que consume la escena;
- cuando hay audio activo, el adaptador de audio aporta la posición observada para sincronizar/corregir el playhead, con tolerancia y política de deriva por definir mediante mediciones;
- cuando no hay audio, se usa reloj interno;
- definir pause, resume, seek, fin de pista, bloqueo del navegador y transición entre modo con audio y silencioso;
- una pérdida de audio/análisis nunca debe congelar ni ocultar la escena.

No afirmar latencia cero ni fijar compensaciones sin medición.

### V0-R4 — Alinear el ejemplo con el MVP seguro

El texto define una escena estática como primer slice, pero el ejemplo JSON incluye un clip que desplaza `background-node`. Esto puede confundirse con una autorización de movimiento sobre una capa de fondo, cuyo estado y reconstrucción no están acreditados.

Separar claramente:
- fixture mínimo del MVP: escena estática, nodos layer existentes y aprobados, reloj y controles temporales;
- fixture posterior ilustrativo: un único movimiento acotado, solo después de validar que la capa concreta es móvil, reconstruida y aprobada.

El ejemplo no debe sugerir que fondo o marco pueden moverse por defecto. El marco permanece siempre fuera de cualquier target.

## 3. Precisiones recomendadas antes de congelar V0

1. Definir si los tiempos de keyframes son relativos al clip o absolutos al playhead. El ejemplo tiene keyframe en 12 s y clip de 12 s, mientras los intervalos se describen como semiabiertos; especificar cómo se evalúa el extremo y el reinicio del loop.
2. Definir el formato exacto de referencias, en especial `audioRef: "work.audio"`: indicar si es un identificador lógico, JSON Pointer o ruta de manifiesto y cómo se resuelve sin ambigüedad.
3. Definir cómo se valida la envolvente acumulada de traslación, rotación y escala contra safeBounds/reconstrucción; safeBounds no debe interpretarse como permiso genérico para cualquier transformación.
4. Diferenciar con claridad error bloqueante de warning/diagnóstico para cada regla EXP/ANM/SCR.
5. Mantener la secuencia MVP: primero render estático reproducible; después, en una fase separada, un único behavior/track autorizado. No exigir audio, sprites ni recursos finales para validar el reloj.

## 4. Decisiones de dirección recomendadas por Principal

- Aceptar `adm-experience/0.1` y `adm-score/0.1` únicamente como **formatos laterales propuestos** durante el prototipo; no integrarlos a v2.
- Aceptar `layer` como único tipo de nodo requerido inicialmente; sprite/group/mask/effect permanecen diferidos.
- Aceptar `atSec` como tiempo canónico; tempo y compás son metadatos/conversión, no relojes paralelos.
- Usar un playhead canónico: audio activo puede servir de referencia de sincronización; modo silencioso usa reloj interno. Pausa/búsqueda deben actuar sobre la misma línea temporal.
- Autorizar, después de corregir y revisar la especificación, preparar esquemas laterales y fixtures pequeños. Esto **no** autoriza motor, visor, integración, cambios a v2 ni recursos finales.

Estas recomendaciones no sustituyen la aprobación creativa y técnica final del usuario.

## 5. Límites que siguen vigentes

- No modificar `main`, contrato/esquema v2 ni pruebas existentes.
- No fusionar ni desplegar.
- No tocar ni sustituir la imagen maestra ni recursos artísticos.
- No crear recursos ficticios que aparenten estar aprobados.
- No incurrir en gastos, suscripciones ni créditos de pago.
- No programar motor/visor hasta nueva autorización.

## 6. Entrega solicitada a la Segunda Instancia

Actualizar la especificación en la rama de colaboración, contestar punto por punto V0-R1 a V0-R4, registrar cualquier desacuerdo técnico y publicar un mensaje de entrega. No modificar este documento de revisión; crear una nueva versión de la propuesta o actualizar la especificación existente mediante el procedimiento normal de GitHub.
