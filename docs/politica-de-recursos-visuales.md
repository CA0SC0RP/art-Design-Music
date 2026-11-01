# Política de recursos visuales

## Objetivo
Producir obras de papel recortado y sus animaciones sin depender de generar cada elemento mediante una IA ni de comprar paquetes de imágenes continuamente.

## Fuentes permitidas
1. **Recursos propios:** ilustraciones, fotografías, SVG, PNG y audio creados para el proyecto.
2. **Recursos del usuario:** archivos aportados por el usuario, siempre que tenga derechos suficientes para el uso previsto.
3. **Bibliotecas externas:** recursos con licencia que permita expresamente el uso previsto (incluidos, cuando corresponda, modificación, uso comercial y redistribución dentro de la aplicación).
4. **Generación asistida por IA:** solo para elementos seleccionados que realmente lo necesiten; no se presupone una cuota ilimitada ni se usa como fuente obligatoria de cada sprite.

## Registro obligatorio por recurso externo
Antes de integrar un archivo externo se registrará:
- nombre del recurso y autor;
- URL de la página original, no solo del archivo descargado;
- licencia exacta y versión, o términos aplicables;
- fecha de consulta/descarga;
- atribución requerida;
- modificaciones realizadas;
- ubicación dentro del repositorio.

No integrar recursos cuya licencia sea desconocida, ambigua o incompatible con el uso planeado. No asumir que «gratis», «descargable» o «sin marca de agua» significa libre de derechos. Evitar recursos marcados como editorial-only, non-commercial, no-derivatives o con restricciones que impidan el producto previsto.

## Capas y sprites: flujo de producción
- **Capa:** un archivo independiente, normalmente PNG con transparencia o SVG, con un objeto o plano coherente. No se aplana toda la escena si luego debe moverse por separado.
- **Sprite individual:** un archivo con transparencia que representa un objeto o personaje. Se anima por transformaciones, recortes o cambios de pose.
- **Hoja de sprites:** una imagen que contiene varios cuadros de una misma animación en una cuadrícula o tira. Se usa solo cuando los cuadros comparten dimensiones y el orden está documentado. El motor recorta cada cuadro por coordenadas; no se usa una hoja como fondo plano.
- **Secuencia de poses:** archivos individuales numerados cuando facilita la edición o cuando los cuadros tienen tamaños distintos.
- **Animación procedural:** movimiento generado por código (balanceo, oscilación, desplazamiento, deformación o partículas) cuando no hace falta dibujar cada fotograma.

## Separación y preparación
Si el usuario aporta una ilustración completa, primero se comprueba que tenga resolución y derechos adecuados. Después se decide si puede separarse en capas. Al extraer un objeto se debe reconstruir el fondo que queda detrás; no basta con borrar el objeto y dejar un hueco. El resultado se revisa sobre el fondo original y en movimiento.

Para sprites de animales o aves, una hoja de poses solo se recorta si cada celda está bien definida. Para movimientos sencillos puede bastar un sprite único más rotación/traslación; para acciones orgánicas se preparan varias poses o secuencias.

## Prototipos
Los prototipos pueden usar formas vectoriales originales y temporales creadas expresamente para probar la tecnología. Deben etiquetarse como provisionales y mantenerse separados de la obra final. No se copiarán recursos de terceros sin verificar la licencia.

## Regla de costos
No comprar recursos, contratar servicios ni iniciar gastos de generación sin autorización explícita del usuario. Priorizar recursos propios, bibliotecas de licencia clara y reutilización legal de componentes.
