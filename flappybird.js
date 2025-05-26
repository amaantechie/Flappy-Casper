 
     // Board
     let board;
     let boardWidth = 400;
     let boardHeight = 640;
     let context;
 
     // Bird
     let birdWidth = 40;
     let birdHeight = 40;
     let birdX = boardWidth / 8;
     let birdY = boardHeight / 2;
     let birdImg;
 
     let bird = {
         x: birdX,
         y: birdY,
         width: birdWidth,
         height: birdHeight
     };
 
     // Pipes
     let pipeArray = [];
     let pipeWidth = 60;
     let pipeHeight = 500;
     let pipeX = boardWidth;
     let pipeY = 0;
 
     let topPipeImg;
     let bottomPipeImg;
 
 
     // Physics
     let velocityX = -2;
     let velocityY = 0;
     let gravity = 0.4;
 
     let gameOver = false;
     let gameOverFrame = 0;
     let canRetry = false;
     let countdown = 3;
 
     let score = 0;
     let highScore = localStorage.getItem("flappyHighScore") || 0;
 
     let wingSound = new Audio("sound/sfx_wing.wav");
    let hitSound = new Audio("sound/hit.mp3");
    let bgm = new Audio("sound/game_bgm2.mp3");
    bgm.loop = true;
 
     window.onload = function () {
         board = document.getElementById("board");
         board.height = boardHeight;
         board.width = boardWidth;
         context = board.getContext("2d");
 
         // Load images
         birdImg = new Image();
         birdImg.src = "images/ghost_02.png";
         birdImg.onload = function () {
             context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
         };
 
         topPipeImg = new Image();
         topPipeImg.src = "images/topbone.png";
 
         bottomPipeImg = new Image();
        bottomPipeImg.src = "images/bottombone.png";

 
         requestAnimationFrame(update);
         setInterval(placePipes, 1500);
         document.addEventListener("keydown", moveBird);
document.addEventListener("keydown", moveBird);
document.addEventListener("touchstart", function (e) {
    e.preventDefault();
    moveBird(e);
}, { passive: false });


     };
 
     function update() {
         requestAnimationFrame(update);
         if (gameOver) {
             bgm.pause();
             bgm.currentTime = 0;                        //music
             gameOverFrame++;
         }
 
         context.clearRect(0, 0, boardWidth, boardHeight);
 
         // Bird
         if (!gameOver) {
         velocityY += gravity;
         bird.y = Math.max(bird.y + velocityY, 0);
         }
         context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
 
 
         if (bird.y > board.height) {
             gameOver = true;
         }
 
         // Pipes
         for (let i = 0; i < pipeArray.length; i++) {
             let pipe = pipeArray[i];
         
             if (!gameOver) {
                 pipe.x += velocityX;
             }
         
             context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
         
 
             if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                 score += 0.5;
                 pipe.passed = true;
             }
 
             if (!gameOver && detectCollision(bird, pipe)) {
     hitSound.play();                    //music
                 gameOver = true;
             }
         }
 
         // Remove off-screen pipes
         while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
             pipeArray.shift();
         }
 
         // Score display
         context.fillStyle = "white";
         context.textAlign = "center";
         context.font = "50px sans-serif";
         context.fillText(Math.floor(score), 33, 50);
 
         if (gameOver) {
             // Save high score
             if (score > highScore) {
                 highScore = score;
                 localStorage.setItem("flappyHighScore", highScore);
             }
 
             // Allow retry after countdown ends
             if (gameOverFrame > 180) {
                 canRetry = true;
             }
 
             // Dim the screen
             context.fillStyle = "rgba(0, 0, 0, 0.5)";
             context.fillRect(0, 0, boardWidth, boardHeight);
 
             // Fade-in animation
             let opacity = Math.min(gameOverFrame / 30, 1);
             context.globalAlpha = opacity;
 
             context.fillStyle = "white";
             context.font = "50px sans-serif";
             context.fillText ("Game Over", boardWidth / 2, 160);
 
             context.font = "30px sans-serif";
             context.fillText("High Score: " + Math.floor(highScore), boardWidth / 2, 210);
 
             // Countdown display
             if (gameOverFrame % 60 === 0 && countdown > 0 && !canRetry) {
                 countdown--;
             }
 
             // Show countdown or retry option
             if (canRetry) {
                 let bounce = Math.sin(gameOverFrame / 10) * 5;
                 context.font = "25px sans-serif";
                 context.fillText("Press Space or Tap to Retry", boardWidth / 2, 270 + bounce);
             } else {
                 context.fillText("Retrying in " + countdown + "...", boardWidth / 2, 270);
             }
 
             context.globalAlpha = 1.0;
         }
    }
 
     function placePipes() {
         if (gameOver) return;
 
         let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
         let baseOpening = boardHeight / 4;
        let openingSpace = baseOpening + Math.random() * 30; // Adds slight variability
 
 
         let topPipe = {
             img: topPipeImg,
             x: pipeX,
             y: randomPipeY,
             width: pipeWidth,
             height: pipeHeight,
             passed: false
         };
 
         pipeArray.push(topPipe);
 
         let bottomPipe = {
             img: bottomPipeImg,
             x: pipeX,
             y: randomPipeY + pipeHeight + openingSpace,
             width: pipeWidth,
             height: pipeHeight,
             passed: false
         };
 
         pipeArray.push(bottomPipe);
     }
 
     function moveBird(e) {
         // Support both touch and keyboard
    if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyX" ||
        e.type === "touchstart"
    ) {
             if (bgm.paused) {
             bgm.play();                                     //music
         }
             wingSound.play();
 
             velocityY = -6;
 
             if (gameOver && canRetry) {
                 bird.y = birdY;
                 velocityY = 0;
                 pipeArray = [];
                 score = 0;
                 gameOver = false;
                 gameOverFrame = 0;
                 canRetry = false;
                 countdown = 3; // Reset countdown
                 return;
             }
         }
     }
 
     function detectCollision(a, b) {
         let padding = 10;   
         return a.x + padding < b.x + b.width &&
                a.x + a.width - padding > b.x &&
                a.y + padding < b.y + b.height &&
                a.y + a.height - padding > b.y;
     }
    
