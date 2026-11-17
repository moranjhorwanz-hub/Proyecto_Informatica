# Michael Jackson Adventure

Juego de navegador con JavaScript, Phaser 3 / Arcade y Vite. Entrega local de las fases 1 a 3: menú estacional y pista de práctica jugable. Los cuatro niveles completos, combate, compras y ajustes completos corresponden a fases posteriores.

## Ejecutar

Requiere Node.js 22 y npm (o Node.js 20.19+).

```sh
npm install
npm run dev
```

Abre la dirección que imprime Vite. Para producción: `npm run build`; para servir esa compilación: `npm run preview`. Pruebas de movimiento y almacenamiento: `npm test`.

En este equipo se descargó una copia portátil de Node.js en `.tools/` (ignorada por Git). Si Node no está en PATH, en PowerShell:

```powershell
$env:Path = "$PWD\.tools\node-v22.14.0-win-x64;$env:Path"
npm.cmd run dev
```

## Controles actuales

- Mouse: botones del menú, estaciones y audio.
- Arriba / abajo: elegir opción. Enter: abrir.
- Izquierda / derecha: previsualizar estación y cambiar traje y pista.
- S: alternar música. El audio comienza tras la primera interacción.
- Escape o Enter: volver desde las pantallas informativas.

**En la pista:**

- «Jugar» → elige ambiente → «Entrar a la pista» o Enter.
- Flechas izquierda/derecha o A/D: caminar. Shift: correr.
- Espacio: saltar desde el suelo o una plataforma. No hay doble salto.
- Flecha abajo o S: agacharse y avanzar despacio. Bajo un techo, permanece agachado hasta tener espacio para levantarse.
- M: Moonwalk de 620 ms hacia atrás sin cambiar la orientación. Recarga de 1,8 s desde la activación; permite esquivar el daño durante el deslizamiento.
- P o botón Pausa: pausar/reanudar. Se pausa automáticamente al perder el foco.
- R: reiniciar la práctica con tres vidas. Escape o botón Menú: volver.

Las cuatro estaciones cambian el ambiente, traje y pista del mismo ensayo. El recorrido de 2700 px incluye plataformas, dos huecos y un puente bajo; una baldosa roja señalizada permite probar daño e invulnerabilidad de 1,3 s. Caer resta una vida y devuelve al inicio. Al perder las tres vidas se ofrece reiniciar. Llegar a la bandera muestra «Ensayo completado» sin dar monedas, récords ni desbloquear niveles.

Tienda, skins, personajes, ataques y configuración siguen abriendo pantallas informativas de sus fases futuras.

## Arquitectura y contratos

- `src/main.js`: configuración 1280 × 720, ajuste proporcional, Arcade y registro de escenas.
- `src/scenes/`: Boot, menú, dibujo estacional y escenas de destino.
- `src/scenes/GameScene.js`: pista de práctica, plataformas estáticas, cámara, entrada, pausa y HUD.
- `src/entities/Player.js`: sprite Arcade y sincronización de colisión/animación. `playerState.js` contiene las reglas verificables sin navegador; `playerTextures.js` genera y reutiliza los fotogramas de cada traje.
- `src/data/levels.js`: identificadores estables 1–4, paleta, traje y nombre de pista.
- `src/systems/ProgressManager.js`: guardado versionado, validación y selección de vista previa.
- `src/systems/AudioManager.js`: una sola secuencia Web Audio original a la vez; no utiliza canciones comerciales.
- `SnowEnemy`, `Hat`, `CombatSystem`, `ShopManager`: contratos y constantes para fases futuras.
- `src/utils/storage.js`: tolera JSON corrupto, restricciones de almacenamiento y cuota agotada.
- `public/assets/`: reservado para futuros recursos. Los provisionales actuales se dibujan con Phaser Graphics.

`game.registry.get('services')` entrega `{progress, audio}` a todas las escenas. Las escenas no crean servicios globales nuevos. El menú usa `selectedLevel` únicamente para previsualización; `unlockedLevels` controla el desbloqueo futuro. Las futuras compras deberán usar un único punto de validación en ShopManager; el daño pertenecerá a CombatSystem.

## Fases

1. **Base:** package, HTML, estilos, escenas, entidades y servicios. Pruebas automatizadas para guardado; ver `docs/VALIDATION.md` para resultados reales.
2. **Menú:** escenario integrado, traje estacional, iluminación, partículas limitadas y transiciones; navegación por mouse y teclado; audio procedural.
3. **Personaje:** Player Arcade, caminar/correr/saltar/agacharse, animaciones idle/carrera/salto/daño/baile, Moonwalk evasivo, vidas, invulnerabilidad, cámara y pista de ensayo.
4. **Siguiente:** combate, sombrero y enemigos.
5. Cuatro niveles, desbloqueo y jefe.
6. Tienda, skins y personajes.
7. Ajustes, idiomas y audio completo.
8. Integración del progreso, optimización y publicación.

No se han creado commits ni ramas automáticamente. Las ramas propuestas (`feature/menu`, `feature/player`, etc.) podrán utilizarse cuando haya una base estable confirmada, sin alterar el historial existente.

## Comprobación en navegador

Con `npm run dev` ya sirviendo en el puerto 5173, ejecuta `npm run test:browser` en otra terminal. Requiere Chrome instalado en su ruta estándar de Windows, o `CHROME_PATH` con la ruta al ejecutable. Usa un puerto de depuración local libre y un perfil aislado en `.tools/chrome-phase3-<pid>`; no usa tu perfil personal. No instala dependencias de automatización.

El comprobador envía teclas reales mediante CDP y avanza Phaser a 60 pasos fijos por segundo para evitar las limitaciones de fotogramas del navegador sin ventana. Algunos casos recolocan al jugador para comprobar techos, daño y caídas; no equivalen a una partida completa jugada de principio a fin ni a una medición de rendimiento. Guarda una captura en `.tools/phase3-practice.png` y comprueba excepciones del navegador.
