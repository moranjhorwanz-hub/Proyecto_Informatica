# Nuevo plan de mejoras — Fase 1: análisis y organización

Este documento corresponde al nuevo `PLAN_DE_MEJORAS.md`, no renumera las fases 1–8 del plan anterior. Se parte de la entrega integrada `e28fa63`, con directorio de trabajo limpio, en la rama `feature/upgrade-menu-visuals`.

## Inventario y arquitectura existente

Se inventariaron y leyeron los 63 archivos propios versionados: código, pruebas, scripts, configuración, recursos originales y documentación. `node_modules`, `.tools` y `dist` son dependencias, herramientas locales y salida generada; no son fuentes que deban reescribirse ni editarse para cambiar el juego.

| Área | Estado encontrado |
| --- | --- |
| Motor y construcción | JavaScript ES modules, Phaser 3.90 / Arcade Physics, Vite 6.4.6 según lockfile, canvas lógico de 1280 × 720 con Scale.FIT. |
| Escenas | Boot, menú, selección de niveles, juego, tienda, vestuario, personajes, ataques, ajustes, victoria y derrota; existe además una escena informativa reutilizable. |
| Jugador | Movimiento, carrera, salto, agachado, Moonwalk, vidas, daño, animaciones, skins y perfiles de personaje. |
| Niveles | Cuatro recorridos diferenciados, plataformas móviles, obstáculos, monedas, regalos y jefe navideño. |
| Combate | Sombrero de retorno, giro, nieve, invulnerabilidad, recargas, patrullas y jefe con proyectiles. |
| Economía | Recompensas por victoria, saldo, compras sin duplicados, inventario y equipamiento guardado. |
| Personajes | Michael y tres personajes comprables con habilidades propias. |
| Configuración | Español, inglés y francés; canales de audio independientes; dificultad y pantalla completa. |
| Guardado | localStorage v1 validado; servicios de progreso, tienda y ajustes compartidos desde registry. |
| Recursos | Dibujos originales procedurales con Phaser Graphics y pistas Web Audio originales, sin recursos comerciales. |
| Verificación | 39 pruebas Node y comprobador CDP en Chrome con perfil aislado. |

## Decisiones de organización

Se conserva la entrada de Vite, el registro de escenas, los contratos de entidades/sistemas, la API de guardado y los datos de contenido. La presentación del menú se separa en módulos pequeños: `src/ui/menuComponents.js` y `src/visuals/menuBackdrop.js` / `menuCharacter.js`. MenuScene queda como coordinador de navegación, selección y datos; no replica las reglas de compras ni de combate.

El dibujo anterior de escenario y personaje permanece exportado desde `scenery.js`; la pista de juego sigue usando su paisaje existente. El nuevo personaje de menú reutiliza el dibujante y el resolver de apariencia, manteniendo las skins y accesorios. No se elimina ninguna función del juego ni se añade backend o dependencia.

## Riesgos y trabajo posterior identificado

- Los identificadores de niveles y varias validaciones están limitados a 1–4. Introducir doce niveles exige diseñar una migración explícita de guardados y separar mundo/nivel antes de modificar esos límites. Esta entrega no simula doce niveles ni reasigna silenciosamente el progreso.
- Los sprites jugables de 96 × 144 y sus animaciones son provisionales. Su renovación corresponde a la fase 3 del nuevo plan.
- Enemigos voladores, variantes adicionales y mejoras de inteligencia corresponden a su fase 5.
- Hay una pista por estación, pero aún no una pista de jefe separada ni transiciones musicales completas; corresponde a la fase 7.
- El comprobador de navegador ha crecido con las fases anteriores. Se conserva como regresión y se amplía solo donde cambió el menú; puede separarse por suites en la fase de pruebas del nuevo plan.
- El paquete grande de Phaser ya produce una advertencia de Vite. No es un error de compilación; su partición y el rendimiento real requieren mediciones posteriores.

## Validación de la fase 1

Antes de modificar la presentación: `npm test`, 39/39 aprobadas; `npm run build`, aprobado con 44 módulos. No se cambió el formato del guardado ni se reinició ningún progreso. La salida de producción continuó excluida por Git.
