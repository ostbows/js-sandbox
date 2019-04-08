import * as PIXI from 'pixi.js';
import EasyStar from 'easystarjs';
import TWEEN from '@tweenjs/tween.js';

import Grid from './entities/Grid';
import Player from './entities/Player';

import WhiteSquareJpg from './assets/white_square.jpg';
import CaptainAmericaPng from './assets/captain_america.png';

const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

const easystar = new EasyStar.js();
const grid = new Grid(app, easystar);
const player = new Player(app, easystar);

PIXI.loader
  .add('WhiteSquare', WhiteSquareJpg)
  .add('CaptainAmerica', CaptainAmericaPng)
  .load(setup);

function setup() {
  grid.generate();
  player.start();
  requestAnimationFrame(update);
}

function update(delta) {
  requestAnimationFrame(update);
  easystar.calculate();
  TWEEN.update(delta);
}