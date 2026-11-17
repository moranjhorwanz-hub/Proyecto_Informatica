// Owns exactly one original, procedural seasonal track. No recordings.
export class AudioManager {
 constructor(){this.context=null;this.timer=null;this.voices=new Set();this.muted=false;this.level=1;}
 unlock(){this.context??=new (window.AudioContext||window.webkitAudioContext)();this.context.resume();this.play(this.level);}
 play(level){this.stop();this.level=level;if(!this.context||this.muted)return;let step=0;
 const notes=[[261.63,329.63,392,440],[293.66,369.99,440,493.88],[220,261.63,329.63,392],[261.63,349.23,392,523.25]][level-1];
 const beat=()=>{const c=this.context,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=notes[step++%notes.length]/2;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.045,c.currentTime+.025);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.48);o.connect(g).connect(c.destination);this.voices.add(o);o.onended=()=>{this.voices.delete(o);g.disconnect();};o.start();o.stop(c.currentTime+.5);};beat();this.timer=setInterval(beat,430+level*35);}
 stop(){clearInterval(this.timer);this.timer=null;for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();}
 effect(type){
  if(!this.context)return;
  const tones={jump:[330,660,.15],moonwalk:[520,160,.28],damage:[160,65,.2]};
  const [start,end,duration]=tones[type]||tones.jump,c=this.context,o=c.createOscillator(),g=c.createGain();
  o.type=type==='damage'?'triangle':'sine';o.frequency.setValueAtTime(start,c.currentTime);o.frequency.exponentialRampToValueAtTime(end,c.currentTime+duration);
  g.gain.setValueAtTime(.065,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);
  o.connect(g).connect(c.destination);this.voices.add(o);o.onended=()=>{this.voices.delete(o);g.disconnect();};o.start();o.stop(c.currentTime+duration);
 }
 toggle(){this.muted=!this.muted;this.play(this.level);return !this.muted;}
}
