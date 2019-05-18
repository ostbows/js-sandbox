import * as PIXI from 'pixi.js';
import {tileWidth, tileHeight} from '../config';

const Graphics = PIXI.Graphics;

class Level {
  constructor(app, easystar, grid) {
    this.app = app;
    this.grid = grid;

    easystar.setGrid(grid);
    easystar.setAcceptableTiles([0]);
  }

  draw() {
    const graphics = new Graphics();

    for (const i in this.grid) {
      for (const j in this.grid[i]) {
        const x = j*tileWidth;
        const y = i*tileHeight;
        const color = this.grid[i][j] ? 0x000000 : 0xFFFFFF;

        graphics.lineStyle(2, 0xFEEB77, 1);
        graphics.beginFill(color);
        graphics.drawRect(x, y, tileWidth, tileHeight);
        graphics.endFill();
      }
    }

    this.app.stage.addChild(graphics);
  }
}

export default Level;