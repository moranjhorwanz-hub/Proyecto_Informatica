# Fase 3: personaje y pista de práctica

## Archivos

- `src/entities/Player.js`: sprite Arcade, colisión con pies anclados, orientación, animación, daño y reaparición.
- `src/entities/playerState.js`: reglas deterministas de movimiento, recarga e invulnerabilidad.
- `src/entities/playerTextures.js`: fotogramas originales generados una vez por traje para idle, carrera, salto, agachado, Moonwalk y daño.
- `src/scenes/GameScene.js`: ensayo de 2700 px, plataformas, huecos, puente bajo, baldosa de daño, cámara, tres vidas, pausa, reinicio y final informativo.
- `src/scenes/LevelSelectScene.js`: selección del ambiente del ensayo, accesible desde Jugar por mouse o teclado.
- `src/systems/AudioManager.js`: efectos originales de salto, Moonwalk y daño.
- `src/main.js`: export de la instancia; referencia de diagnóstico solo en desarrollo para evitar que el comprobador cree otro juego al importar el módulo con una URL distinta de Vite.
- `MenuScene`, `FeatureScene`, HTML y favicon: estado de la entrega e icono original.
- `tests/playerState.test.js`, `scripts/browser-smoke.mjs`, `package.json`, README y registro de validación: pruebas, comandos y documentación.

## Decisiones

El Moonwalk dura 620 ms, mueve hacia atrás a 300 px/s sin girar, protege del daño durante el deslizamiento y admite una nueva activación a los 1,8 s desde el comienzo. No puede iniciarse en el aire ni agachado. El botón debe soltarse y pulsarse para repetir.

La colisión normal mide 34 × 116 px; agachado, 34 × 70 px. Si un obstáculo ocupa el volumen necesario para levantarse, el personaje permanece agachado al soltar la tecla. Los sprites mantienen escala 1:1 y su animación cambia la postura.

La práctica no escribe monedas, récords ni niveles completados. Se conserva solo la selección del ambiente en el servicio existente. Las vidas pertenecen al intento actual. Una caída resta una vida incluso durante la invulnerabilidad y devuelve al inicio.

Pausa detiene la física y el reloj de movimiento/recargas; Escape permite salir y R permite reiniciar aun con cero vidas. La pérdida de foco pausa y libera las teclas. Al salir se retira el listener de foco; Phaser destruye su mundo físico y lo reconstruye al entrar.

## Límites y siguiente fase

Los gráficos y sonidos siguen siendo provisionales originales. La comprobación automatizada del navegador utiliza pasos fijos, por lo que no acredita 60 FPS en un equipo real. Tampoco sustituye una revisión manual del audio, controles táctiles o tamaños de pantalla diversos.

Siguiente fase: sombrero que regresa, giro, proyectil de nieve y enemigos con patrullaje/daño mediante CombatSystem. Los cuatro niveles finales y su desbloqueo siguen reservados a la fase 5.
