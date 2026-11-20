// Stable IDs preserve existing unlocks and records. Songs are thematic references;
// the game plays original instrumental music, not the original recordings.
const worlds = [
 {name:'Primavera', outfit:'Traje rojo', color:0xce3d50, sky:0x183c46, land:0x275c4b, accent:0xf5aab6},
 {name:'Verano', outfit:'Traje blanco', color:0xf2ead9, sky:0x174666, land:0x397879, accent:0xf7cb80},
 {name:'Otoño', outfit:'Traje negro', color:0x242632, sky:0x302b46, land:0x665048, accent:0xe6a466},
 {name:'Navidad', outfit:'Traje navideño', color:0xba324b, sky:0x172e50, land:0x577789, accent:0xc1e7ff}
];
const stages = [
 ['Billie Jean','Billie Jean',0x050a24,0xffd78c],
 ['Smooth Criminal','Smooth Criminal',0x091322,0xffcc8b],
 ['Plaza de colores','Black or White',0x36445d,0xf3e9c9],
 ['Avenida de neón','Beat It',0x30233f,0xf17d68],
 ['Noche de baile','Rock with You',0x20365c,0x9ee3f3],
 ['Gran escenario','Wanna Be Startin’ Somethin’',0x433455,0xffcf72],
 ['Bosque encantado','Thriller',0x24243e,0xf1a057],
 ['Festival del ritmo','Don’t Stop ’Til You Get Enough',0x1b3041,0xc4dfe8],
 ['Tierra y raíces','Earth Song',0x293d35,0x9cd5a1],
 ['Aldea de estrellas','Heal the World',0x193d55,0xbdeaff],
 ['Luces bajo la nieve','Man in the Mirror',0x282e55,0xffd998],
 ['Concierto de Navidad','They Don’t Care About Us',0x382340,0xf4caa1]
];
export const levels=stages.map(([name,track,sky,accent],i)=>({
 ...worlds[Math.floor(i/3)], id:i+1, world:Math.floor(i/3)+1, stage:i%3+1,
 name,track,sky,accent,subtitle:worlds[Math.floor(i/3)].name,difficulty:i+1
}));
