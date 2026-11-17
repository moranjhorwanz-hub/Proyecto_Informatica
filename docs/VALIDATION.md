# Registro de validación

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
