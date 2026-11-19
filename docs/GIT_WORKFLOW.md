# Organización de Git

## Entrega consolidada de fases 4 a 8

Las ramas `feature/phase4-combat` a `feature/phase8-settings` se habían creado sin commits propios: todas apuntaban al commit `d6db934` y el trabajo permanecía acumulado en el directorio de trabajo.

Se guarda una única entrega integrada de combate, niveles, tienda, personajes y configuración, junto con sus pruebas y documentación. No se reconstruyen retrospectivamente versiones independientes de cada fase.

- `master`: base local integrada hasta la fase 8.
- `integration/phases4-8`: rama que conserva la entrega consolidada, incorporada a `master` mediante avance directo, sin reescribir el historial.
- Las ramas vacías de fases 4–7 se retiran tras verificar que no contienen commits propios. La rama de fase 8 se renombra como la rama de integración.

Los documentos PHASE4–PHASE8 describen el trabajo y las ramas utilizadas durante el desarrollo; sus menciones a la ausencia de commits corresponden al momento original de cada entrega.

## Próximo trabajo

Crear una rama desde `master` al comenzar cada funcionalidad, guardar sus cambios con un commit completo y verificable, y después integrarla. La fase 9 sigue pendiente: esta organización de Git no sustituye la integración y revisión general previstas en el plan.

La verificación previa al guardado incluye 39 pruebas unitarias, compilación de producción y revisión de espacios en los cambios. Los resultados anteriores de Chrome están registrados en VALIDATION.

Todo se guarda localmente. No se realiza `push` ni se altera el repositorio remoto. `.tools`, `node_modules` y `dist` permanecen excluidos por `.gitignore`.
