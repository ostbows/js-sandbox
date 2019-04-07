import * as PIXI from 'pixi.js';
import hotkeys from 'hotkeys-js';
import TWEEN from '@tweenjs/tween.js';
import {tileWidth, tileHeight} from './config';

const resources = PIXI.loader.resources,
      Sprite = PIXI.Sprite;

export default class Player {
  constructor(app, easystar) {
    this.app = app;
    this.easystar = easystar;
    this.sprite = null;
    this.pathId = null;
    this.pathIv = null;
    this.cancelPath = false;
  }

  start() {
    this.setSprite();
    this.bindEvents();
  }

  setSprite() {
    const sprite = new Sprite(resources['assets/captain_america.png'].texture);
    sprite.anchor.set(0.5);
    sprite.position.set(tileWidth/2, tileHeight/2);
    sprite.width = 64;
    sprite.height = 64;

    this.app.stage.addChild(sprite);
    this.sprite = sprite;
  }

  bindEvents() {
    this.app.renderer.plugins.interaction.on('pointerup', event => {
      if (!this.pathId) return this.findPath(event.data.global);

      this.cancelPath = true;
      this.easystar.cancelPath(this.pathId);

      clearInterval(this.pathIv);
      this.pathIv = setInterval(() => {
        if (!this.pathId) {
          clearInterval(this.pathIv);
          this.findPath(event.data.global);
        }
      }, 50);
    });

    hotkeys('space', event => {
      event.preventDefault();
      this.cancelPath = true;
      this.easystar.cancelPath(this.pathId);
    });
  }

  findPath(destination) {
    this.pathId = this.easystar.findPath(
      Math.floor(this.sprite.x/tileWidth),
      Math.floor(this.sprite.y/tileHeight),
      Math.floor(destination.x/tileWidth),
      Math.floor(destination.y/tileHeight),
      path => {
        if (path) this.tweenPath(path);
      });
  }

  tweenPath(path) {
    path.shift();
    if (path.length) {
      const coords = {x: this.sprite.x, y: this.sprite.y};
      const tween = new TWEEN.Tween(coords)
        .onUpdate(() => this.sprite.position.set(coords.x, coords.y))
        .onComplete(() => {
          if (this.cancelPath) {
            this.cancelPath = false;
            this.pathId = null;
          } else {
            this.tweenPath(path);
          }
        });
      tween.to({
        x: path[0].x*tileWidth+tileWidth/2,
        y: path[0].y*tileHeight+tileHeight/2
      }, 1000).start();
    } else {
      this.pathId = null;
    }
  }
}