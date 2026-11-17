# Registro de validación

## Fase 8 — 17 de noviembre de 2026

Implementación en `docs/PHASE8.md`, rama `feature/phase8-settings`, conservando el trabajo anterior y sin crear commits.

- `npm test`: 39/39 aprobadas. Se añaden seis pruebas para validación y guardado de preferencias, rollback sin alterar audio, perfiles de dificultad, cobertura de nombres/descripciones en inglés y francés, plantillas de HUD y canales de audio independientes.
- `npm run build`: aprobado, 44 módulos. Se conserva la advertencia por tamaño del paquete de Phaser.
- Chrome sin ventana: aprobado, sin excepciones ni errores de consola. Repite las fases anteriores y verifica acceso a ajustes, ES/EN/FR, textos en francés de tienda/vestuario/personajes/selección/ataques/juego/victoria/derrota, `document.lang`, volúmenes independientes, efectos con música apagada, rollback ante fallo de guardado, entrada/salida real de pantalla completa, vidas y jefe de las tres dificultades, reinicio y preferencias persistidas tras recarga sin perder saldo ni selección.
- Inspección de `.tools/phase8-settings-fr.png`: controles y explicación de dificultad legibles, selección visible, sin recortes. Captura local ignorada por Git.
- Sintaxis de JS/MJS y `git diff --check`: aprobados.

El perfil de Chrome es aislado. Se comprueba el estado del grafo Web Audio, no la calidad auditiva. Las secciones de campaña/personajes mantienen las recolocaciones y guardados de prueba descritos en fases anteriores. No acredita rendimiento, partida manual continua, compatibilidad con todos los navegadores ni controles táctiles. Pantalla completa se solicita por interacción y no se intenta restaurar automáticamente al recargar.

## Fase 7 — 17 de noviembre de 2026

Implementación en `docs/PHASE7.md`, rama `feature/phase7-characters`, conservando el trabajo previo y sin crear commits.

- `npm test`: 33/33 aprobadas. Las siete pruebas nuevas cubren compra y cobro único de personajes, selección con propiedad, vuelta gratuita a Michael, fallo de guardado, JSON de selección/skin/inventario, selección corrupta, perfiles de movimiento y combate, nieve propia frente a comprada y conservación de identidad al equipar skins.
- `npm run build`: aprobado, 40 módulos. Continúa el aviso de tamaño del paquete de Phaser, aproximadamente 1,54 MB (359 KB gzip).
- Chrome sin ventana: aprobado sin excepciones ni errores de consola. Además de la regresión de fases anteriores, compra y selecciona los tres personajes; verifica 380 px/s y salto alto con teclado real, nieve propia sin comprar el copo, congelación de más de 2 s y segunda activación tras 2 s, giro que elimina un enemigo de dos vidas a 115 px, pérdida de vida por caída, reinicio, selección y skin tras recarga completa y regreso a Michael sin cobro.
- Inspección de `.tools/phase7-characters.png` y `.tools/phase7-snow-king.png`: catálogo, precios, habilidades, controles y HUD legibles; accesorios visibles incluso con skin equipada. Capturas locales ignoradas por Git.
- Sintaxis de JS/MJS y `git diff --check`: aprobados.

La sección nueva del navegador utiliza explícitamente un guardado de prueba con 5000 monedas en el perfil aislado; la regresión de tienda anterior sigue obteniendo monedas a través de las victorias y recogidas del juego. Se recolocan jugador y enemigos para aislar encuentros. No acredita una partida manual continua ni rendimiento, audio o soporte táctil. Los gráficos siguen siendo provisionales.

## Fase 6 — 17 de noviembre de 2026

Implementación en `docs/PHASE6.md`, rama `feature/phase6-shop`, conservando el trabajo anterior y sin crear commits.

