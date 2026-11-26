# King Jackson

Juego de navegador con JavaScript, Phaser 3 / Arcade y Vite. Entrega local de las fases 1 a 8: menú estacional, combate, cuatro niveles, tienda, personajes, configuración y tres idiomas con progreso guardado.

## Nuevo plan de mejoras: fases 1 y 2

Sobre la entrega anterior se ha analizado la estructura existente y renovado el menú: escenario estacional con capas parallax, iluminación, sombras, partículas limitadas, personaje completo en el centro y paneles semitransparentes. Los botones están ordenados como Jugar, Tienda, Skins, Ataques y Configuración. Mantiene mouse, teclado, idiomas, skins, pistas y estadísticas; respeta la preferencia del sistema de reducir movimiento.

Consulta el [nuevo plan adjunto](docs/PLAN_DE_MEJORAS.md), la [auditoría de la fase 1](docs/UPGRADE_PHASE1.md) y los [cambios y validación de la fase 2](docs/UPGRADE_PHASE2.md). Esta entrega conserva los cuatro recorridos actuales; los doce niveles, sus migraciones y los sprites jugables definitivos corresponden a las siguientes fases del nuevo plan. No renumera ni sustituye los documentos de las fases anteriores.

## Ejecutar

Requiere Node.js 22 y npm (o Node.js 20.19+).

```sh
npm install
npm run dev
```

Abre la dirección que imprime Vite. Para producción: `npm run build`; para servir esa compilación: `npm run preview`. Pruebas de movimiento, combate, niveles, compras, personajes, ajustes, idiomas, audio y almacenamiento: `npm test`.

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

- «Jugar» → elige una estación desbloqueada → «Jugar nivel» o Enter.
- Flechas izquierda/derecha o A/D: caminar. Shift: correr.
- Espacio: salta desde el suelo o una plataforma. Vuelve a pulsar Espacio en el aire para hacer un doble salto.
- Flecha abajo o S: agacharse y avanzar despacio. Bajo un techo, permanece agachado hasta tener espacio para levantarse.
- M: Moonwalk de 620 ms hacia atrás sin cambiar la orientación. Recarga de 1,8 s desde la activación; permite esquivar el daño durante el deslizamiento.
- P o botón Pausa: pausar/reanudar. Se pausa automáticamente al perder el foco.
- R: reiniciar el nivel o la práctica con tres vidas. Escape o botón Menú: volver.

El ensayo libre, accesible desde Ataques, cambia el ambiente, traje y pista con la estación del menú. El recorrido de 2700 px incluye plataformas, dos huecos y un puente bajo; una baldosa roja señalizada permite probar daño e invulnerabilidad de 1,3 s. Caer resta una vida y devuelve al inicio. Al perder las vidas del perfil elegido se ofrece reiniciar. Llegar a la bandera muestra «Ensayo completado» sin dar monedas, récords ni desbloquear niveles.

J lanza el sombrero de retorno; K activa el giro; L lanza un copo que congela. El HUD muestra las recargas. Tres muñecos de nieve permiten ensayar impactos y daño. La nieve está habilitada temporalmente en el ensayo; en campaña se desbloquea comprando el copo por 300 monedas. Ataques abre una guía con acceso al ensayo. La tienda y el vestuario están disponibles. Configuración e idiomas están disponibles. Ver `docs/PHASE4.md`.

## Campaña

Primavera introduce saltos sencillos y flores; Verano incorpora plataformas móviles sobre la playa; Otoño tiene enemigos más rápidos en el bosque; Navidad incluye regalos, luces y el Rey de la Nieve. Cada estación tiene recorrido, traje y música propios. Llegar a la bandera gana el nivel; en Navidad es obligatorio derrotar primero al jefe de seis, ocho o diez puntos de vida según dificultad, que dispara copos y acelera sus disparos al perder la mitad de su vida.

