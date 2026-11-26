// Spanish source phrases are stable localization keys. Placeholders preserve live values.
const rows = `
Sombrero estelar|Star hat|Chapeau étoilé
Pulsa B para duplicar el daño del sombrero durante 10 s. Recarga de 30 s.|Press B to double hat damage for 10 s. Cooldown: 30 s.|Appuyez sur B pour doubler les dégâts du chapeau pendant 10 s. Recharge : 30 s.
Escudo estelar|Star shield|Bouclier étoilé
Pulsa E para protegerte de tres golpes. Una activación por partida, sin volver al reintentar.|Press E to block three hits. One activation per game; unavailable on retry.|Appuyez sur E pour bloquer trois coups. Une activation par partie, indisponible en réessayant.
Habilidad desbloqueada y guardada.|Ability unlocked and saved.|Capacité débloquée et enregistrée.
Desbloqueado|Unlocked|Débloqué
Desbloqueado ? B / LT|Unlocked ? B / LT|D?bloqu? ? B / LT
Sombrero estelar desbloqueado. Act?valo con B o LT.|Star hat unlocked. Activate with B or LT.|Chapeau ?toil? d?bloqu?. Activez avec B ou LT.
Duplica el da?o del sombrero durante 10 s. Se compra en la tienda.|Doubles hat damage for 10 s. Buy it in the shop.|Double les d?g?ts du chapeau pendant 10 s. ? acheter en boutique.
Calle iluminada|Lit Street|Rue illuminée
Distrito de neón|Neon District|Quartier néon
Callejón de las farolas|Lamplit Alley|Ruelle des réverbères
Paseo de los reflejos|Reflection Walk|Promenade des reflets
Punto de control guardado|Checkpoint saved|Point de contrôle enregistré
ELIGE TU RITMO|CHOOSE YOUR RHYTHM|CHOISISSEZ VOTRE RYTHME
PERSONAJE|CHARACTER|PERSONNAGE
PROGRESO|PROGRESS|PROGRESSION
MEJOR TIEMPO|BEST TIME|MEILLEUR TEMPS
Jugar|Play|Jouer
Tienda|Shop|Boutique
Skins|Outfits|Tenues
Ataques|Attacks|Attaques
Configuración|Settings|Réglages
Gráficos|Graphics|Graphismes
Audio|Audio|Audio
Controles|Controls|Commandes
General|General|Général
Calidad de gráficos|Graphics quality|Qualité graphique
Modo de pantalla|Display mode|Mode d’affichage
Ventana|Windowed|Fenêtré
Baja|Low|Basse
Media|Medium|Moyenne
Alta|High|Haute
Volumen general|Master volume|Volume général
Restablecer valores|Restore defaults|Rétablir les réglages
Aplicar|Apply|Appliquer
Volver|Back|Retour
Valores restablecidos. Pulsa Aplicar para guardarlos.|Defaults restored. Select Apply to save them.|Réglages rétablis. Sélectionnez Appliquer pour les enregistrer.
Tab · Apartados    ↑ ↓ · Elegir    ← → · Ajustar|Tab · Sections    ↑ ↓ · Select    ← → · Adjust|Tab · Sections    ↑ ↓ · Choisir    ← → · Régler
Sombrero / Giro / Nieve|Hat / Spin / Snow|Chapeau / Rotation / Neige
Sombrero / Giro / Nieve / Nota musical|Hat / Spin / Snow / Musical note|Chapeau / Rotation / Neige / Note de musique
Mover|Move|Se déplacer
Mover a la izquierda|Move left|Aller à gauche
Mover a la derecha|Move right|Aller à droite
Elige una acción, pulsa la nueva tecla y guarda con Aplicar.|Choose an action, press the new key and select Apply.|Choisissez une action, appuyez sur la nouvelle touche et validez avec Appliquer.
Pulsa una tecla|Press a key|Appuyez sur une touche
Pulsa la nueva tecla. Esc cancela el cambio.|Press the new key. Esc cancels the change.|Appuyez sur la nouvelle touche. Échap annule le changement.
Elige otra tecla. Esc cancela el cambio.|Choose another key. Esc cancels the change.|Choisissez une autre touche. Échap annule le changement.
Tecla en uso · {action}. Elige otra tecla.|Key in use · {action}. Choose another key.|Touche utilisée · {action}. Choisissez une autre touche.
Pulsa Aplicar para guardar las teclas.|Select Apply to save the keys.|Sélectionnez Appliquer pour enregistrer les touches.
Restablecer teclas|Reset keys|Rétablir les touches
Teclas restablecidas. Pulsa Aplicar para guardarlas.|Keys restored. Select Apply to save them.|Touches rétablies. Sélectionnez Appliquer pour les enregistrer.
Tab · Apartados    ↑ ↓ · Elegir    Enter · Cambiar|Tab · Sections    ↑ ↓ · Select    Enter · Change|Tab · Sections    ↑ ↓ · Choisir    Entrée · Modifier
Volver al menú|Return to menu|Retour au menu
{key} para continuar|{key} to resume|{key} pour reprendre
{key} para volver al menú|{key} to return to menu|{key} pour revenir au menu
Agáchate bajo el puente|Crouch under the bridge|Accroupissez-vous sous le pont
Deslízate hacia atrás|Slide backward|Glissez en arrière
Teclado|Keyboard|Clavier
Mando|Controller|Manette
Mando: ↑ ↓ Elegir · A / ✕ Abrir · ← → Estación|Controller: ↑ ↓ Select · A / ✕ Open · ← → Season|Manette : ↑ ↓ Choisir · A / ✕ Ouvrir · ← → Saison
Mando: Cruceta Elegir · A / ✕ Jugar · B / ○ Volver|Controller: D-pad Select · A / ✕ Play · B / ○ Back|Manette : Croix Choisir · A / ✕ Jouer · B / ○ Retour
Mando: ↑ ↓ Elegir · A / ✕ Confirmar · B / ○ Volver|Controller: ↑ ↓ Select · A / ✕ Confirm · B / ○ Back|Manette : ↑ ↓ Choisir · A / ✕ Confirmer · B / ○ Retour
LB / L1 Vestuario · RB / R1 Tienda|LB / L1 Wardrobe · RB / R1 Shop|LB / L1 Vestiaire · RB / R1 Boutique
Mando: LB / L1 Apartados · RB / R1 Tienda|Controller: LB / L1 Tabs · RB / R1 Shop|Manette : LB / L1 Onglets · RB / R1 Boutique
A / ✕ Ensayo · B / ○ Volver|A / ✕ Practice · B / ○ Back|A / ✕ Entraînement · B / ○ Retour
Mando: LB / L1 y RB / R1 Apartados · Cruceta Elegir o ajustar|Controller: LB / L1 and RB / R1 Tabs · D-pad Select or adjust|Manette : LB / L1 et RB / R1 Onglets · Croix Choisir ou régler
A / ✕ Aplicar · B / ○ Volver|A / ✕ Apply · B / ○ Back|A / ✕ Appliquer · B / ○ Retour
Mando: Menu / Options Continuar · View / Share Menú|Controller: Menu / Options Resume · View / Share Main menu|Manette : Menu / Options Reprendre · View / Share Menu
Mando: ↑ ↓ Elegir · A / ✕ Confirmar · B / ○ Menú · R3 Reintentar|Controller: ↑ ↓ Select · A / ✕ Confirm · B / ○ Menu · R3 Retry|Manette : ↑ ↓ Choisir · A / ✕ Confirmer · B / ○ Menu · R3 Réessayer
Palanca izquierda / Cruceta|Left stick / D-pad|Stick gauche / Croix directionnelle
Palanca izquierda ↓ / Cruceta ↓|Left stick ↓ / D-pad ↓|Stick gauche ↓ / Croix directionnelle ↓
Menús: cruceta para elegir, A / ✕ para confirmar y B / ○ para volver.|Menus: use the D-pad to navigate, A / ✕ to confirm and B / ○ to go back.|Menus : croix directionnelle pour naviguer, A / ✕ pour confirmer et B / ○ pour revenir.
Correr|Run|Courir
Saltar|Jump|Sauter
Saltar / Doble salto|Jump / Double jump|Saut / Double saut
ESPACIO / ESPACIO × 2|SPACE / SPACE × 2|ESPACE / ESPACE × 2
Agacharse|Crouch|S’accroupir
ESPACIO|SPACE|ESPACE
Pausa / Reiniciar / Menú|Pause / Restart / Menu|Pause / Recommencer / Menu
Idioma|Language|Langue
Música|Music|Musique
Efectos|Sound effects|Effets sonores
Volumen de música|Music volume|Volume de la musique
Volumen de efectos|Effects volume|Volume des effets
Dificultad|Difficulty|Difficulté
Fácil|Easy|Facile
Normal|Normal|Normale
Difícil|Hard|Difficile
Extremo|Extreme|Extrême
Activada|On|Activée
Desactivada|Off|Désactivée
Pantalla completa|Fullscreen|Plein écran
Entrar en pantalla completa|Enter fullscreen|Activer le plein écran
Salir de pantalla completa|Exit fullscreen|Quitter le plein écran
Pantalla completa no disponible en este navegador.|Fullscreen is unavailable in this browser.|Le plein écran est indisponible dans ce navigateur.
No se pudo activar la pantalla completa.|Could not enter fullscreen.|Impossible d'activer le plein écran.
Preferencias guardadas.|Preferences saved.|Préférences enregistrées.
No se pudo guardar. Los ajustes no han cambiado.|Could not save. Settings were not changed.|Échec de l'enregistrement. Les réglages restent inchangés.
Los cambios se guardan automáticamente.|Changes are saved automatically.|Les modifications sont enregistrées automatiquement.
Dificultad guardada.|Difficulty saved.|Difficulté enregistrée.
Si cambias la dificultad, volverás al inicio del nivel.|Changing the difficulty restarts the level when you return.|Si vous changez la difficulté, le niveau recommencera à votre retour.
Una sola vida. Los enemigos son más rápidos, resistentes y agresivos.|One life. Enemies are faster, tougher and more aggressive.|Une seule vie. Les ennemis sont plus rapides, résistants et agressifs.
Listo para jugar|Ready to play|Prêt à jouer
Nivel bloqueado|Level locked|Niveau verrouillé
La dificultad se guarda al elegirla y se aplica al volver al juego.|Difficulty saves when selected and takes effect when you return to the game.|La difficulté est enregistrée dès la sélection et s'applique au retour dans le jeu.
Fácil: 5 vidas, enemigos lentos y jefe de 6 vidas.|Easy: 5 lives, slower enemies and a 6-health boss.|Facile : 5 vies, ennemis lents et boss à 6 points de vie.
Normal: 3 vidas y ritmo original.|Normal: 3 lives and the original pace.|Normale : 3 vies et rythme d'origine.
Difícil: 2 vidas, enemigos rápidos y jefe de 10 vidas.|Hard: 2 lives, faster enemies and a 10-health boss.|Difficile : 2 vies, ennemis rapides et boss à 10 points de vie.
Probar efecto|Test sound|Tester le son
← → Ajustar|← → Adjust|← → Régler
↑ ↓ Elegir|↑ ↓ Select|↑ ↓ Choisir
ENTER Confirmar|ENTER Confirm|ENTRÉE Confirmer
ESC Volver|ESC Back|ÉCHAP Retour
Menú|Menu|Menu
UNA AVENTURA DE RITMO|AN ADVENTURE IN RHYTHM|UNE AVENTURE EN RYTHME
Cuatro estaciones. Un escenario. Tu ritmo.|Four seasons. One stage. Your rhythm.|Quatre saisons. Une scène. Votre rythme.
VESTUARIO|OUTFIT|TENUE
PISTA ORIGINAL|ORIGINAL TRACK|PISTE ORIGINALE
DIFICULTAD|DIFFICULTY|DIFFICULTÉ
MONEDAS|COINS|PIÈCES
PROGRESO   {count} / 4|PROGRESS   {count} / 4|PROGRESSION   {count} / 4
EXPLORA LAS ESTACIONES|EXPLORE THE SEASONS|EXPLOREZ LES SAISONS
VISTA PREVIA|PREVIEW|APERÇU
Activar música|Enable music|Activer la musique
Silenciar|Mute music|Couper la musique
↑ ↓ ELEGIR|↑ ↓ SELECT|↑ ↓ CHOISIR
ENTER ABRIR|ENTER OPEN|ENTRÉE OUVRIR
← → ESTACIÓN|← → SEASON|← → SAISON
S MÚSICA|S MUSIC|S MUSIQUE
V 0.8 / CONFIGURACIÓN|V 0.8 / SETTINGS|V 0.8 / RÉGLAGES
Primavera|Spring|Printemps
Verano|Summer|Été
Otoño|Autumn|Automne
Navidad|Christmas|Noël
Traje rojo|Red suit|Costume rouge
Traje blanco|White suit|Costume blanc
Traje negro|Black suit|Costume noir
Traje navideño|Christmas suit|Costume de Noël
El jardín del ritmo|The rhythm garden|Le jardin du rythme
Bajo el sol y las estrellas|Under the sun and stars|Sous le soleil et les étoiles
Las luces del bosque|Forest lights|Les lumières de la forêt
Una noche para brillar|A night to shine|Une nuit pour briller
Encuentra tu ritmo|Find your rhythm|Trouvez votre rythme
Cuatro estaciones · Completa cada nivel para abrir el siguiente|Four seasons · Finish each level to unlock the next|Quatre saisons · Terminez chaque niveau pour ouvrir le suivant
DISPONIBLE|AVAILABLE|DISPONIBLE
BLOQUEADO|LOCKED|VERROUILLÉ
Completado|Completed|Terminé
Seleccionar|Select|Choisir
Jugar nivel|Play level|Jouer le niveau
← → Elegir|← → Select|← → Choisir
ENTER Jugar|ENTER Play|ENTRÉE Jouer
Ensayo libre desde Ataques (sin recompensas).|Free practice from Attacks (no rewards).|Entraînement libre depuis Attaques (sans récompenses).
Completa la estación anterior para desbloquear este nivel.|Finish the previous season to unlock this level.|Terminez la saison précédente pour débloquer ce niveau.
Tu vestuario|Your outfits|Vos tenues
La tienda del ritmo|The rhythm shop|La boutique du rythme
Cada personaje tiene habilidades propias. Compra una vez y selecciona cuando quieras.|Each character has unique abilities. Buy once and switch whenever you like.|Chaque personnage a ses talents. Achetez une fois, puis choisissez librement.
Las skins cambian el vestuario; se conservan los rasgos y habilidades del personaje.|Outfits change clothing; character traits and abilities stay the same.|Les tenues changent les vêtements, sans modifier les traits ni les talents.
Compra con las monedas ganadas al completar niveles. Sin dinero real.|Spend coins earned by finishing levels. No real money.|Utilisez les pièces gagnées dans les niveaux. Sans argent réel.
Monedas: {count}|Coins: {count}|Pièces : {count}
{price} monedas|{price} coins|{price} pièces
Faltan {count}|Need {count} more|Il manque {count}
Seleccionado|Selected|Sélectionné
Equipada|Equipped|Équipée
Gratis|Free|Gratuit
Obtener gratis|Get for free|Obtenir gratuitement
En tu inventario|Owned|Dans votre inventaire
Desbloqueado|Unlocked|Débloqué
L en campaña|L in campaign|L en campagne
Disponible en tienda|Available in shop|Disponible en boutique
Vestuario|Outfits|Tenues
Vestuario predeterminado|Default outfit|Tenue par défaut
Recupera el traje del personaje. Michael adapta su vestuario a la estación.|Restore the character outfit. Michael dresses for the season.|Retrouvez la tenue du personnage. Michael s'adapte à la saison.
Ver en tienda|View in shop|Voir en boutique
Comprar|Buy|Acheter
Ver controles|View controls|Voir les commandes
Usar en el juego|Use in game|Utiliser en jeu
Usar vestuario predeterminado|Use default outfit|Utiliser la tenue par défaut
Equipar skin|Equip outfit|Équiper la tenue
Este artículo no está disponible.|This item is unavailable.|Cet article est indisponible.
Ya tienes este artículo. No se han descontado monedas.|You already own this item. No coins were spent.|Vous avez déjà cet article. Aucune pièce débitée.
No tienes suficientes monedas. Completa o repite niveles para conseguir más.|Not enough coins. Finish or replay levels to earn more.|Pas assez de pièces. Terminez ou rejouez des niveaux pour en gagner.
Compra primero este artículo.|Buy this item first.|Achetez d'abord cet article.
Este artículo no es una skin.|This item is not an outfit.|Cet article n'est pas une tenue.
No se pudo guardar. No se ha aplicado ningún cambio ni descontado monedas.|Could not save. No changes were applied and no coins were spent.|Échec de l'enregistrement. Aucun changement et aucune pièce débitée.
Vestuario guardado. Se aplicará al menú y a cualquier nivel.|Outfit saved. It applies to the menu and every level.|Tenue enregistrée. Elle s'applique au menu et à tous les niveaux.
Nieve desbloqueada y guardada. Ya puedes usar L en campaña.|Snow unlocked and saved. You can now use L in campaign.|Neige débloquée et enregistrée. L est disponible en campagne.
Traje guardado. Pulsa de nuevo para equiparlo.|Outfit saved. Press again to equip it.|Tenue enregistrée. Appuyez encore pour l'équiper.
Thriller|Thriller|Thriller
Smooth Criminal|Smooth Criminal|Smooth Criminal
Traje de Billie Jean|Billie Jean outfit|Tenue de Billie Jean
Traje de Thriller|Thriller outfit|Tenue de Thriller
Chaqueta y pantalones rojos con detalles negros.|Red jacket and trousers with black accents.|Veste et pantalon rouges avec des détails noirs.
Chaqueta negra de lentejuelas, camiseta blanca, guante plateado y sombrero negro.|Black sequin jacket, white shirt, silver glove and black hat.|Veste noire ? sequins, t-shirt blanc, gant argent? et chapeau noir.
Equilibrado. Camina a 230, corre a 340 px/s y usa los ataques básicos. Viste el traje Smooth Criminal.|Balanced. Walks at 230 px/s, runs at 340 px/s and uses basic attacks. Wears the Smooth Criminal outfit.|Équilibré. Marche à 230 px/s, court à 340 px/s et utilise les attaques de base. Porte la tenue Smooth Criminal.
Espíritu navideño|Christmas spirit|Esprit de Noël
Brillo dorado|Golden shine|Éclat doré
Copo de nieve|Snowflake|Flocon de neige
Chaqueta roja con detalles negros. Solo cambia el aspecto.|Red jacket with black details. Appearance only.|Veste rouge à détails noirs. Aspect uniquement.
Traje y sombrero claros con detalles azules. Solo cambia el aspecto.|Light suit and hat with blue details. Appearance only.|Costume et chapeau clairs, détails bleus. Aspect uniquement.
Traje verde y sombrero rojo para cualquier estación. Solo cambia el aspecto.|Green suit and red hat for any season. Appearance only.|Costume vert et chapeau rouge pour toute saison. Aspect uniquement.
Chaqueta y sombrero dorados. Solo cambia el aspecto.|Golden jacket and hat. Appearance only.|Veste et chapeau dorés. Aspect uniquement.
Desbloquea L en campaña: inflige daño y congela. Recarga de 2 s. No necesita equiparse.|Unlocks L in campaign: damage and freeze. 2 s cooldown. No equipment needed.|Débloque L en campagne : dégâts et gel. Recharge de 2 s. Aucun équipement requis.
Bailarín navideño|Christmas dancer|Danseur de Noël
Rey de la Nieve|Snow King|Roi des Neiges
Bailarín dorado|Golden dancer|Danseur doré
Duende del ritmo|Rhythm elf|Lutin du rythme
Corona de hielo|Ice crown|Couronne de glace
Estrella dorada|Golden star|Étoile dorée
Traje de la estación|Season outfit|Tenue de saison
Equilibrado. Camina a 230, corre a 340 px/s y usa los ataques básicos. El vestuario cambia con la estación.|Balanced. Walks at 230, runs at 340 px/s and uses basic attacks. Outfit follows the season.|Équilibré. Marche à 230, court à 340 px/s et utilise les attaques de base. Tenue selon la saison.
Ágil: corre a 380 px/s con SHIFT y salta más alto con ESPACIO. Mantiene los ataques básicos.|Agile: runs at 380 px/s with SHIFT and jumps higher with SPACE. Uses basic attacks.|Agile : court à 380 px/s avec MAJ et saute plus haut avec ESPACE. Attaques de base.
L lanza nieve sin comprar el copo: congela 2,4 s y recarga en 1,4 s. El jefe limita la congelación a 0,6 s.|L throws snow without buying the snowflake: freezes for 2.4 s, cooldown 1.4 s. Boss freeze is capped at 0.6 s.|L lance la neige sans achat du flocon : gel de 2,4 s, recharge de 1,4 s. Gel du boss limité à 0,6 s.
K activa un giro de 125 px y dos puntos de daño. Recarga en 0,8 s. El sombrero y la nieve mantienen su daño normal.|K spins across 125 px for two damage. Cooldown 0.8 s. Hat and snow keep normal damage.|K déclenche une rotation de 125 px et deux dégâts. Recharge de 0,8 s. Chapeau et neige : dégâts normaux.
El poder del baile|The power of dance|Le pouvoir de la danse
J|J|J
Sombrero de retorno — 0,5 s de recarga, uno en vuelo.|Returning hat — 0.5 s cooldown, one in flight.|Chapeau boomerang — recharge de 0,5 s, un seul en vol.
Giro — {range} px, recarga {seconds} s.|Spin — {range} px, cooldown {seconds} s.|Rotation — {range} px, recharge de {seconds} s.
Copo — congela {duration} s, recarga {seconds} s.|Snowflake — freezes {duration} s, cooldown {seconds} s.|Flocon — gel de {duration} s, recharge de {seconds} s.
Moonwalk — esquiva durante el deslizamiento.|Moonwalk — dodge while sliding.|Moonwalk — esquive pendant la glissade.
habilidades equilibradas|balanced abilities|talents équilibrés
SHIFT corre más rápido|SHIFT runs faster|MAJ court plus vite
ESPACIO salta más alto|SPACE jumps higher|ESPACE saute plus haut
L congela 2,4 s|L freezes for 2.4 s|L gèle pendant 2,4 s
recarga 2 s|cooldown 2 s|recharge de 2 s
K alcanza 125 px|K reaches 125 px|K atteint 125 px
daño 2|damage 2|dégâts 2
recarga 1,2 s|cooldown 1.2 s|recharge de 1,2 s
L disponible también en campaña.|L is also available in campaign.|L est aussi disponible en campagne.
Nieve libre en el ensayo. Copo de campaña: 300 monedas en tienda.|Free snow in practice. Campaign snowflake: 300 coins in shop.|Neige libre en entraînement. Flocon de campagne : 300 pièces en boutique.
Entrar al ensayo|Enter practice|Entrer en entraînement
Abrir tienda|Open shop|Ouvrir la boutique
Movimientos|Moves|Mouvements
Personaje|Character|Personnage
Recarga|Cooldown|Recharge
Sombrero de retorno|Returning hat|Chapeau boomerang
Pulso de retorno|Returning pulse|Impulsion boomerang
Lanza un pulso que regresa. Solo uno en vuelo.|Launch a returning pulse. Only one can be in flight.|Lance une impulsion qui revient. Une seule peut être en vol.
Duplica el daño del pulso durante 10 s. Se compra en la tienda.|Doubles pulse damage for 10 s. Buy it in the shop.|Double les dégâts de l’impulsion pendant 10 s. Disponible en boutique.
Copo|Snowflake|Flocon
Lanza un sombrero que regresa. Solo uno en vuelo.|Throw a returning hat. Only one can be in flight.|Lance un chapeau qui revient. Un seul peut être en vol.
Golpea alrededor de ti en un radio de {range} px.|Hit enemies within {range} px.|Frappe les ennemis dans un rayon de {range} px.
Congela enemigos durante {duration} s.|Freeze enemies for {duration} s.|Gèle les ennemis pendant {duration} s.
Esquiva mientras te deslizas.|Dodge while sliding.|Esquive pendant la glissade.
Nota musical|Musical note|Note de musique
Lanza una nota rápida que inflige un punto de daño.|Fire a fast note that deals one damage.|Lance une note rapide qui inflige un point de dégâts.
Personaje activo · {name}|Active character · {name}|Personnage actif · {name}
Copo en campaña|Campaign snowflake|Flocon en campagne
Disponible en campaña y en el ensayo.|Available in campaign and practice.|Disponible en campagne et en entraînement.
Disponible en el ensayo. Desbloquéalo para la campaña por 300 monedas en la tienda.|Available in practice. Unlock it for the campaign for 300 coins in the shop.|Disponible en entraînement. Débloquez-le en campagne pour 300 pièces en boutique.
Tab · Apartados    Enter · Ensayo    T · Tienda    Esc · Volver|Tab · Sections    Enter · Practice    T · Shop    Esc · Back|Tab · Rubriques    Entrée · Entraînement    T · Boutique    Échap · Retour
NIVEL|LEVEL|NIVEAU
Vida|Health|Vie
ENSAYO|PRACTICE|ENTRAÎNEMENT
ESPACIO|SPACE|ESPACE
Salta|Jump|Sautez
Cuidado con el hueco|Watch the gap|Attention au trou
↓ / S · Agáchate bajo el puente|↓ / S · Crouch under the bridge|↓ / S · Accroupissez-vous sous le pont
Deslízate hacia atrás|Slide backwards|Glissez en arrière
FIN DEL ENSAYO|END OF PRACTICE|FIN DE L'ENTRAÎNEMENT
Zona de daño|Damage zone|Zone de dégâts
Pausa|Pause|Pause
Continuar|Resume|Reprendre
Reiniciar partida|Restart game|Recommencer la partie
A/D o ← →  Mover    SHIFT  Correr    ESPACIO  Saltar    S/↓  Agacharse    M  Moonwalk    R  Reiniciar    ESC  Menú|A/D or ← →  Move    SHIFT  Run    SPACE  Jump    S/↓  Crouch    M  Moonwalk    R  Restart    ESC  Menu|A/D ou ← →  Bouger    MAJ  Courir    ESPACE  Sauter    S/↓  S'accroupir    M  Moonwalk    R  Recommencer    ÉCHAP  Menu
Sombrero|Hat|Chapeau
Giro|Spin|Rotation
Nieve|Snow|Neige
Nieve disponible|Snow available|Neige disponible
Nieve disponible en tienda|Snow available in shop|Neige disponible en boutique
Nieve habilitada para este ensayo|Snow enabled for practice|Neige disponible en entraînement
Muñecos: 2 impactos|Snowmen: 2 hits|Bonshommes : 2 coups
P para continuar|P to resume|P pour reprendre
ESC para volver al menú|ESC to return to menu|ÉCHAP pour revenir au menu
bloqueada|locked|verrouillée
en vuelo|in flight|en vol
listo|ready|prêt
En escena|On stage|En scène
Corriendo|Running|Course
Caminando|Walking|Marche
En el aire|Airborne|En l'air
Agachado|Crouched|Accroupi
Daño|Hurt|Blessé
Recargando {seconds} s|Cooldown {seconds} s|Recharge {seconds} s
Moonwalk listo|Moonwalk ready|Moonwalk prêt
Un nuevo intento|Try again|Nouvel essai
R para reiniciar el ensayo|R to restart practice|R pour recommencer l'entraînement
ESC para volver|ESC to return|ÉCHAP pour revenir
Monedas {count}/7|Coins {count}/7|Pièces {count}/7
Regalos {count}/{total}|Gifts {count}/{total}|Cadeaux {count}/{total}
REY DE LA NIEVE {health}/{max}|SNOW KING {health}/{max}|ROI DES NEIGES {health}/{max}
Derrota al Rey de la Nieve para abrir la meta|Defeat the Snow King to open the finish|Battez le Roi des Neiges pour ouvrir l'arrivée
El callejón final|The final alley|La ruelle finale
El Misterioso del Callejón {health}/{max}|The Alley Stranger {health}/{max}|L'Inconnu de la ruelle {health}/{max}
Derrota al Misterioso del Callejón para abrir la meta|Defeat the Alley Stranger to open the finish|Battez l'Inconnu de la ruelle pour ouvrir l'arrivée
Derrota al Jefe del Club para abrir la meta|Defeat the Club Boss to unlock the finish|Battez le chef du club pour accéder à l'arrivée
El club|The club|Le club
Pisa la plataforma de la meta|Land on the finish platform|Atterrissez sur la plateforme d'arrivée
Sombra Urbana|Urban Shadow|Ombre urbaine
Gato Negro|Black Cat|Chat noir
Bailarín Oscuro|Dark Dancer|Danseur obscur
¡Ensayo completado! R para repetir|Practice completed! R to replay|Entraînement terminé ! R pour rejouer
SALTA|JUMP|SAUTEZ
META|FINISH|ARRIVÉE
¡Las cuatro estaciones brillan!|All four seasons shine!|Les quatre saisons brillent !
VICTORIA|VICTORY|VICTOIRE
¡Nivel completado!|Level completed!|Niveau terminé !
El espectáculo continúa|The show goes on|Le spectacle continue
Recompensa: {reward} monedas|Reward: {reward} coins|Récompense : {reward} pièces
Incluye bono de primera victoria|Includes first-win bonus|Bonus de première victoire inclus
Recompensa|Reward|Récompense
Saldo|Balance|Solde
Saldo: {count}|Balance: {count}|Solde : {count}
Progreso guardado.|Progress saved.|Progression enregistrée.
No se pudo guardar. El progreso se conserva solo en esta sesión.|Could not save. Progress is kept only for this session.|Échec de l'enregistrement. Progression conservée pour cette session seulement.
No quedan vidas.|No lives remaining.|Il ne reste plus de vies.
Monedas obtenidas|Coins collected|Pièces obtenues
Los objetos de este intento no se han abonado.|Items from this attempt were not credited.|Les objets de cet essai n'ont pas été crédités.
Siguiente estación|Next season|Saison suivante
Siguiente nivel|Next level|Niveau suivant
Menú principal|Main menu|Menu principal
Repetir nivel|Replay level|Rejouer le niveau
Reintentar|Retry|Réessayer
Elegir nivel|Choose level|Choisir le niveau
`;
export const translations = { es: {}, en: {}, fr: {} };
for (const row of rows.trim().split('\n')) {
  const [es, en, fr] = row.split('|');
  translations.es[es] = es; translations.en[es] = en; translations.fr[es] = fr;
}