- `npm test`: 26/26 aprobadas. Las siete pruebas nuevas cubren precio y cobro único, saldo insuficiente o inválido, artículos desconocidos, equipamiento con propiedad, restauración del traje predeterminado, rollback ante fallo/excepción de guardado, JSON de inventario/nieve/skin, carga de compras corruptas y apariencia independiente de la estación.
- `npm run build`: aprobado, 38 módulos. Permanece el aviso de tamaño del paquete de Phaser, aproximadamente 1,53 MB (357 KB gzip).
- Comprobación Chrome sin ventana: aprobada, sin excepciones ni errores de consola. Repite las fases anteriores y prueba saldo insuficiente desde el menú, compra por mouse, fallo de localStorage sin cobro, nieve comprada por 300 monedas y activada con L en campaña, recompensas de repetición sin repetir el bono, compra y equipamiento de Thriller por 500, la misma skin en las cuatro estaciones, recarga completa con inventario/nieve/saldo/skin conservados y restauración del traje de Verano sin perder la compra.
- Inspección de `.tools/phase6-shop.png` y `.tools/phase6-wardrobe.png`: catálogo, saldo, estados, vista previa y controles legibles, sin recortes. Capturas locales ignoradas por Git.
- Sintaxis JS/MJS y `git diff --check`: aprobados.

El navegador usa un perfil aislado y monedas obtenidas mediante las recogidas y victorias reales del juego; se recoloca al jugador para aislar los casos. El fallo de guardado se provoca temporalmente en ese perfil y se retira antes de seguir. No acredita una partida manual completa ni rendimiento, audio o soporte táctil. Los personajes quedan para la fase 7.

## Fase 5 — 17 de noviembre de 2026

Implementación en `docs/PHASE5.md`, rama `feature/phase5-levels`. Conserva los cambios de la fase 4, sin crear commits.

- `npm test`: 19/19 aprobadas. Cobertura de recompensas, bono inicial único, límites de recogidas, resultados inválidos, récords, guardado de las cuatro estaciones, ausencia de un quinto desbloqueo y rechazo de victoria con jefe vivo, sin vidas o por debajo de la meta.
- `npm run build`: aprobado, 35 módulos; permanece el aviso de tamaño del paquete de Phaser (1,52 MB, 355 KB gzip).
- Sintaxis de todos los JS/MJS en src, scripts y tests: aprobada. `git diff --check`: sin errores.
- Chrome sin ventana: aprobado, sin excepciones ni errores de consola. Incluye las pruebas anteriores de movimiento/combate y las de campaña: bloqueo de selección y acceso directo, recogidas por overlap, salto con teclas reales sobre todos los huecos, plataforma móvil con transporte del jugador y pausa, enemigos rápidos, jefe que dispara y cae tras ocho lanzamientos, victoria, saldo y desbloqueos persistidos, derrota sin abonar objetos y reinicio con tres vidas.
- Inspección de capturas de Verano y Navidad: encuadre y HUD legibles, plataforma y decoraciones visibles. Capturas locales de los cuatro recorridos: `.tools/phase5-level-1.png` a `.tools/phase5-level-4.png`, ignoradas por Git.

La prueba ampliada detectó desplazamiento duplicado al viajar sobre una plataforma móvil: se corrigió actualizando únicamente el cuerpo físico antes de que Arcade sincronice el sprite. También se ajustó la prueba de salto para iniciar desde el borde, evitando golpear una plataforma superior al saltar demasiado pronto, y el cálculo esperado de recompensas para incluir monedas recogidas durante esos saltos. La ejecución final de Chrome pasó con esos ajustes. Una ejecución intermedia se interrumpió por recarga de Vite durante una edición y no se contó como aprobada.

Las pruebas recolocan al jugador y a enemigos para aislar huecos, recogidas y encuentros; no constituyen una partida manual continua ni acreditan rendimiento, revisión auditiva o soporte táctil. Los gráficos son provisionales originales. Tienda, equipamiento y personajes adicionales quedan para las fases siguientes.

## Fase 4 — 17 de noviembre de 2026

Implementación detallada en `docs/PHASE4.md`, rama `feature/phase4-combat`.

- `npm test`: 14/14 aprobadas; incluye recargas, límites exactos, permisos de nieve, rechazo durante daño y límite de un sombrero.
- `npm run build`: aprobado, 31 módulos; permanece la advertencia de tamaño del paquete de Phaser (1,51 MB, 351 KB gzip).
- Comprobación Chrome sin ventana: aprobada con teclas reales y física Arcade. Verifica impacto y retorno del sombrero, segundo impacto con nieve, congelación de un enemigo superviviente, giro, recarga, daño por contacto, pausa del reloj y reinicio. Repite movimiento, saltos, Moonwalk, techo, baldosa, caídas, cero vidas, final, cuatro trajes y regreso al menú sin excepciones de navegador.
- Sintaxis JS y `git diff --check`: aprobados.

