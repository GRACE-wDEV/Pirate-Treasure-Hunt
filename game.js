//Starts at 15/12/2024  
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game Settings
const canvasWidth = 800;
const canvasHeight = 600;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Game Stating
let ship = { x: 400, y: 500, width: 40, height: 40, speed: 3 };
let treasures = [];
let obstacles = [];
let score = 0;
let health = 3;
let isGameOver = false;
let speedBoostActive = false;
let speedBoostTimeout = null;

// Manage High Score
let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore")) : 0;


function spawnTreasures() {
  for (let i = 0; i < 5; i++) {
    treasures.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight / 2,
      width: 30,
      height: 30,
    });
  }
}

function spawnObstacles() {
  for (let i = 0; i < 3; i++) { 
    obstacles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight / 2,
      width: 50,
      height: 50,
      speed: 1.5 + Math.random() * 2,
    });
  }
}

spawnTreasures();
spawnObstacles();

function drawShip() {
  ctx.fillStyle = "lightblue";
  ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
}

function drawTreasures() {
  ctx.fillStyle = "gold";
  treasures.forEach((treasure) => {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillRect(treasure.x, treasure.y, treasure.width, treasure.height);
    ctx.restore();
  });
}

function drawObstacles() {
  ctx.fillStyle = "darkred";
  obstacles.forEach((obstacle) => {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    ctx.restore();
  });
}

function drawScoreAndHealth() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Health: ${health}`, 10, 50);
  ctx.fillText(`High Score: ${highScore}`, canvasWidth - 150, 20);
}

function updateObstacles() {
  obstacles.forEach((obstacle) => {
    obstacle.y += obstacle.speed;
    if (obstacle.y > canvasHeight) {
      obstacle.y = 0;
      obstacle.x = Math.random() * canvasWidth;
    }

    // Check ship's collision 
    if (
      ship.x < obstacle.x + obstacle.width &&
      ship.x + ship.width > obstacle.x &&
      ship.y < obstacle.y + obstacle.height &&
      ship.height + ship.y > obstacle.y
    ) {
      health -= 1;
      obstacle.y = 0;
      obstacle.x = Math.random() * canvasWidth;
      ctx.fillStyle = "red";
      ctx.globalAlpha = 0.3;
      ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
      ctx.globalAlpha = 1;
      playCollisionSound();
    }
  });
}

function updateTreasures() {
  treasures = treasures.filter((treasure) => {
    if (
      ship.x < treasure.x + treasure.width &&
      ship.x + ship.width > treasure.x &&
      ship.y < treasure.y + treasure.height &&
      ship.height + ship.y > treasure.y
    ) {
      score += 10;
      ctx.fillStyle = "gold";
      ctx.globalAlpha = 0.5;
      ctx.fillRect(treasure.x, treasure.y, treasure.width, treasure.height);
      ctx.globalAlpha = 1;
      playCollectSound();
      return false;
    }
    return true;
  });

  if (treasures.length === 0) {
    spawnTreasures();
  }
}

// Sound Effects
function playCollisionSound() {
  let audio = new Audio('sounds/collision.wav');  
  audio.play();
}

function playCollectSound() {
  let audio = new Audio("sounds/collection.wav");
  audio.play();
}

// Game Loop
function gameLoop() {
  if (isGameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvasWidth / 2 - 100, canvasHeight / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Restart", canvasWidth / 2 - 100, canvasHeight / 2 + 40);
    return;
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  drawShip();
  drawTreasures();
  drawObstacles();
  drawScoreAndHealth();

  updateObstacles();
  updateTreasures();

  if (health <= 0) {
    isGameOver = true;
    checkForWin(); 
  }

  requestAnimationFrame(gameLoop);
}

function checkForWin() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore); 
  }
}

// Controls
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && ship.x > 0) ship.x -= ship.speed;
  if (e.key === "ArrowRight" && ship.x + ship.width < canvasWidth) ship.x += ship.speed;
  if (e.key === "ArrowUp" && ship.y > 0) ship.y -= ship.speed;
  if (e.key === "ArrowDown" && ship.y + ship.height < canvasHeight) ship.y += ship.speed;

  // Temporary speed boost by clicking 's'
  if (e.key === "s" && !speedBoostActive) {
    speedBoostActive = true;
    ship.speed *= 2; 
    clearTimeout(speedBoostTimeout);
    speedBoostTimeout = setTimeout(() => {
      ship.speed /= 2; 
      speedBoostActive = false;
    }, 3000); 
  }

  if (e.key === "r" && isGameOver) {
    resetGame();
  }
});

// Reset Game
function resetGame() {
  ship.x = 400;
  ship.y = 500;
  treasures = [];
  obstacles = [];
  score = 0;
  health = 3;
  isGameOver = false;
  spawnTreasures();
  spawnObstacles();
  gameLoop();
}

gameLoop(); 

