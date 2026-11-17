import Phaser from 'phaser';
import { translate } from './i18n.js';

// Scene-local text adapter: also translates live HUD updates, without patching Phaser prototypes.
export default class LocalizationPlugin extends Phaser.Plugins.ScenePlugin {
  boot() {
    const scene = this.scene;
    const original = scene.add.text;
    const language = () => scene.registry.get('services').progress.data.settings.language;
    scene.add.text = function (x, y, source, style) {
      const object = original.call(this, x, y, translate(source, language()), style);
      const setText = object.setText;
      object.setText = function (value) { this.sourceText = value; return setText.call(this, translate(value, language())); };
      object.sourceText = source;
      return object;
    };
    scene.events.once('destroy', () => { scene.add.text = original; });
  }
}
