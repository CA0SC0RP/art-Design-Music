# Mountains That Breathe — partitura audiovisual conceptual v0.1

**Estado:** propuesta creativa para revisión del usuario. No aprobada; no representa audio producido, recursos existentes ni una especificación técnica definitiva.

**Alcance:** primera propuesta de relación entre música, ambiente y comportamiento visual para la obra «Mountains That Breathe / Montañas en armonía». Este documento es independiente del contrato v2: no añade campos al esquema ni define un formato de datos para el motor.

## 1. Intención

La escena debe sentirse como un diorama artesanal de papel que respira lentamente. La música acompaña esa sensación y organiza sus cambios de atención sin convertir el cuadro en un visualizador de frecuencias.

La escucha propuesta es contemplativa, cálida y cinematográfica: ambient + lo-fi + chillout. La referencia de tempo existente, aproximadamente 72 BPM, se usa aquí solo para construir una maqueta temporal fácil de revisar.

## 2. Parámetros musicales provisionales

| Parámetro | Propuesta |
|---|---|
| Duración de maqueta | 60 segundos |
| Tempo de referencia | 72 BPM |
| Compás | 4/4 |
| Extensión | 18 compases |
| Carácter | Ambient, lo-fi y chillout cinematográfico |
| Pulso | Suave, sin batería dominante |
| Armonía | Acordes abiertos y cálidos; tonalidad por decidir al componer |
| Textura | Pads aireados, piano íntimo, bajo redondo muy discreto y detalles orgánicos |
| Percusión | Textura ligera y espaciada; puede omitirse si resta serenidad |

A 72 BPM, cada compás de 4/4 dura aproximadamente 3,33 segundos. Los 18 compases forman una maqueta de 60 segundos. La duración y el tempo pueden cambiar al escuchar una composición real.

## 3. Capas musicales sugeridas

- **Cama armónica:** pad cálido y amplio, con cambios lentos y sin ataques bruscos.
- **Motivo principal:** piano suave o instrumento de ataque redondeado, con pocas notas y espacio entre frases.
- **Pulso grave:** bajo cálido y contenido, más sentido que percibido como golpe.
- **Textura rítmica:** percusión lo-fi muy tenue, irregularidad humana y sin transitorios agresivos.
- **Ambiente natural:** agua y aire como textura sonora integrada con discreción; no deben competir con la música.
- **Cola:** reverberación y decaimiento prolongado para que el final no se sienta como un corte.

No se propone una melodía, tonalidad ni grabación final en este documento.

## 4. Recorrido temporal y relación visual

Los tiempos son referencias de composición, no disparadores técnicos ya implementados. Los movimientos visuales indicados son intenciones para revisar contra la imagen maestra y las reconstrucciones disponibles.

| Tiempo | Compases | Música | Intención visual |
|---|---:|---|---|
| 0–10 s | 1–3 | Entrada gradual del pad y ambiente; sin percusión al inicio. | El cuadro aparece en calma. El marco permanece completamente fijo. La niebla puede comenzar un desplazamiento casi imperceptible si la capa y su reconstrucción lo permiten. |
| 10–20 s | 4–6 | Entra el motivo de piano con pocas notas; aparece un pulso grave muy suave. | Se hace perceptible la profundidad: bruma y planos atmosféricos se mueven a ritmos distintos. El río mantiene su ciclo continuo, sin reinicios visibles. |
| 20–30 s | 7–9 | La armonía se abre ligeramente; se incorpora una textura rítmica discreta. | El viento recorre la vegetación en oleadas escalonadas, no de forma simultánea. Las hojas y flores responden con amplitudes pequeñas. |
| 30–40 s | 10–12 | Frase musical central, algo más plena, sin aumentar bruscamente el volumen. | La luz puede variar suavemente si la separación del sol y su resplandor lo permite. Las aves pueden realizar un ciclo breve y natural si existen poses y recursos adecuados. |
| 40–50 s | 13–15 | La instrumentación se retira poco a poco; el motivo principal deja más espacio. | La escena vuelve a una actividad más tranquila. El ciervo puede tener una respiración sutil; no moverlo si el recorte o la reconstrucción no son convincentes. |
| 50–60 s | 16–18 | Resolución armónica y cola larga; retirar el pulso antes del final. | Los movimientos regresan suavemente a su estado de reposo. El agua y la atmósfera pueden continuar en ciclos sin un reinicio perceptible. |

