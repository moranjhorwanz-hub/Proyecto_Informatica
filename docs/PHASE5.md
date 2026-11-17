# Fase 5: cuatro estaciones y jefe final

## Recorridos

Los datos de `src/data/courses.js` definen recorridos independientes, con siete monedas cada uno:

| Estación | Anchura | Particularidad | Regalos |
| --- | ---: | --- | ---: |
| Primavera | 3000 px | Flores, plataformas opcionales y dos huecos | 2 |
| Verano | 3400 px | Playa, tres huecos y dos plataformas móviles | 2 |
| Otoño | 3600 px | Bosque, tres huecos y enemigos de 120 px/s | 2 |
| Navidad | 4000 px | Nieve, luces, regalos y arena del jefe | 3 |

Cada estación conserva su fondo, traje y pista procedural original. Las decoraciones del recorrido se dibujan en coordenadas del mundo, además del paisaje fijo. Los gráficos siguen siendo provisionales originales, no recursos HD definitivos.

`LevelManager` construye plataformas, obstáculos, objetos y meta; conecta colisiones y recogidas. Las plataformas móviles emplean el reloj de juego y trasladan al jugador apoyado sobre ellas. Pausar detiene su movimiento.

## Victoria, derrota y progreso

Jugar abre la selección de campaña. Primavera comienza disponible; cada victoria abre la siguiente estación. Tanto la selección como GameScene rechazan niveles bloqueados. La vista previa del menú permite seguir viendo cualquier estación.

Llegar a la bandera con vidas completa el nivel. En Navidad, el Rey de la Nieve debe estar derrotado. El jefe tiene ocho vidas, patrulla, lanza copos al acercarse el jugador y dispara más rápido con cuatro vidas o menos. Sus golpes tienen 450 ms de invulnerabilidad; la congelación se limita a 600 ms. El sombrero y el giro permiten vencer sin comprar habilidades.

La victoria abona 10 monedas por moneda recogida, 25 por regalo y 100 adicionales solo en la primera victoria. Registra el menor tiempo y la mejor puntuación por objetos. Repetir niveles permite volver a ganar por los objetos, pero no repite el bono. El guardado v1 conserva y valida saldo, niveles y récords; reconstruye los desbloqueos asociados a victorias guardadas. La pantalla avisa si falla localStorage, conservando el progreso en memoria.

Una caída resta una vida, devuelve al inicio y elimina los proyectiles del jugador. Los objetos ya recogidos permanecen contados durante ese intento. Perder las tres vidas abre GameOver; reiniciar, perder o salir no paga las recogidas del intento. Victoria y derrota ofrecen controles de teclado y botones para continuar, repetir, elegir nivel o volver al menú.

Ataques mantiene acceso al ensayo libre de la fase 4: no concede recompensas ni desbloqueos y permite probar la nieve. En campaña la nieve permanece bloqueada hasta la tienda de la fase 6.

## Archivos

- `src/data/courses.js`: recorridos y distribución de contenido.
- `src/systems/LevelManager.js`: construcción, objetos y plataformas móviles.
- `src/entities/SnowBoss.js`: jefe, proyectiles, fases e impactos.
- `src/entities/SnowEnemy.js`, `src/systems/CombatSystem.js`: velocidad por estación y jefe integrado en los ataques existentes.
- `src/scenes/GameScene.js`: campaña/práctica, objetivos, HUD y fin de intento.
- `src/scenes/LevelSelectScene.js`: selección y bloqueos.
- `src/scenes/ResultScene.js`, `VictoryScene.js`, `GameOverScene.js`: resultados y navegación.
- `src/scenes/MenuScene.js`: identificación de la entrega.
- `src/systems/ProgressManager.js`: liquidación, desbloqueos, récords y carga.
- `tests/levels.test.js`, `tests/progress.test.js`, `scripts/browser-smoke.mjs`: validación de reglas e integración.
- README, PHASE5 y VALIDATION: documentación.

## Límites

No incluye tienda, equipamiento ni personajes adicionales. El saldo queda preparado para la fase 6. La validación automatizada de navegador recoloca al jugador para aislar encuentros y huecos; no sustituye una partida manual completa, revisión auditiva, medición de rendimiento ni pruebas en dispositivos táctiles.
