# Nuevo plan de mejoras — Fase 2: menú y diseño visual

## Resultado

Se renueva el menú existente como una única escena Phaser horizontal 16:9. Fondo, personaje, controles y estadísticas pertenecen al mismo canvas.

- Encabezado con título, estación, subtítulo y saldo.
- Panel semitransparente izquierdo con Jugar, Tienda, Personajes, Skins, Ataques y Configuración, en ese orden.
- Personaje original completo en el centro, con detalles adicionales en chaqueta, rostro, sombrero y calzado, sin alterar proporciones ni sprites de combate.
- Panel derecho con personaje activo, vestuario, dificultad, pista, progreso y mejor tiempo.
- Selector inferior de cuatro estaciones y control de música persistente.
- Botones con foco de teclado, respuesta al cursor y desplazamiento suave del texto; fundido de entrada y respiración del personaje.

Las cuatro ambientaciones tienen cielo degradado, luna, relieve lejano, vegetación intermedia y primer plano. Primavera usa árboles de flor; Verano, palmeras, agua y reflejos; Otoño, colores cálidos y faroles; Navidad, pinos nevados, luces y partículas. Tres capas responden al cursor con intensidades diferentes para producir parallax.

Un escenario central, sombras de bordes suaves, focos y grano fino completan la presentación. Los controles están por encima de los elementos decorativos y el personaje mantiene margen respecto al selector inferior.

## Funciones conservadas

Los destinos de los seis botones son los existentes. Mouse, flechas, Enter y S siguen funcionando. Cambiar de estación actualiza fondo, traje predeterminado y pista; una skin equipada continúa sustituyendo el traje. Al abrir el menú también se sincroniza la música con la estación guardada, incluso después de una recarga.

Saldo, compras, niveles, récords, personaje y preferencias mantienen sus servicios y formato. Las nuevas etiquetas tienen traducción al inglés y francés, y los textos de panel se ajustan después de traducirse. Se respeta `prefers-reduced-motion`: sin parallax, respiración ni partículas animadas cuando está activo.

## Recursos y rendimiento

Arte temporal original dibujado en Phaser y Canvas, coherente con el renderer existente. No se descargan imágenes, se incorporan recursos sin licencia ni se añaden dependencias. No se afirma haber sustituido ya los sprites jugables por recursos HD definitivos: eso corresponde a la fase 3.

Los cuatro cielos de 1280 × 720 y las texturas radiales se generan una vez y se reutilizan. No se procesan píxeles durante update. Hay tres capas de parallax y 26 partículas como máximo. Las escenas destruyen sus objetos/tweens al salir; no se añaden listeners de entrada que sobrevivan al cierre. La memoria nominal de las texturas de fondo tras visitar las cuatro estaciones es de aproximadamente 17 MB RGBA, sin contar copias del navegador ni otros recursos; no equivale a una medición de memoria total.

La geometría explícita del personaje permite comprobar su encuadre, ya que los paths Graphics no definen por sí mismos un rectángulo de layout útil para esa prueba.

## Archivos

- `src/scenes/MenuScene.js`: coordinación del menú y presentación de datos, dividida en métodos.
- `src/ui/menuComponents.js`: texto, paneles y ajuste de etiquetas traducidas.
- `src/visuals/menuBackdrop.js`: fondos, capas, escenario, iluminación y partículas.
- `src/visuals/menuCharacter.js`: presentación y detalles del personaje del menú.
- `src/scenes/scenery.js`: conserva los dibujos existentes y devuelve el contenedor del personaje para reutilizarlo.
- `src/data/translations.js`: nuevas etiquetas del menú.
- `scripts/browser-smoke.mjs`: comprobaciones visuales y navegación actualizada al nuevo orden de botones; helper de clic compartido.
- Plan adjunto, documentos UPGRADE, README y VALIDATION: alcance y resultados.

## Verificación y límites

`npm test`: 39/39 aprobadas. `npm run build`: aprobado. Chrome: los seis accesos por mouse, selección de cuatro estaciones con traje/pista, encuadre completo, reutilización de texturas, límite de partículas, proporción 16:9 en 960 × 540, 1440 × 900 y 800 × 1000, etiquetas en tres idiomas y reducción de movimiento. También pasó la regresión de combate, niveles, economía, personajes, idiomas, audio, pantalla completa y dificultad, sin excepciones ni errores de consola.

Capturas locales ignoradas por Git: `.tools/upgrade-menu-1.png` a `upgrade-menu-4.png` y `upgrade-menu-es.png`, `upgrade-menu-en.png`, `upgrade-menu-fr.png`. La inspección de capturas motivó elevar ligeramente el personaje para evitar contacto entre los zapatos y el selector.

Las pruebas usan simulación fija y no acreditan 60 FPS reales en un equipo de 8 GB, una revisión auditiva ni controles táctiles. Siguen pendientes las fases 3–8 del nuevo plan: sprites definitivos, doce niveles con migración de progreso, enemigos adicionales, renovación de tienda, sonido y revisión general.
