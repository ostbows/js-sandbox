import * as PIXI from 'pixi.js';
import hotkeys from 'hotkeys-js';
import TWEEN from '@tweenjs/tween.js';

import {tileWidth, tileHeight, playerTweenTime} from '../config';

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

  init() {
    this.setSprite();
    this.bindEvents();
  }

  setSprite() {
    const sprite = new Sprite(resources['CaptainAmerica'].texture);
    sprite.anchor.set(0.5);
    sprite.position.set(tileWidth/2, tileHeight/2);
    sprite.width = 50;
    sprite.height = 50;

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

  getDistanceToNextTile(path) {
    return {
      x: Math.abs(this.sprite.x - (path[0].x*tileWidth+32)),
      y: Math.abs(this.sprite.y - (path[0].y*tileHeight+32))
    };
  }

  getTweenTime(path) {
    let tweenTime = playerTweenTime;

    if (!path.length) return tweenTime;

    let distance = this.getDistanceToNextTile(path);

    const pathOrigin = path.shift();

    if (distance.x > 0 || distance.y > 0) {
      let timeMultiplier = distance.x/tileWidth + distance.y/tileHeight;

      distance = this.getDistanceToNextTile(path);

      if (distance.x > 0 && distance.y > 0) {
        path.unshift(pathOrigin);
      } else {
        timeMultiplier = distance.x/tileWidth + distance.y/tileHeight;
      }

      tweenTime *= timeMultiplier;
    }

    return tweenTime;
  }

  tweenPath(path) {
    const tweenTime = this.getTweenTime(path);

    if (path.length) {
      const coords = {x: this.sprite.x, y: this.sprite.y};
      const tween = new TWEEN.Tween(coords)
        .onUpdate(() => {
          if (this.cancelPath) {
            this.cancelPath = false;
            this.pathId = null;
            tween.stop();
          } else {
            this.sprite.position.set(coords.x, coords.y);
          }
        })
        .onComplete(() => this.tweenPath(path));

      tween.to({
        x: path[0].x*tileWidth+tileWidth/2,
        y: path[0].y*tileHeight+tileHeight/2
      }, tweenTime).start();
    } else {
      this.pathId = null;
    }
  }
}