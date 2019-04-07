import * as PIXI from 'pixi.js';
import {tileWidth, tileHeight} from './config';

const resources = PIXI.loader.resources,
      Sprite = PIXI.Sprite;

export default class Grid {
  constructor(app, easystar) {
    this.app = app;
    this.easystar = easystar;
  }

  generate() {
    const grid = [];
    const squaresX = Math.ceil(this.app.screen.width/tileWidth);
    const squaresY = Math.ceil(this.app.screen.height/tileHeight);

    for (let i = 0; i < squaresY; i++) {
      const row = [];
      for (let j = 0; j < squaresX; j++) {
        let square;
        if (j % 3 === 1 && Math.random() > 0.7) {
          square = new Sprite();
          row.push(1);
        } else {
          square = new Sprite(resources['assets/white_square.jpg'].texture);
          row.push(0);
        }
        square.width = tileWidth;
        square.height = tileHeight;
        square.position.set(j*tileWidth, i*tileHeight);
        this.app.stage.addChild(square);
      }
      grid.push(row);
    }

    this.easystar.setGrid(grid);
    this.easystar.setAcceptableTiles([0]);
  }
}