Cada moneda recogida vale 10, cada regalo 25 y la primera victoria de cada nivel concede 100 adicionales. El saldo, los mejores tiempos/puntuaciones y el siguiente nivel se guardan al ganar. Perder, reiniciar o salir descarta los objetos del intento. Repetir un nivel permite ganar de nuevo por los objetos recogidos, sin repetir el bono inicial. Si localStorage falla, la pantalla de victoria informa de que el progreso solo está disponible durante la sesión.

## Tienda y vestuario

La tienda ofrece Rojo Thriller (500), Blanco de gala (800), Espíritu navideño (1000), Brillo dorado (2000) y Copo de nieve (300). Selecciona con mouse o ↑/↓ y confirma con el botón o Enter. Una compra de skin añade el artículo al inventario; pulsa de nuevo para equiparlo. La skin sustituye el traje del menú y de cualquier estación sin cambiar sus habilidades. El copo desbloquea L en campaña automáticamente.

«Skins» abre el vestuario para equipar compras o recuperar el traje del personaje (Michael adapta el suyo a la estación). V abre el vestuario desde la tienda; T vuelve a la tienda desde el vestuario y la guía de ataques. La interfaz muestra precio, saldo faltante, propiedad y equipamiento. Si no puede guardar una compra o cambio de vestuario, lo informa y deja el saldo e inventario intactos. Las compras duplicadas nunca cobran de nuevo.

Michael es el personaje jugable. Puedes cambiar su traje desde Skins.

## Configuración

Abre «Configuración» para elegir español, inglés o francés, activar o apagar música, ajustar por separado música y efectos de 0 a 100 y elegir dificultad. Los cambios se guardan automáticamente; si falla el guardado, se mantienen los valores anteriores. El botón «Probar efecto» permite comprobar el canal de sonido aunque la música esté apagada. El atajo S del menú también guarda la preferencia de música.

- Fácil: cuatro vidas, enemigos a ×0,75 y jefe de seis vidas.
- Normal: tres vidas y ritmo original, jefe de ocho vidas.
- Difícil: dos vidas, enemigos a ×1,25 y jefe de diez vidas con disparos más frecuentes.

La dificultad se aplica al siguiente intento y al reinicio, sin cambiar las recompensas ni las habilidades del personaje. Los récords se comparten entre dificultades. Usa mouse o ↑/↓ para elegir controles, ←/→ para ajustar y Enter para activar. La pantalla completa se solicita desde su botón y se puede abandonar desde él o con el control del navegador; no se restaura automáticamente al recargar.

## Arquitectura y contratos

- `src/main.js`: configuración 1280 × 720, ajuste proporcional, Arcade y registro de escenas.
- `src/scenes/`: Boot, menú, dibujo estacional y escenas de destino.
- `src/scenes/GameScene.js`: campaña y práctica, cámara, entrada, pausa y HUD; `LevelManager` construye recorridos, plataformas móviles y objetos.
- `src/entities/Player.js`: sprite Arcade y sincronización de colisión/animación. `playerState.js` contiene las reglas verificables sin navegador; `playerTextures.js` genera y reutiliza los fotogramas de cada traje.
- `src/data/characters.js`: personajes, precios, aspectos y perfiles de movimiento/combate.
- `src/data/levels.js`: identificadores estables 1–4, paleta, traje y pista. `courses.js`: plataformas, huecos, enemigos, monedas, regalos y arena del jefe.
- `src/systems/ProgressManager.js`: guardado versionado, validación, recompensas, récords y desbloqueo secuencial.
- `src/systems/AudioManager.js`: pistas originales estacionales y ganancias independientes de música y efectos, sin grabaciones comerciales.
- `src/systems/SettingsManager.js`, `src/data/settings.js`: preferencias guardadas y perfiles de dificultad.
- `src/data/translations.js`, `src/systems/i18n.js`, `LocalizationPlugin.js`: tres idiomas con plantillas para textos que cambian durante el juego.
- `SnowEnemy`, `Hat` y `CombatSystem`: enemigos, proyectiles y combate; `combatState.js` valida activaciones y recargas. `ShopManager` valida y guarda compras y equipamiento; `appearance.js` resuelve la skin sin cambiar los datos de la estación.
- `src/utils/storage.js`: tolera JSON corrupto, restricciones de almacenamiento y cuota agotada.
- `public/assets/`: reservado para futuros recursos. Los provisionales actuales se dibujan con Phaser Graphics.

