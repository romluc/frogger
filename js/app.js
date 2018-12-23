// Setting constants for the player's initial position
const BLOCK_W = 101;
const BLOCK_H = 83;

// Initial coordinates of center block of bottom row (#27)
const INITIAL_X = 202;
const INITIAL_Y = 405
const INITIAL_BLOCK = 27;

// Setting constants for the canvas borders
const CANVAS_BOTTOM_BORDER = 357;
const CANVAS_RIGHT_BORDER = 404;
const CANVAS_TOP_BORDER = 0;
const CANVAS_LEFT_BORDER = 0;

// Constants used to gauge character movement
const FW_STEP = 83;
const BW_STEP = 83;
const LEFT_STEP = 101;
const RIGHT_STEP = 101;

// Adapting degree of movement to the degree of movement
const CANVAS_Y_OFFSET = 50;
const CANVAS_X_OFFSET = 70;

const ENEMY_WIDTH = BLOCK_W;

var blockCol = 0;
var blockRow = 0;
var blockUnderPlayer = 0;
var playerWon;

// Enemies to be avoided by our character
var Enemy = function(x, y, speed) {
  this.x = x;
  this.y = y
  this.block;
  this.speed = speed;
  this.sprite = 'images/enemy-bug.png';
};

// Update enemies position, multiplying their moves by a time interval (dt)
// so the game speed will be the same regardless CPU capacity
Enemy.prototype.update = function(dt) {
  this.x += this.speed * dt;

  // Reset bugs' X coordinate so they "enter canvas" again,
  // with different speed each time
  if (this.x > CANVAS_RIGHT_BORDER + ENEMY_WIDTH) {
    this.x = CANVAS_LEFT_BORDER - ENEMY_WIDTH;

    // Randomize enemies' speeds
    this.speed = 100 + Math.floor(Math.random() * 200);
  }

  // Updates positions taking into account rows, columns
  // and translating it to block number
  blockCol = Math.floor((this.x + CANVAS_X_OFFSET) / BLOCK_W);
  blockRow = Math.floor((this.y + CANVAS_Y_OFFSET) / BLOCK_H);
  this.block = rowColToBlock(blockRow, blockCol);
};

// Draw Enemy instances based on the image file and position coordinates
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// This function checks player and bug positions (blocks) for a collision.
// In this case, the player is set back to initial position
Enemy.prototype.handleCollision = function() {
  if (player.getBlock() == this.getBlock()) {
    hitSound.play();
    player.setX(INITIAL_X);
    player.setY(INITIAL_Y);
    player.setBlock(27);
  }
}


// Enemy class getter and setter
Enemy.prototype.getBlock = function() {
  return this.block;
}

Enemy.prototype.setBlock = function(block) {
  this.block = block;
}

// Player class
var Player = function() {
  this.x = INITIAL_X;
  this.y = INITIAL_Y;
  this.block = INITIAL_BLOCK;

  this.sprite = 'images/char-cat-girl.png';
  // boolean to be switched to true upon player winning so game can be reset
  this.won = false;

};

Player.prototype.update = function() {
  blockCol = Math.floor(this.x / BLOCK_W);
  blockRow = Math.floor((this.y + CANVAS_Y_OFFSET) / BLOCK_H);
  this.block = rowColToBlock(blockRow, blockCol);

  if (this.won) {
    this.reset();
  }

};

Player.prototype.reset = function() {
  this.x = INITIAL_X;
  this.y = INITIAL_Y;
  this.block = INITIAL_BLOCK;
  this.won = false;
}

// Player class getters and setters
Player.prototype.getBlock = function() {
  return this.block;
}

Player.prototype.setBlock = function(block) {
  this.block = block;
}

Player.prototype.getX = function() {
  return this.x;
}

Player.prototype.setX = function(x) {
  this.x = x;
}

Player.prototype.getY = function() {
  return this.y;
}

Player.prototype.setY = function(y) {
  this.y = y;
}



// Draws players instances based on image file and position coordinates
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(move) {
  // handling the keyboard input to move the player
  // updating x and y, depending on the direction
  // and preventing player to get off the canvas
  if (move == 'left' && this.x > CANVAS_LEFT_BORDER) {
    this.x -= LEFT_STEP;
    jumpSound.play();
  }
  if (move == 'right' && this.x < CANVAS_RIGHT_BORDER) {
    this.x += RIGHT_STEP;
    jumpSound.play();
  }
  if (move == 'up' && this.y > CANVAS_TOP_BORDER) {
    this.y -= FW_STEP;
    jumpSound.play();
  }
  if (move == 'down' && this.y < CANVAS_BOTTOM_BORDER) {
    this.y += BW_STEP;
    jumpSound.play();
  }
};

// Player, Enemy and Sound's objects being instanced
// allEnemies array created to receive enemies instances
let allEnemies = new Array();

// Each enemy instance is created using randomization for its X coordinate.
// Instances' Y coordinate is set to keep each one within its row, and initial
// speed to be randomized is set to a different value for each
let enemy1 = new Enemy(Math.floor(Math.random() * 400), BLOCK_H - 20, 100);
let enemy2 = new Enemy(Math.floor(Math.random() * 400), 2 * BLOCK_H - 20, 50);
let enemy3 = new Enemy(Math.floor(Math.random() * 400), 3 * BLOCK_H - 20, 80);

// Instances are kept in an array, as requested
allEnemies.push(enemy1);
allEnemies.push(enemy2);
allEnemies.push(enemy3);

// Creating an instance of Class Player to be our character
let player = new Player();

// Creating sound elements for player moves, bugs collisions (loses) and
// for when the player gets to the water (wins)
var jumpSound = new Sound("gameAudio-effects/Jump2.mp3");
var hitSound = new Sound("gameAudio-effects/hit.ogg");
var waterSound = new Sound("gameAudio-effects/water.mp3");

// Translating row x col position to block notation (entire 5 x 6 grid is mapped through 0-29)
function rowColToBlock(row, col) {
  return col + 5 * row;
}

// Whenever player gets to the water (any of the top blocks), boolean goes true,
// water sound plays and player wins, going back to initial position
function checkVictory() {
  for (let i = 0; i < 5; i++) {
    if (player.block === i) {
      waterSound.play();
      player.won = true;
    }
  }
}

// Sound class
// Its instances are called upon game beginning
// and are linked to specific moments -
// player moves, bug collisions and water splash
function Sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function() {
    // reinitiate the sound if there's still something playing
    this.sound.currentTime = 0;
    // plays the current sound
    this.sound.play();
  }
  this.stop = function() {
    this.sound.pause();
  }
}


// Function to handle player moves based on keyboad input
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  // Calls function to move player based on keyboard input
  player.handleInput(allowedKeys[e.keyCode]);
});
