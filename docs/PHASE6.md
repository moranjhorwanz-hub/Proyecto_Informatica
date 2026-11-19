# Fase 6: tienda, inventario y skins

La tienda usa las monedas ganadas en los niveles de la fase 5. Cada moneda recogida vale 10, cada regalo 25 y la primera victoria de cada estación añade 100. Repetir niveles permite reunir saldo para los artículos más caros. No hay pagos con dinero real.

## Catálogo

| Artículo | Tipo | Precio |
| --- | --- | ---: |
| Rojo Thriller | Skin | 500 |
| Blanco de gala | Skin | 800 |
| Espíritu navideño | Skin | 1000 |
| Brillo dorado | Skin | 2000 |
| Copo de nieve | Ataque | 300 |

Las skins cambian chaqueta, detalles y sombrero, conservando movimiento, colisiones y habilidades. Los personajes adicionales y sus habilidades corresponden a la fase 7; no se venden artículos de personajes que todavía no pueden usarse.

## Uso

- Menú → **Tienda**: selecciona un artículo con mouse o ↑/↓. El panel muestra la vista previa, descripción, precio, saldo faltante y estado del artículo.
- Pulsa el botón de compra o Enter para comprar. Las skins compradas quedan en el inventario; pulsa de nuevo para equiparlas. Una skin ya equipada ofrece entrar a la selección de niveles.
- **Skins** abre el vestuario. Permite equipar una skin comprada, volver al traje automático de cada estación o abrir en tienda una skin todavía no comprada.
- **V** abre el vestuario desde la tienda; **T** abre la tienda desde el vestuario y la guía de ataques. Escape vuelve al menú.
- El copo comprado desbloquea **L** en campaña automáticamente, sin equipamiento. En el ensayo sigue disponible gratuitamente.

La skin equipada sustituye el traje del menú, de la selección de niveles, de campaña y del ensayo. El fondo, pista y recorrido siguen perteneciendo a la estación. Las vistas previas permiten inspeccionar artículos sin equiparlos. El traje predeterminado recupera automáticamente el vestuario propio de cada nivel.

## Compras y guardado

`ShopManager` es el único punto de compra y equipamiento. Los precios proceden del catálogo inmutable. Rechaza artículos desconocidos, saldos inválidos o insuficientes, compras duplicadas y equipamiento de skins no compradas. Comprar un ataque ya desbloqueado desde la interfaz abre sus controles sin cobrar otra vez.

Antes de modificar el estado en memoria, guarda una copia con el nuevo saldo e inventario. Si falla localStorage, no se descuenta dinero, no se desbloquea el artículo y no cambia la skin; la interfaz explica el fallo. Esto también se aplica al equipamiento y al regreso al traje predeterminado.

Se mantiene el formato de guardado v1. Al cargar, se eliminan identificadores desconocidos y duplicados, solo se permite equipar skins compradas y las habilidades se reconstruyen desde el inventario. Los guardados anteriores de niveles conservan saldo, récords y desbloqueos. Una recarga reconstruye correctamente compras, skin y nieve.

## Archivos

- `src/data/shopItems.js`: catálogo, metadatos de vestuario y ataque.
- `src/systems/ShopManager.js`: compras y equipamiento con validación y guardado.
- `src/systems/ProgressManager.js`: carga de inventario y habilidades derivadas.
- `src/entities/appearance.js`, `playerTextures.js`: resolución de vestuario y texturas reutilizables por skin.
- `src/scenes/ShopScene.js`, `CharacterScene.js`: tienda y vestuario con mouse y teclado.
- `src/scenes/MenuScene.js`, `scenery.js`, `LevelSelectScene.js`, `GameScene.js`: apariencia equipada en el menú y el juego.
- `src/scenes/AttacksScene.js`: estado de desbloqueo y acceso a tienda.
- `src/main.js`, `FeatureScene.js`: servicio compartido de tienda y separación de la futura escena de personajes.
- `tests/shop.test.js`, `scripts/browser-smoke.mjs`: reglas de compra, guardado, aspectos e integración real.
- README, PHASE6 y VALIDATION: documentación y resultados.

## Límites

Gráficos originales provisionales y progresión guardada localmente en este navegador, sin cuenta ni sincronización entre dispositivos. Personajes adicionales y configuración completa siguen pendientes. Las pruebas de integración recolocan al jugador para recoger objetos y resolver encuentros; no sustituyen una partida manual continua ni la revisión de audio, dispositivos táctiles o rendimiento real.
