# Dirección artística y partitura audiovisual — Cuadro Vivo

**Estado:** dirección creativa acordada; propuesta de producción pendiente de revisión visual del usuario. Este documento no significa que existan capas, sprites, música, motor ni animaciones implementadas.

## Principio central

Cuadro Vivo no es una película ni un videojuego de caricaturas. Es una obra audiovisual contemplativa: un cuadro artesanal de papel recortado cuyos elementos tienen movimientos sutiles, diferentes y coordinados musicalmente. La música no es un fondo decorativo; la escena la interpreta.

## Reglas visuales obligatorias

- Todo debe parecer construido con papel: marco de la escena, animales, árboles, hojas, flores, montañas, cielo, sol, agua, niebla, nubes, aves, casas, rocas y efectos atmosféricos.
- Referencia de materialidad: diorama y teatro de papel en capas, con bordes recortados, textura de cartulina, volumen y sombras entre planos. Se puede aprender de la idea artesanal de Tearaway, sin copiar personajes, escenarios ni diseños.
- Calidad objetivo: imagen panorámica 16:9, maestra objetivo de 3840×2160, alta nitidez y detalles legibles en iPad y pantallas OLED/TV. Confirmar dimensiones reales; no asumir que una generación ya es 4K.
- El marco ornamental dorado aprobado permanece completo y fijo. El área exterior detrás del marco debe ser negro OLED puro (#000000), sin una segunda textura o superficie de madera.
- No agregar, eliminar ni cambiar elementos de una composición aprobada sin aprobación explícita del usuario.
- No usar sprites de estética cartoon ni contornos que hagan parecer la obra un videojuego convencional.

## Animación: todo tiene vida, pero nada debe parecer frenético

Cada elemento visible debe tener algún comportamiento sutil, cuando la geometría y la calidad del recurso lo permitan. No todos se mueven al mismo tiempo ni al mismo ritmo.

Posibles familias de movimiento:
- Animales: ciclos de varias poses (respiración, balanceo, pequeños impulsos o saltos rítmicos) adecuados a cada especie; evitar acciones narrativas largas por defecto.
- Árboles y plantas: ramas, hojas, flores y frutos con oscilaciones o secuencias breves.
- Agua: secuencias continuas y largas de río/corriente, ondulaciones, reflejos y cascada; mantener continuidad en los bordes del ciclo.
- Niebla, nubes y humo: capas independientes que se desplazan con velocidades, escalas y fases distintas.
- Aves y murciélagos: ciclos de aleteo y desplazamiento.
- Sol, luna y luz: variaciones ambientales suaves o cambios vinculados a frases musicales.
- Casa, rocas y objetos inertes: movimiento muy limitado y justificado musicalmente; no deben saltar arbitrariamente.
- Marco y fondo OLED: estructura fija; la iluminación del marco puede variar solo si se aprueba y de manera discreta.

Los sprites son hojas/secuencias de poses para animar un objeto; no sustituyen las capas espaciales. Combinar capas de profundidad con sprites y ciclos procedurales según lo que conserve mejor la textura y el encaje.

## Música original y partitura audiovisual

La música se diseña junto con cada cuadro, no se agrega al final. Referencias iniciales del usuario: ambient, lo-fi y chillout; pueden variar entre obras e incorporar downtempo, breakbeat suave, piano, cuerdas, pads, percusión ligera y sonidos naturales según el carácter deseado. No fijar un único género para toda la galería.

Cada obra tendrá una partitura audiovisual que describa:
- tempo, compás, tonalidad/modo cuando aplique, instrumentos, estructura y duración;
- secciones, eventos y marcas temporales;
- qué elemento visual puede responder a cada motivo o señal musical;
- intensidad, amplitud, fase, duración, retorno y límites seguros del movimiento;
- movimientos continuos que no dependan de un golpe puntual y acontecimientos discretos reservados para frases musicales concretas.

Para movimientos exactamente sincronizados, preferir metadatos/eventos temporizados derivados de la composición, complementados por análisis de audio en tiempo real. No depender únicamente de umbrales de graves/agudos ni asignar mecánicamente «bajo = objeto». El análisis en vivo puede adaptar la intensidad; los eventos compuestos aportan intención precisa. Suavizar señales para evitar vibración nerviosa.

## Primer cuadro: «Montañas en armonía» / Mountains That Breathe

- Mantener la escena de montañas, venado, bosque, río/cascada, aves, nubes, niebla, sol y casa si forman parte de la imagen maestra finalmente aprobada.
- Estilo musical de partida: ambient + lo-fi + chillout cinematográfico; tempo tentativo alrededor de 72 BPM, sujeto a composición y revisión. Es una referencia inicial, no una pista creada ni una especificación musical final.
- El río tendrá un ciclo de movimiento continuo; la niebla se moverá en su propio plano; los animales, árboles, aves y luz tendrán ciclos o variaciones propias.
- Exterior del marco negro OLED puro; marco dorado completo y fijo.
- Antes de recortar, aprobar una imagen maestra limpia de la escena. La lámina conceptual con paneles, sprites y texto es referencia de dirección, no la maestra ni un archivo de capas finales.

## Flujo de producción

1. Aprobar la composición maestra limpia.
2. Medir y documentar cada elemento sobre la maestra real; conservar su hash y no modificarla.
3. Decidir qué elementos necesitan capas completas, recortes RGBA, hojas de sprites, secuencias largas (por ejemplo, agua) o una mezcla.
4. Reconstruir las superficies ocultas que puedan quedar expuestas; si la reconstrucción no es coherente, reducir el movimiento o pedir aprobación.
5. Producir recursos y previsualizaciones por separado; comprobar alfa, bordes, coordenadas, sombras y ensamblaje contra la maestra.
6. Diseñar la composición musical y su partitura audiovisual en paralelo con el inventario de movimientos.
7. Entregar a Claude los archivos aprobados y metadatos; Claude implementa la sincronización, los controles, el renderizado y las pruebas.
8. Ningún recurso se marca como aprobado sin aprobación explícita del usuario.

## Próximas obras posibles

Una obra gótica posterior podría mostrar un castillo lejano, árboles oscuros, niebla de papel y murciélagos volando en ciclos, con música ambiental misteriosa. Es una idea futura, no parte del primer cuadro ni una autorización para añadir esos elementos a la escena actual.

## Límites y control de cambios

- ChatGPT: dirección visual, ideas y especificación musical, diseño de recursos, revisión de capas y propuesta de partitura audiovisual.
- Claude: arquitectura, motor, visor, sistema de animación, análisis/sincronización de audio, controles, integración y pruebas técnicas.
- Usuario: aprobación de composiciones, recursos y decisiones creativas importantes.
- No modificar `main`, la imagen maestra ni archivos existentes sin permiso. Trabajar en ramas y verificar cualquier cambio antes de reportarlo.
- Documento de diseño no equivale a implementación. No declarar que hay música, sprites, capas, pruebas o motor hasta que los archivos y resultados estén realmente verificados.
