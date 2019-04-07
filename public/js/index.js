const Application = PIXI.Application,
      loader = PIXI.loader,
      resources = PIXI.loader.resources,
      Sprite = PIXI.Sprite;

const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

const easystar = new EasyStar.js();
const tileWidth = 64;
const tileHeight = 64;

let player, pathId, pathIv;
let cancelPath = false;

loader
  .add('assets/captain_america.png')
  .add('assets/white_square.jpg')
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
    if (!pathId) return findPath(event.data.global);

    cancelPath = true;
    easystar.cancelPath(pathId);

    clearInterval(pathIv);
    pathIv = setInterval(function() {
      if (!pathId) {
        clearInterval(pathIv);
        findPath(event.data.global);
      }
    }, 50);
  });

  hotkeys('space', function(event) {
    event.preventDefault();
    cancelPath = true;
    easystar.cancelPath(pathId);
  });
}

function findPath(destination) {
  pathId = easystar.findPath(
    Math.floor(player.x/tileWidth),
    Math.floor(player.y/tileHeight),
    Math.floor(destination.x/tileWidth),
    Math.floor(destination.y/tileHeight),
    function(path) {
      if (path) tweenPath(path);
    });
}

function tweenPath(path) {
  path.shift();
  if (path.length) {
    const coords = {x: player.x, y: player.y};
    const tween = new TWEEN.Tween(coords)
      .onUpdate(function() {
        player.position.set(coords.x, coords.y);
      })
      .onComplete(function() {
        if (cancelPath) {
          cancelPath = false;
          pathId = null;
        } else {
          tweenPath(path);
        }
      });
    tween.to({
      x: path[0].x*tileWidth+tileWidth/2,
      y: path[0].y*tileHeight+tileHeight/2
    }, 1000).start();
  } else {
    pathId = null;
  }
}

function squaresInit() {
  const squaresX = Math.ceil(app.screen.width/tileWidth);
  const squaresY = Math.ceil(app.screen.height/tileHeight);
  const grid = [];
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
      app.stage.addChild(square);
    }
    grid.push(row);
  }
  easystar.setGrid(grid);
  easystar.setAcceptableTiles([0]);
}

function playerInit() {
  player = new Sprite(resources['assets/captain_america.png'].texture);
  player.anchor.set(0.5);
  player.position.set(tileWidth/2, tileHeight/2);
  player.width = 64; player.height = 64;
  app.stage.addChild(player);
}