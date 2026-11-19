# Fase 4: combate de práctica

La pista incorpora tres muñecos de nieve con patrullas delimitadas y dos puntos de vida. El contacto resta una vida, respetando la invulnerabilidad y la evasión del Moonwalk. Congelados no se mueven ni causan daño.

- **J:** sombrero de retorno, recarga de 800 ms y un único ejemplar en vuelo. Cada enemigo recibe como máximo un impacto por lanzamiento, también durante el retorno. Regresa después de 400 ms y se retira al alcanzar al jugador o tras 1800 ms.
- **K:** giro de 350 ms con alcance cercano, un impacto por enemigo y recarga de 1500 ms. Anillo visible y cambio de orientación durante el giro.
- **L:** copo que inflige un impacto y congela durante 1800 ms. Recarga de 3000 ms; desaparece al tocar plataformas o tras 1200 ms.

La nieve está habilitada explícitamente para el ensayo sin modificar compras ni progreso. Fuera de este permiso temporal, CombatState exige desbloqueo. No se implementa todavía la tienda ni los niveles finales.

El HUD muestra disponibilidad y recargas. Pausar detiene física y reloj de combate. Caer elimina proyectiles y cancela el giro. Reiniciar reconstruye enemigos, vidas y recargas. Los ataques requieren soltar y volver a pulsar la tecla; no se activan durante daño ni con cero vidas.

## Archivos

- `src/entities/Hat.js` y `SnowEnemy.js`: proyectil y enemigo Arcade.
- `src/systems/CombatSystem.js`: impactos, patrullas, proyectiles y gráficos originales reutilizables.
- `src/systems/combatState.js`: reglas de activación y recarga independientes de Phaser.
- `src/scenes/GameScene.js`: controles, HUD e integración del combate.
- `src/scenes/AttacksScene.js` y `src/main.js`: guía funcional de ataques y acceso al ensayo.
- `src/systems/AudioManager.js`: efectos procedurales de los ataques.
- `tests/combatState.test.js` y `scripts/browser-smoke.mjs`: reglas e integración en Chrome.
- README y registro de validación: alcance y resultados.

## Límites

Gráficos provisionales originales. El ensayo no concede monedas ni completa niveles. El giro muestra un efecto y alterna la orientación del sprite; no utiliza un spritesheet definitivo. Los niveles, obstáculos finales, recompensas y jefe corresponden a la fase 5.
