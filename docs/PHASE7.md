# Fase 7: personajes y habilidades

## Personajes

| Personaje | Precio | Habilidad |
| --- | ---: | --- |
| Michael | Gratis | Perfil equilibrado: carrera de 340 px/s y salto de -570 px/s. |
| Bailarín navideño | 700 | Carrera de 380 px/s con Shift y salto de -650 px/s con Espacio. |
| Rey de la Nieve | 1200 | Nieve propia con L: congela 2,4 s y recarga en 2 s, sin comprar el copo. |
| Bailarín dorado | 1500 | Giro con K de 125 px, dos puntos de daño y recarga de 1,2 s. |

Todos conservan tres vidas, colisiones, agachado, Moonwalk, sombrero y el resto de los controles. El jefe mantiene su límite de congelación de 0,6 s e invulnerabilidad de 450 ms entre ataques. El giro dorado inflige dos puntos por enemigo y activación, sin multiplicar los impactos por fotograma.

Los aspectos originales provisionales distinguen a los personajes por paleta, rostro, cabello y accesorios: bufanda, corona o gafas. Comparten proporciones para conservar la geometría de los niveles.

## Selección y compras

**Personajes** abre la selección desde el menú; **C** permite abrirla desde la tienda o el vestuario. Cada fila muestra precio o propiedad, descripción de habilidades y vista previa del aspecto original.

Mouse o ↑/↓ seleccionan una fila. El botón principal o Enter compra un personaje bloqueado; una segunda activación lo selecciona. Un personaje ya seleccionado permite abrir los niveles. **V** abre vestuario, **T** tienda y Escape vuelve al menú. No hay botones de personajes futuros sin implementar.

Las compras y la selección pasan por ShopManager: saldo validado, sin duplicados, propiedad obligatoria y guardado antes de cambiar el estado en memoria. Un fallo de guardado no cobra ni aplica selección. Michael siempre está disponible y volver a él no cuesta monedas. Comprar no selecciona automáticamente.

## Habilidades y apariencia

El perfil seleccionado se aplica al crear el jugador y el sistema de combate, tanto en campaña como en ensayo. El reinicio conserva la selección y vuelve a crear el intento con tres vidas. Pausa y recargas siguen usando el reloj de juego existente.

Las skins cambian el vestuario y conservan identidad y habilidades del personaje. Las texturas se reutilizan por combinación de personaje y skin. Desactivar la skin recupera el aspecto original del personaje; Michael recupera el traje de la estación. Fondos, música y recorridos no cambian al seleccionar personaje.

La nieve propia del Rey solo está disponible al seleccionarlo. Cambiar a otro personaje no conserva esa habilidad, salvo que se haya comprado el copo como artículo independiente. Comprar o seleccionar al Rey no añade una habilidad global al guardado. El HUD identifica al personaje y muestra sus recargas; la guía Ataques presenta los valores correspondientes al seleccionado.

## Persistencia

Se conserva el formato v1. La carga acepta solo personajes conocidos y comprados, con excepción de Michael gratuito. Una selección desconocida o no comprada vuelve a Michael. Saldo, inventario, skin, niveles y récords anteriores se conservan. La selección sobrevive al regreso al menú y a una recarga completa.

## Archivos

- `src/data/characters.js`, `shopItems.js`: perfiles, precios y catálogo compartido.
- `src/systems/ShopManager.js`, `ProgressManager.js`: selección guardada y validación al cargar.
- `src/scenes/CharactersScene.js`, `ShopScene.js`, `main.js`: selección funcional y navegación de tienda/vestuario.
- `src/entities/appearance.js`, `playerTextures.js`, `src/scenes/scenery.js`: apariencia y accesorios, sin perder identidad al equipar skins.
- `src/entities/Player.js`, `playerState.js`: estadísticas de movimiento del personaje.
- `src/systems/CombatSystem.js`, `combatState.js`, `src/entities/SnowEnemy.js`, `SnowBoss.js`: perfiles de combate, recargas y daño por ataque.
- `src/scenes/GameScene.js`, `MenuScene.js`, `AttacksScene.js`: personaje activo, HUD y guía.
- `tests/characters.test.js`, `scripts/browser-smoke.mjs`: reglas e integración.
- README, PHASE7 y VALIDATION: alcance y resultados.

## Límites

Los gráficos siguen siendo originales provisionales, con animaciones y proporciones compartidas. Las pruebas automatizadas de personajes usan un guardado aislado de 5000 monedas para no exigir repetir decenas de niveles; no modifican el perfil real del usuario. No sustituyen una partida manual completa, revisión auditiva, pruebas táctiles ni medición de rendimiento. Configuración e idiomas corresponden a la fase 8.
