import * as PIXI from 'pixi.js';
import EasyStar from 'easystarjs';
import TWEEN from '@tweenjs/tween.js';

import Level from './entities/Level';
import Player from './entities/Player';

import level0 from './levels/level0';
import CaptainAmericaPng from './assets/captain_america.png';

const app = new PIXI.Application(320, 320);
document.body.appendChild(app.view);

const easystar = new EasyStar.js();
const player = new Player(app, easystar);
const level = new Level(app, easystar, level0());

PIXI.loader
  .add('CaptainAmerica', CaptainAmericaPng)
  .load(setup);

function setup() {
  level.draw();
  player.init();

  app.ticker.add(() => {
    easystar.calculate();
    TWEEN.update(PIXI.ticker.shared.lastTime);
  });
}