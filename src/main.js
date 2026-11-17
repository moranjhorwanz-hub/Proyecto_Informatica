import Phaser from 'phaser';
import './styles/style.css';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import GameScene from './scenes/GameScene.js';
import ShopScene from './scenes/ShopScene.js';
import CharacterScene from './scenes/CharacterScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';
import FeatureScene from './scenes/FeatureScene.js';
import {ProgressManager} from './systems/ProgressManager.js';
import {AudioManager} from './systems/AudioManager.js';
export const services={progress:new ProgressManager(),audio:new AudioManager()};
export const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1280,height:720,backgroundColor:'#10151e',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{y:1000},debug:false}},scene:[BootScene,MenuScene,LevelSelectScene,GameScene,ShopScene,CharacterScene,SettingsScene,GameOverScene,VictoryScene,new FeatureScene('Attacks','El poder del baile',4)],callbacks:{preBoot:game=>game.registry.set('services',services)}});
// Development-only handle: browser checks must reuse the existing game, never re-import it.
if(import.meta.env.DEV)window.__MJA_GAME__=game;
if(import.meta.hot)import.meta.hot.dispose(()=>{services.audio.stop();game.destroy(true);});
