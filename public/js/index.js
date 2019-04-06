const Application = PIXI.Application,
      loader = PIXI.loader,
      resources = PIXI.loader.resources,
      Sprite = PIXI.Sprite;

const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

const easystar = new EasyStar.js();
const tileWidth = 64;
const tileHeight = 64;

let player, pathId;
const tweens = [];

loader
  .add('assets/captain_america.png')
  .add('assets/square.jpg')
  .load(setup);

function setup() {
  eventsInit();
  squaresInit();
  playerInit();
  requestAnimationFrame(update);
}

function update(delta) {
  requestAnimationFrame(update);
  easystar.calculate();
  TWEEN.update(delta);
}

function eventsInit() {
  app.renderer.plugins.interaction.on('pointerup', function(event) {
    const {x, y} = event.data.global;
    easystar.cancelPath(pathId);
    pathId = easystar.findPath(
      Math.floor(player.x/tileWidth),
      Math.floor(player.y/tileHeight),
      Math.floor(x/tileWidth),
      Math.floor(y/tileHeight),
      function(path) {
        if (!path) return;
        tweenPath(path);
      });
  });
}

function tweenPath(path) {
  path.splice(0,1);
  if (!path.length) return;
  const coords = {x: player.x, y: player.y};
  const tween = new TWEEN.Tween(coords)
    .to({x: path[0].x*tileWidth+32, y: path[0].y*tileHeight+32}, 1000)
    .onUpdate(function() {
      player.position.set(coords.x, coords.y);
    })
    .onComplete(function() {
      tweens.splice(0,1);
      tweenPath(path);
    })
    .start();
  tweens.push(tween);
}

function squaresInit() {
  const squaresX = Math.ceil(app.screen.width/tileWidth);
  const squaresY = Math.ceil(app.screen.height/tileHeight);
  const grid = [];
  for (let i = 0; i < squaresY; i++) {
    const row = [];
    for (let j = 0; j < squaresX; j++) {
      const square = new Sprite(resources['assets/square.jpg'].texture);
      square.width = tileWidth;
      square.height = tileHeight;
      square.position.set(j*tileWidth, i*tileHeight);
      app.stage.addChild(square);
      row.push(0);
    }
    grid.push(row);
  }
  easystar.setGrid(grid);
  easystar.setAcceptableTiles([0]);
}

function playerInit() {
  player = new Sprite(resources['assets/captain_america.png'].texture);
  player.anchor.set(0.5);
  player.position.set(32, 32);
  player.width = 64; player.height = 64;
  app.stage.addChild(player);
}