## 5. Inventario inicial de comportamientos y señales musicales

| Elemento | Comportamiento posible | Relación musical propuesta |
|---|---|---|
| Marco ornamental | Fijo, completo y sin desplazamiento | Ninguna. No responde al análisis de audio. |
| Montañas y planos lejanos | Paralaje mínimo, solo si el margen lo permite | Cambios lentos de frase; no seguir cada golpe. |
| Niebla | Deriva continua y variación de opacidad muy leve | Respiración armónica y transiciones entre secciones. |
| Río y cascada | Ciclo continuo, largo y sin saltos | Flujo autónomo; puede ganar o perder algo de presencia en las frases, sin sincronizar cada onda con un golpe. |
| Árboles y vegetación | Balanceo escalonado y diferenciado | Motivo rítmico suave o eventos de frase; nunca todo el bosque al mismo tiempo. |
| Aves | Trayectoria y ciclo de poses/aleteo, si se producen recursos adecuados | Un evento musical puede iniciar una frase de movimiento; el ciclo no debe depender de detectar agudos. |
| Ciervo | Respiración o gesto mínimo, si puede articularse con fidelidad | Frase cálida o pausa musical; evitar movimiento constante. |
| Sol y luz | Variación ambiental muy lenta, si la separación resulta limpia | Apertura armónica; no destellos ni pulsos rápidos. |
| Casa y objetos inertes | Preferentemente quietos | Sin respuesta automática; cualquier movimiento necesitaría justificación y revisión. |

## 6. Sincronización: intención, no mapeo mecánico

La composición debe aportar eventos intencionales (inicio de frase, cambio de sección, acento suave, cierre). El análisis de audio, cuando esté disponible, puede adaptar la intensidad general de movimientos ya autorizados, pero no decidir por sí solo qué objeto se mueve.

Principios para la futura implementación:

1. Los eventos temporizados de la composición determinan cuándo comienza una acción visual concreta.
2. Las señales de audio suavizadas pueden modular ligeramente la intensidad, nunca sustituir la intención musical.
3. No asignar automáticamente graves al río, medios a árboles o agudos a aves.
4. Los movimientos continuos —agua y niebla, por ejemplo— conservan su continuidad aunque no haya análisis de audio.
5. La pérdida o indisponibilidad del análisis musical no debe detener la obra.
6. Ningún evento puede superar el margen seguro ni exponer zonas sin reconstrucción aprobada.
7. El marco y cualquier elemento declarado fijo quedan excluidos de la respuesta musical.

## 7. Límites y dependencias

- La imagen maestra no se modifica.
- No se fijan coordenadas ni amplitudes: deben medirse sobre la maestra original y dependerán de las capas reales.
- No se reutilizan las coordenadas del paquete preliminar v0.1.
- No se declara que existan sprites, ciclos, reconstrucciones o audio final.
- La propuesta no resuelve las incompatibilidades del contrato v2 con sprites, ciclos de agua y eventos musicales. Esas decisiones siguen pendientes.
- Si una zona oculta no puede reconstruirse de forma coherente, se reduce o elimina el movimiento correspondiente y se solicita revisión.
- La duración, el tempo, la instrumentación y todos los comportamientos quedan sujetos a revisión del usuario.

## 8. Revisión solicitada

Revisar especialmente:

1. Si el carácter ambient + lo-fi + chillout representa la primera obra.
2. Si la maqueta de 60 segundos y 72 BPM sirve como punto de partida.
3. Si el recorrido de calma, apertura, actividad sutil y retorno refleja la sensación deseada.
4. Si los comportamientos propuestos respetan la composición y la materialidad artesanal.

**Estado final de esta versión:** propuesta conceptual en revisión. Solo el usuario puede marcarla como aprobada.
