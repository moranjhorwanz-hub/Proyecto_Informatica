# Fase 8: configuración, idiomas y audio

## Ajustes

Configuración abre una pantalla funcional con mouse y teclado:

- Español, inglés y francés. El idioma cambia inmediatamente en los ajustes y se aplica a menú, niveles, tienda, inventario, personajes, guía de ataques, HUD, mensajes y resultados. Los nombres propios y títulos de pistas originales se conservan.
- Música activada/desactivada y volumen de música de 0 a 100.
- Volumen independiente de efectos de 0 a 100 y botón para probar un sonido.
- Dificultad fácil, normal y difícil, aplicada al siguiente intento.
- Pantalla completa con botón para entrar y salir, y mensajes cuando no está disponible o falla.

↑/↓ elige una fila; ←/→ ajusta el valor; Enter activa la opción y Escape vuelve al menú. Los botones +/− cambian diez puntos de volumen y respetan los límites 0–100. Los botones de idioma y dificultad muestran la opción seleccionada.

Los cambios de idioma, música, volúmenes y dificultad se guardan automáticamente antes de aplicarse. Si falla el almacenamiento, la pantalla lo informa y conserva las preferencias anteriores. El atajo S y el botón de música del menú también guardan la preferencia y muestran un error si no pueden hacerlo.

La pantalla completa representa un estado de la ventana, no una preferencia que pueda restaurarse sin permiso. Se solicita desde una interacción explícita del usuario, se refleja su entrada/salida y no se activa automáticamente al recargar.

## Dificultad

| Perfil | Vidas | Invulnerabilidad | Velocidad de enemigos | Vida del jefe | Intervalo de disparos |
| --- | ---: | ---: | ---: | ---: | ---: |
| Fácil | 4 | 1,6 s | ×0,75 | 6 | ×1,25 |
| Normal | 3 | 1,3 s | ×1 | 8 | ×1 |
| Difícil | 2 | 1 s | ×1,25 | 10 | ×0,8 |

El jefe acelera sus disparos al perder la mitad de su vida. El límite de congelación del jefe sigue siendo 0,6 s. Los perfiles no alteran precios, recompensas, geometría ni habilidades del personaje. Los récords existentes siguen siendo compartidos entre dificultades. Campaña y ensayo usan el perfil elegido; reiniciar conserva la dificultad y restaura sus vidas iniciales. El HUD muestra el perfil y admite cuatro corazones sin valores negativos.

## Audio

AudioManager crea una única secuencia musical procedural original para cada estación. Dos nodos de ganancia independientes controlan música y efectos; apagar música no corta efectos activos ni impide nuevos sonidos. Un volumen de efectos de cero no crea voces nuevas. Cambiar la pista sustituye solo las voces de música y mantiene los efectos independientes.

El audio comienza después de la primera interacción con el juego por las restricciones normales del navegador. Las preferencias se cargan antes de crear AudioContext para evitar reproducir a un volumen predeterminado distinto del guardado. No se incluyen grabaciones comerciales.

## Idiomas y persistencia

El catálogo español/inglés/francés contiene frases, descripciones de artículos/personajes y plantillas para cifras variables. Un adaptador de texto por escena aplica las traducciones tanto a textos iniciales como a actualizaciones del HUD, sin modificar los prototipos de Phaser. El atributo `lang` del documento refleja la selección.

El guardado mantiene la versión 1. Cada ajuste se valida de forma independiente al cargar: idiomas desconocidos, volúmenes fuera de rango o de tipo incorrecto y dificultades inválidas recuperan sus valores predeterminados. Compras, selección, skin, saldo, niveles y récords se mantienen intactos.

## Archivos

- `src/data/settings.js`: preferencias válidas y perfiles de dificultad.
- `src/systems/SettingsManager.js`, `ProgressManager.js`: actualización y carga de preferencias.
- `src/data/translations.js`, `src/systems/i18n.js`, `LocalizationPlugin.js`: catálogo, plantillas y adaptador de escena.
- `src/scenes/SettingsScene.js`: controles, mensajes y eventos de pantalla completa.
- `src/systems/AudioManager.js`: canales independientes, volúmenes y pistas estacionales.
- `src/main.js`, `src/scenes/MenuScene.js`: servicios, idioma y atajos persistentes.
- `src/entities/Player.js`, `src/scenes/GameScene.js`, `src/systems/CombatSystem.js`, `src/entities/SnowBoss.js`: dificultad aplicada a vidas, invulnerabilidad, enemigos y jefe.
- `src/scenes/ResultScene.js`, `src/data/characters.js`: mensajes que no presuponen tres vidas.
- `tests/settings.test.js`, `scripts/browser-smoke.mjs`: reglas, localización, audio e integración.
- README, PHASE8 y VALIDATION: alcance y validación.

## Límites

Las pruebas de audio comprueban el grafo y sus ganancias, no una revisión auditiva. Las pruebas de navegador usan Chrome sin ventana y pasos fijos, con recolocación de jugador/enemigos en algunos casos. No sustituyen una partida manual completa, una matriz de navegadores/resoluciones, dispositivos táctiles o medición de rendimiento. Los gráficos continúan siendo provisionales originales. La integración general y publicación corresponden a las fases 9 y 10.
