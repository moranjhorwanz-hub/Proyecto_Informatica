# Plan de trabajo V2 – Michael Jackson Adventure

## Objetivo

Desarrollar un videojuego de plataformas 2D para navegador con una presentación visual moderna, fondos temáticos, personaje principal animado, múltiples niveles, combate, tienda, personajes desbloqueables y opciones de configuración.

## Arquitectura

**Tecnologías:** JavaScript, Phaser 3, Vite, HTML5, CSS3 y localStorage.

**Escenas principales:**
- BootScene: carga de recursos iniciales.
- MenuScene: menú interactivo con fondo, personaje y controles integrados.
- GameScene: plataformas, jugador, enemigos y niveles.
- ShopScene: compras con monedas.
- CharacterScene: selección de skins y personajes.
- SettingsScene: idiomas, sonido, música y dificultad.
- GameOverScene: derrota y reinicio.
- VictoryScene: finalización de niveles.

**Módulos compartidos:**
- Player: movimientos, animaciones y Moonwalk.
- Enemy: comportamiento de enemigos.
- Hat: ataque con sombrero.
- LevelManager: carga de escenarios.
- AudioManager: música y efectos de sonido.
- ShopManager: compras y desbloqueos.
- SaveManager: almacenamiento del progreso.

## Estructura visual obligatoria

Crear el menú principal como una escena única de Phaser 3.

1. Un fondo HD ocupa toda la pantalla.
2. Michael Jackson aparece dentro del escenario, en el centro.
3. Los botones Jugar, Tienda, Personajes, Ataques y Ajustes están superpuestos al fondo, en el extremo izquierdo.
4. La información del nivel, vestuario, música y dificultad aparece en el extremo derecho.
5. Ningún elemento principal debe quedar colocado fuera o debajo de la imagen del escenario.
6. Al cambiar de nivel deben cambiar el fondo, el traje predeterminado, las decoraciones y la pista musical.
7. Las skins compradas y equipadas pueden sustituir el traje predeterminado del nivel.
8. Utilizar paneles semitransparentes para mantener visibles los paisajes.
9. Incorporar animaciones suaves, partículas y efectos de iluminación.
10. Adaptar la interfaz a distintas resoluciones sin deformar los personajes.

## Funcionalidades del videojuego

### Jugador
- Caminar, correr, saltar y agacharse.
- Moonwalk mediante la tecla M.
- Lanzar sombrero con J.
- Giro especial con K.
- Ataque de nieve con L, cuando esté desbloqueado.
- Animaciones de reposo, salto, combate y daño.

### Niveles
- Primavera: flores y plataformas sencillas.
- Verano: playa y plataformas móviles.
- Otoño: bosque y enemigos veloces.
- Navidad: nieve, regalos, luces, muñecos de nieve y jefe final.

### Tienda
- Recolección de monedas.
- Skins y personajes con distintos precios.
- Ataques desbloqueables.
- Validación de monedas antes de comprar.
- Inventario de artículos comprados.
- Persistencia del progreso.

### Configuración
- Español, inglés y francés.
- Volumen de música y efectos por separado.
- Dificultad fácil, normal y difícil.
- Pantalla completa.
- Guardado automático de preferencias.

### Audio
Seleccionar música diferente por nivel. Las canciones de Michael Jackson serán referencias temáticas; para reproducir las grabaciones originales se deberán obtener las licencias correspondientes. Durante el desarrollo utilizar pistas originales o autorizadas.

## Fases de trabajo

**Fase 1 – Preparación**
- Crear proyecto.
- Configurar Phaser 3 y Vite.
- Crear estructura de carpetas y escenas.
- Definir datos y contratos compartidos.
- Verificar que el navegador carga el juego.

**Fase 2 – Diseño visual**
- Construir menú sobre un único escenario.
- Crear cuatro fondos temáticos.
- Situar el personaje en el centro.
- Superponer paneles laterales.
- Implementar selección de niveles y transiciones.
- Verificar posiciones y escalado a 1280 × 720.

**Fase 3 – Jugador**
- Movimiento horizontal.
- Saltos y colisiones.
- Animación Moonwalk.
- Sistema de vidas.
- Ataque con sombrero.

**Fase 4 – Combate**
- Copos de nieve.
- Muñecos de nieve.
- Ataques especiales.
- Detección de golpes.
- Tiempo de recarga de habilidades.

**Fase 5 – Niveles**
- Diseñar los cuatro escenarios.
- Colocar plataformas y obstáculos.
- Añadir monedas y regalos.
- Crear condiciones de victoria.
- Implementar jefe final.

**Fase 6 – Tienda**
- Crear saldo y sistema de recompensas.
- Crear catálogo.
- Implementar compras.
- Permitir equipar skins.
- Guardar artículos desbloqueados.

**Fase 7 – Personajes**
- Incorporar personajes adicionales.
- Definir habilidades.
- Implementar selección.
- Integrar habilidades con los controles y el combate.

**Fase 8 – Configuración**
- Crear selector de idioma.
- Volúmenes independientes.
- Música por escenario.
- Dificultad ajustable.
- Pantalla completa.

**Fase 9 – Integración y pruebas**
- Comprobar todos los botones.
- Probar colisiones, ataques y niveles.
- Revisar compras y guardado.
- Verificar cambios de idioma, volumen y dificultad.
- Medir rendimiento.
- Corregir errores.

**Fase 10 – Publicación**
- Ejecutar npm run build.
- Revisar los recursos y las licencias.
- Publicar en un servicio de alojamiento web.
- Documentar controles y funcionamiento.

## Reglas para Codex

- Implementar las fases en orden, pero permitir trabajo paralelo cuando las dependencias estén completas.
- Mantener cada funcionalidad en módulos separados.
- Utilizar una rama de Git por funcionalidad.
- Evitar dependencias innecesarias.
- Emplear gráficos originales o temporales cuando falten recursos definitivos.
- No incorporar música comercial sin autorización.
- Priorizar la claridad del código y el buen rendimiento en computadoras con 8 GB de RAM.
- Ejecutar pruebas después de cada fase.
- No declarar terminada una fase con botones sin funcionalidad.
- Documentar los archivos modificados y los problemas encontrados.

## Resultado esperado

Una aplicación de entretenimiento jugable en navegador, con menú integrado en escenarios HD, Michael Jackson en el centro, bailes, combates, cuatro niveles temáticos, tienda, personajes desbloqueables, monedas, música y configuración personalizable.