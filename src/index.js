import * as PIXI from 'pixi.js';
import EasyStar from 'easystarjs';
import TWEEN from '@tweenjs/tween.js';
import Player from './Player';
import Grid from './Grid';

const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

const easystar = new EasyStar.js();
const grid = new Grid(app, easystar);
const player = new Player(app, easystar);

PIXI.loader
  .add('assets/captain_america.png')
  .add('assets/white_square.jpg')
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