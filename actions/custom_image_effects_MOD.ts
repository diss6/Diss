import type { Action } from '../typings/globals';
import * as Jimp from 'jimp';

const action: Action<'storage' | 'varName' | 'effect' | 'intensity'> = {
  name: 'Custom Image Effects',
  section: 'Image Editing',
  fields: ['storage', 'varName', 'effect', 'intensity'],

  subtitle(data) {
    const storeTypes = ['', 'Temp Variable', 'Server Variable', 'Global Variable'];
    const effect = ['Custom Blur', 'Custom Pixelate'];
    return `${storeTypes[parseInt(data.storage, 10)]} (${data.varName}) -> ${effect[parseInt(data.effect, 10)]} ${
      data.intensity
    }`;
  },

  html(_isEvent, data) {
    return `
<div>
  <div style="float: left; width: 45%;">
    Base Image:<br>
    <select id="storage" class="round" onchange="glob.refreshVariableList(this)">
      ${data.variables[1]}
    </select>
  </div>
  <div id="varNameContainer" style="float: right; width: 50%;">
    Variable Name:<br>
    <input id="varName" class="round" type="text" list="variableList"><br>
  </div>
</div><br><br><br>
<div style="padding-top: 8px;">
  <div style="float: left; width: 90%;">
    Effect:<br>
    <select id="effect" class="round">
      <option value="0" selected>Custom Blur</option>
      <option value="1">Custom Pixelate</option>
    </select><br>
  </div>
  <div id="intensityContainer" style="float: left; width: 50%;">
    Intensity:<br>
    <input id="intensity" class="round" type="text"><br>
  </div>
</div>`;
  },

  init(this: any) {
    const { glob, document } = this;
    glob.refreshVariableList(document.getElementById('storage'));
  },

  action(cache) {
    const { Actions } = this.getDBM();
    const data = cache.actions[cache.index];

    const storage = parseInt(data.storage, 10);
    const varName = this.evalMessage(data.varName, cache);
    const image = this.getVariable(storage, varName, cache);
    const intensity = parseInt(data.intensity, 10);

    if (!image) return this.callNextAction(cache);

    void Jimp.read(image, (err: any, image1: any) => {
      if (err) return console.error('Error with custom image effects: ', err);
      const effect = parseInt(data.effect, 10);
      switch (effect) {
        case 0:
          image1.blur(intensity);

          image1.getBuffer(Jimp.MIME_PNG, (error: any, image2: any) => {
            if (err) return console.error('Error with custom image effects: ', error);

            Actions.storeValue(image2, storage, varName, cache);
            Actions.callNextAction(cache);
          });

          break;
        case 1:
          image1.pixelate(intensity);
          image1.getBuffer(Jimp.MIME_PNG, (error: any, image2: any) => {
            if (err) return console.error('Error with custom image effects: ', error);

            Actions.storeValue(image2, storage, varName, cache);
            Actions.callNextAction(cache);
          });
          break;
        default:
          break;
      }
    });
  },

  mod() {},
};

module.exports = action;
