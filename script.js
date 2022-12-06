// OBSTACLES AND COLOR

/*

Thank you to the following for the basic pong template code to base my project off of:

https://www.geeksforgeeks.org/pong-game-in-javascript/

https://github.com/CodeExplainedRepo/Ping-Pong-Game-JavaScript

These links provided the basic code to base my version of pong.  The main features from the template are the game loop and collisions.

*/

// select canvas element
const canvas = document.getElementById("pong");

// getContext of canvas = methods and properties to draw and do a lot of thing to the canvas
const ctx = canvas.getContext('2d');

// True if the game is running, false if not
var running = true;

// The paddle width and height
const paddleWidth = 20;
const paddleHeight = 80;

// The distance the paddles are from the edges
const distFromEdge = 25;

// The radius of the center circle
const centerRadius = 75;

// The speed of the ball
const ballSpeed = 10;

// The horizontal and vertical velocities
const hVel = 12;
const vVel = 12;

// The color of the objects
const objectColor = "white";

// The initial time the current game started, in milliseconds
var startTime = Date.now();

// The total number of seconds before the game starts
const waitTime = 3;

// The pause time after a goal has been scored
var pauseTime = Date.now();

// The total time, in seconds, to wait before resuming the game after a goal has been scored
const goalWaitTime = 1.5;

// True if pause time after goal is completed, false if not
var goalResetReady = true;

// True if game has started, false if not
var startGame = false;

// The max score a player can obtain before the game is reset
const maxScore = 7;

// Pause the mouse position if the game is not running
var lastMouseX = 0;
var lastMouseY = 0;

// Pause button object
const pause = {
  x1 : 15,
  x2: 25,
  y : 15,
  width: 5,
  height: 20,
  color : objectColor,
}

// Ball object
const ball = {
    x : canvas.width / 2,
    y : canvas.height / 2,
    radius : 10,
    velocityX : 0,
    velocityY : 0,
    speed : 0,
    color : objectColor
}

// User Paddle
const user = {
    x : distFromEdge, // left side of canvas
    y : (canvas.height - paddleHeight) / 2, // -100 the height of paddle
    width : paddleWidth,
    height : paddleHeight,
    score : 0,
    color : objectColor
}

// COM Paddle
const com = {
    x : canvas.width - paddleWidth - distFromEdge, // - width of paddle
    y : (canvas.height - paddleHeight)/2, // -100 the height of paddle
    width : paddleWidth,
    height : paddleHeight,
    score : 0,
    color : objectColor
}

// NET
const net = {
    x : (canvas.width - 2) / 2,
    y : 0,
    height : 10,
    width : 2,
    color : objectColor
}

// Class for barriers; barriers will bounce the ball back in the opposite direction
class Barrier {
  // Instantiates a new barrier object
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    
    this.moveUp = true;
    this.movementSpeed = 5;
  }
  
  // Collisions between the barrier and the ball
  ballBarCollision() {
    const barTop = this.y;
    const barBottom = this.y + this.height;
    const barLeft = this.x;
    const barRight = this.x + this.width;
    
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    
    return barLeft < ballRight && barTop < ballBottom && barRight > ballLeft && barBottom > ballTop;
  }
  
  // Bounces the ball back if a collision occurs
  bounceBallBack() {
    if(this.ballBarCollision()) {
      ball.velocityX *= -1;
      ball.velocityY *= -1;
    }
  }
  
  // Moves the barrier vertically
  moveBarrier() {
    if(this.moveUp)
      this.y -= this.movementSpeed;
    else
      this.y += this.movementSpeed;
    
    if(this.y < 0) {
      this.y = 0;
      this.moveUp = false;
    } else if(this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.moveUp = true;
    }
  }
  
  // Calls all of the updatable functions for the barrier
  updateBarrier() {
    this.bounceBallBack();
    this.moveBarrier();
  }
  
  // Draws the barrier
  drawBarrier() {
    // x, y, w, h, color
    drawRect(this.x, this.y, this.width, this.height, this.color);
  }
}