`game.registry.get('services')` entrega `{progress, audio, shop, settings}` a todas las escenas. Las escenas no crean servicios globales nuevos. El menú usa `selectedLevel` únicamente para previsualización; `unlockedLevels` restringe la campaña, también al entrar directamente a una escena. Las compras y el equipamiento usan un único punto de validación en ShopManager; el combate se coordina mediante CombatSystem.

## Fases

1. **Base:** package, HTML, estilos, escenas, entidades y servicios. Pruebas automatizadas para guardado; ver `docs/VALIDATION.md` para resultados reales.
2. **Menú:** escenario integrado, traje estacional, iluminación, partículas limitadas y transiciones; navegación por mouse y teclado; audio procedural.
3. **Personaje:** Player Arcade, caminar/correr/saltar/agacharse, animaciones idle/carrera/salto/daño/baile, Moonwalk evasivo, vidas, invulnerabilidad, cámara y pista de ensayo.
4. **Combate:** sombrero de retorno, giro, copos, muñecos de nieve, impactos y recargas; ver `docs/PHASE4.md`.
5. **Niveles:** cuatro recorridos distintos, plataformas móviles, enemigos veloces, monedas, regalos, victoria/derrota y jefe final; ver `docs/PHASE5.md`.
6. **Tienda:** catálogo, validación de compras, nieve desbloqueable, inventario, equipamiento y guardado; ver `docs/PHASE6.md`.
7. **Personajes:** tres personajes comprables con habilidades propias, selección persistente e integración con skins y combate; ver `docs/PHASE7.md`.
8. **Configuración:** español/inglés/francés, volúmenes independientes, dificultad, pantalla completa y preferencias guardadas; ver `docs/PHASE8.md`.
9. Integración y pruebas.
10. Publicación.

Las fases 4 a 8 se guardan en una entrega consolidada en `integration/phases4-8`, integrada en `master` local. Las ramas previas no tenían commits propios. Ver [organización de Git](docs/GIT_WORKFLOW.md) para el estado y el flujo de trabajo; las fases 9 y 10 siguen pendientes.

## Comprobación en navegador

Con `npm run dev` ya sirviendo en el puerto 5173, ejecuta `npm run test:browser` en otra terminal. Requiere Chrome instalado en su ruta estándar de Windows, o `CHROME_PATH` con la ruta al ejecutable. Usa un puerto de depuración local libre y un perfil aislado en `.tools/chrome-phase3-<pid>`; no usa tu perfil personal. No instala dependencias de automatización.

El comprobador envía teclas reales mediante CDP y avanza Phaser a 60 pasos fijos por segundo para evitar las limitaciones de fotogramas del navegador sin ventana. Algunos casos recolocan al jugador para comprobar techos, daño y caídas; no equivalen a una partida completa jugada de principio a fin ni a una medición de rendimiento. Comprueba excepciones del navegador y guarda capturas locales en `.tools/phase3-practice.png`, `.tools/phase5-level-*.png`, `.tools/phase6-shop.png` y `.tools/phase6-wardrobe.png`. También verifica compras con monedas ganadas, fallo de guardado, nieve, equipamiento y persistencia al recargar.

Las pruebas de personajes usan un guardado aislado de 5000 monedas y verifican habilidades con controles reales, selección y persistencia. Capturas en `.tools/phase7-characters.png` y `.tools/phase7-snow-king.png`.

La comprobación incluye idioma de pantallas y HUD, ganancias de audio, fallos de guardado, pantalla completa y las tres dificultades. Captura de ajustes en `.tools/phase8-settings-fr.png`. La calidad auditiva y el rendimiento real requieren revisión manual.
