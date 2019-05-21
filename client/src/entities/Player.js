import * as PIXI from 'pixi.js';
import TWEEN from '@tweenjs/tween.js';

import {tileWidth, tileHeight, pathDuration} from '../config';

const resources = PIXI.loader.resources,
      Sprite = PIXI.Sprite;

export default class Player {
  constructor(app, easystar) {
    this.app = app;
    this.easystar = easystar;
    this.sprite = null;
    this.pathId = null;
    this.path = [];
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
      if (!this.pathId) this.findPath(event.data.global);
    });
  }

  compressPath(path) {
    const compressedPath = [];

    let lastDirX = 0;
    let lastDirY = 0;

    for (let i = 0; i < path.length; i++) {
      if (i >= path.length - 1) {
        compressedPath.push(path[i]);
        break;
      }

      const dirX = path[i+1].x - path[i].x;
      const dirY = path[i+1].y - path[i].y;

      if (dirX !== lastDirX || dirY !== lastDirY) {
        compressedPath.push({x: path[i].x, y: path[i].y});
      }

      lastDirX = dirX;
      lastDirY = dirY;
    }

    return compressedPath;
  }

  addPathDuration(path) {
    const distUnit = 1;

    for (let i = 1; i < path.length; i++) {
      let distX = Math.abs(path[i].x - path[i-1].x);
      let distY = Math.abs(path[i].y - path[i-1].y);

      let duration = pathDuration;

      if (distX > 0 && distY > 0) {
        duration = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2)) / distUnit * duration;
      } else {
        duration = ((distX || distY) / distUnit) * duration;
      }

      path[i-1].duration = duration;
    }
  }

  findPath(destination) {
    this.pathId = this.easystar.findPath(
      Math.floor(this.sprite.x / tileWidth),
      Math.floor(this.sprite.y / tileHeight),
      Math.floor(destination.x / tileWidth),
      Math.floor(destination.y / tileHeight),
      path => {
        if (path) {
          const compressedPath = this.compressPath(path);
          this.addPathDuration(compressedPath);
          this.path = this.path.concat(compressedPath);
          this.tweenPath();
        }
      });
  }

  getTileOrigo(pathNode) {
    return {
      x: pathNode.x * tileWidth + tileWidth / 2,
      y: pathNode.y * tileHeight + tileHeight / 2
    }
  }

  tweenPath() {
    if (this.path.length > 1) {
      const from = this.path.shift();
      const coords = {x: this.sprite.x, y: this.sprite.y};
      this.tween = new TWEEN.Tween(coords)
        .onUpdate(() => this.sprite.position.set(coords.x, coords.y))
        .onComplete(() => this.tweenPath())
        .to(this.getTileOrigo(this.path[0]), from.duration)
        .start();
    } else {
      this.path = [];
      this.pathId = null;
    }
  }
}