/* All of the barriers */
const playerBarrier = new Barrier(canvas.width * 0.25 - 10, canvas.height * 0.25, 20, 40, "white");
const opponentBarrier = new Barrier(canvas.width * 0.75 - 10, canvas.height * 0.75, 20, 40, "white");

// Calculates a random integer number
function calculateRandInt(lBound, uBound) {
  return Math.floor(Math.random() * ((uBound - lBound) + 1) + lBound);
}

// Draw the pause button
function drawPauseButton() {
  drawRect(pause.x1, pause.y, pause.width, pause.height, pause.color);
  drawRect(pause.x2, pause.y, pause.width, pause.height, pause.color);
}

// draw a rectangle, will be used to draw paddles
function drawRect(x, y, w, h, color){
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// draw circle, will be used to draw the ball
function drawArc(x, y, r, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
}

// Draw the center circle for the background
function drawCenterCircle(radius) {
    ctx.strokeStyle = net.color;
    ctx.beginPath();
    ctx.arc(net.x, canvas.height / 2, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.stroke();
}

// listening to the mouse
canvas.addEventListener("mousemove", getMousePos);
canvas.addEventListener("click", getMouseClick);

function getMousePos(evt){
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
}

function getMouseClick(evt) {
  let rect = canvas.getBoundingClientRect();
  if(running) {
    if(evt.clientX >= pause.x1 + rect.left && evt.clientX <= pause.x2 + pause.width + rect.left) {
      if(evt.clientY >= pause.y + rect.top && evt.clientY <= pause.y + pause.height + rect.top) {
        running = false;
      }
    }
  } else {
    running = true;
  }
}

// when COM or USER scores, we reset the ball
function resetBall(){
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = 0;
    ball.velocityY = 0;
    ball.speed = -1;
    pauseTime = Date.now();
    goalResetReady = true;
}

// Wait time before the game resumes after a goal has been scored
function calculateWaitTime() {
  if((Date.now() - pauseTime) / 1_000 >= goalWaitTime && goalResetReady && startGame) {
    goalResetReady = false;
    ball.velocityX = calculateRandInt(-1, 1) * hVel;
    if (ball.velocityX == 0)
      ball.velocityX = -hVel;
    ball.velocityY = calculateRandInt(-1, 1) * vVel;
    if (ball.velocityY == 0)
      ball.velocityY = vVel;
    ball.speed = ballSpeed;
  }
}

// draw the net
function drawNet(){
    for(let i = 0; i <= canvas.height; i += 15){
        drawArc(net.x + net.width / 2, net.y + i, (net.width + net.height) / 4, net.color);
    }
}

// draw text
function drawText(text, x, y, size, color){
    ctx.fillStyle = color;
    ctx.font = size + "px fantasy";
    ctx.fillText(text, x - size / 4, y + size / 4);
}

// Display countdown timer
function countDown() {
  if((Date.now() - startTime) / 1_000 >= waitTime){
    startGame = true;
  }
}

// Displays the countdown timer
function displayCountDown() {
  let curTime = 3 - (Date.now() - startTime) / 1_000;
  if(curTime > 0) {
      const percent = curTime - Math.floor(curTime);
      const mid = (canvas.width + canvas.height) / 2;
      const textSize = mid * percent;
      const alpha = percent <= 0.45 ? percent * 2 : 1;
      drawText(Math.ceil(curTime), net.x, canvas.height / 2, textSize + "", "rgba(255, 255, 255, " + alpha + ")");
  }
}

// Resets the game after a certain score has been reached
function resetGame() {
  startTime = Date.now();
  pauseTime = Date.now();
  goalResetReady = true;
  startGame = false;
  
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocityX = 0;
  ball.velocityY = 0;
  ball.speed = 0;
  
  user.x = distFromEdge;
  user.y = (canvas.height - paddleHeight) / 2;
  user.score = 0;
  
  com.x = canvas.width - paddleWidth - distFromEdge;
  com.y = (canvas.height - paddleHeight) / 2;
  com.score = 0;
}

// collision detection
function collision(b, p){
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
    
    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

// update function, the function that does all calculations
function update() {
  // Start game when appropriate
  countDown();
  if(startGame) {
    if(ball.speed == 0 && ball.velocityX == 0 && ball.velocityY == 0) {
      ball.speed = ballSpeed;
      ball.velocityX = hVel;
      ball.velocityY = vVel;
    }
  }
  
  playerBarrier.updateBarrier();
  opponentBarrier.updateBarrier();
    
    // change the score of players, if the ball goes to the left "ball.x<0" computer win, else if "ball.x > canvas.width" the user win
    if( ball.x - ball.radius < 0 ){
        com.score++;
        resetBall();
    }else if( ball.x + ball.radius > canvas.width){
        user.score++;
        resetBall();
    }
  
    calculateWaitTime();
    
    // the ball has a velocity
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // computer plays for itself, and we must be able to beat it
    // simple AI
    com.y += ((ball.y - (com.y + com.height/2)))*0.1;
    
    // when the ball collides with bottom and top walls we inverse the y velocity.
    /*if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height){
        ball.velocityY = -ball.velocityY;
    }*/
  if(ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.velocityY = -ball.velocityY;
  } else if(ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.velocityY = -ball.velocityY;
  }
    
    // we check if the paddle hit the user or the com paddle
    let player = (ball.x + ball.radius < canvas.width/2) ? user : com;
    
    // if the ball hits a paddle
    if(collision(ball, player)) {
      
        // we check where the ball hits the paddle
        let collidePoint = (ball.y - (player.y + player.height / 2));
        // normalize the value of collidePoint, we need to get numbers between -1 and 1.
        // -player.height/2 < collide Point < player.height/2
        collidePoint = collidePoint / (player.height / 2);
        
        // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
        // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
        // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
        // Math.PI/4 = 45degrees
        let angleRad = (Math.PI / 4) * collidePoint;
        
        // change the X and Y velocity direction
        let direction = (ball.x + ball.radius < canvas.width/2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // speed up the ball everytime a paddle hits it.
        ball.speed += 0.5;
    }
  
    if(user.score >= maxScore || com.score >= maxScore) {
      resetGame();
    }
  
  lastMouseX = user.x;
  lastMouseY = user.y;
}

// render function, the function that does all the drawing
function render() {
    
    // clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, "#000");
  
  // draw the pause button
  drawPauseButton()
  
  // draw the countdown timer
  displayCountDown()
  
  playerBarrier.drawBarrier();
  opponentBarrier.drawBarrier();
    
    // draw the user score to the left
    drawText(user.score, canvas.width / 4, canvas.height / 5, "75", "rgb(255, 255, 255)");
    
    // draw the COM score to the right
    drawText(com.score, 3 * canvas.width / 4, canvas.height / 5, "75", "rgb(255, 255, 255)");
    
    // draw the center circle
    drawCenterCircle(centerRadius)
  
    // draw the net
    drawNet();
    
    // draw the user's paddle
  if(running)
    drawRect(user.x, user.y, user.width, user.height, user.color);
  else
    drawRect(lastMouseX, lastMouseY, user.width, user.height, user.color);
  
  // draw the COM's paddle
    drawRect(com.x, com.y, com.width, com.height, com.color);
    
    // draw the ball
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}
function game(){
  if(running) {
    update();
    render();
  } else {
    render();
    drawRect(0, 0, canvas.width, canvas.height, "rgba(0, 0, 0, 0.5)");
    drawText("Click Anywhere to Resume Game", canvas.width / 5, canvas.height / 2, "50", "white");
  }
}
// number of frames per second
let framePerSecond = 60;

//call the game function 50 times every 1 Sec
let loop = setInterval(game, 1_000 / framePerSecond);
