// Four seasonal worlds, each with three increasingly difficult stages.
const worlds = [
 {name:'Primavera', outfit:'Traaje rojo', track:'Garden Groove', color:0xce3d50, sky:0x183c46, land:0x275c4b, accent:0xf5aab6, stages:['Jardín floreciente','Sendero de pétalos','Festival de primavera']},
 {name:'Verano', outfit:'Traje blanco', track:'Coastal Shuffle', color:0xf2ead9, sky:0x174666, land:0x397879, accent:0xf7cb80, stages:['Costa soleada','Ritmo entre palmeras','Noche de verano']},
 {name:'Otoño', outfit:'Traje negro', track:'Midnight Leaves', color:0x242632, sky:0x302b46, land:0x665048, accent:0xe6a466, stages:['Bosque dorado','Sendero de hojas','Baile de medianoche']},
 {name:'Navidad', outfit:'Traje navideño', track:'Winter Together', color:0xba324b, sky:0x172e50, land:0x577789, accent:0xc1e7ff, stages:['Aldea nevada','Bosque de luces','Gran fiesta navideña']}
];
export const levels = worlds.flatMap((world, w) => world.stages.map((name, stage) => ({...world, id:w*3+stage+1, world:w+1, stage:stage+1, name, subtitle:world.name, difficulty:w*3+stage+1})));