La prueba detectó un lanzamiento de sombrero demasiado alto para el cuerpo de los muñecos; se ajustó a 60 px sobre los pies y se volvió a ejecutar correctamente. Chrome no respondió al protocolo de depuración dentro del entorno restringido; la ejecución autorizada fuera de esa restricción sí completó las pruebas.

Las pruebas recolocan enemigos y jugador en algunos casos y avanzan la simulación a pasos fijos. No acreditan una partida manual completa, rendimiento real, revisión auditiva ni controles táctiles. La nieve se habilita solo para práctica; compras y progreso permanecen pendientes.

## Fase 1

Creado: index.html, package.json, .gitignore, src/main.js, estilos, todas las escenas solicitadas, entidades con contratos para fases posteriores, sistemas, datos y almacenamiento.

Ejecutado con Node portátil 22.14.0: `node --test` (3 pruebas aprobadas) y `node --check src/main.js` (aprobado). La instalación inicial falló por no existir npm en PATH; la descarga de dependencias requirió acceso de red. La compilación quedó pendiente hasta disponer de dependencias. Se continuó con la fase 2 tras validar los módulos independientes.

## Fase 2

Modificado: MenuScene y registro de escenas en main.js. Añadido scenery.js para ilustraciones originales estacionales. README ampliado con controles, alcance y contratos.

Resultado final: `npm install` completado (0 vulnerabilidades reportadas); `npm run build` aprobado con 23 módulos transformados; `npm test` aprobado (3/3); comprobación de sintaxis de todos los JS aprobada y `git diff --check` sin errores. Vite avisa de un chunk de 1,49 MB (345 KB gzip) por Phaser; no impide compilar. `npm run dev` arrancó en 313 ms en http://127.0.0.1:5173/.

Pendiente de validación interactiva en navegador: encuadre visual, clics, navegación, cambios de estación, restricciones de audio y ausencia de errores en consola. No hay herramienta de control de navegador disponible en esta sesión.

Prueba HTTP del servidor de desarrollo: `/` y `/src/main.js` respondieron 200. Esto verifica que se sirven los archivos, pero no ejecuta Phaser ni sustituye una prueba en navegador.

Las escenas de fases posteriores son pantallas informativas explícitas. Los niveles aún no se juegan. Los gráficos son provisionales vectoriales, no sprites finales ni fondos HD. La música es una secuencia instrumental sencilla original.

## Fase 3 — 17 de noviembre de 2026

Implementación y contratos descritos en `docs/PHASE3.md`. La entrega añade una pista de práctica real; los cuatro niveles finales siguen pendientes.

Ejecutado:

- `npm test`: 11/11 pruebas aprobadas (8 de movimiento/vidas y 3 de almacenamiento).
- `npm run build`: aprobado; 26 módulos. Permanece la advertencia por tamaño del paquete de Phaser, sin impedir compilar.
- Sintaxis de todos los módulos en `src`, `scripts` y `tests`: aprobada; `git diff --check` sin errores.
- Servidor Vite local: arranque correcto en http://127.0.0.1:5173/.
- Comprobación de integración con Chrome sin ventana: aprobada. Teclas reales para menú, selección, caminar, correr, saltar, Moonwalk y recarga; colisión bajo puente y levantarse al salir; baldosa de daño e invulnerabilidad; pausa; caídas hasta cero vidas; reinicio; final de ensayo sin completar niveles; regreso al menú y creación de los cuatro trajes. Sin excepciones ni errores de consola en esos flujos.

Durante la prueba se detectó y corrigió una llamada a `physics.resume()` en el cierre de escena: para ese momento Phaser ya había destruido el mundo. También se corrigió el comprobador para reutilizar la instancia de desarrollo existente y avanzar la simulación a pasos fijos; las primeras comprobaciones no se contaron como aprobadas.

Las pruebas del techo, daño, caídas y final recolocan al personaje. No se ha ejecutado una partida manual completa ni una medición de rendimiento. Revisión auditiva, dispositivos táctiles y matriz de resoluciones quedan pendientes. Capturas de inspección en `.tools/phase3-start.png` y `.tools/phase3-practice.png` (archivos locales ignorados por Git).
