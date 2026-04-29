// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 5;

const player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computer = {
    x: canvas.width - 20 - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballSize,
    speed: 5,
    maxSpeed: 8
};

let playerScore = 0;
let computerScore = 0;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update game state
function update() {
    // Player paddle control (mouse Y or arrow keys)
    const targetY = Math.min(Math.max(mouseY - paddleHeight / 2, 0), canvas.height - paddleHeight);
    
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y = Math.min(canvas.height - paddleHeight, player.y + player.speed);
    }
    
    // Smooth mouse tracking
    if (Math.abs(player.y - targetY) > 5) {
        player.y += (targetY - player.y) * 0.1;
    } else {
        player.y = targetY;
    }
    
    // Keep player paddle in bounds
    player.y = Math.max(0, Math.min(player.y, canvas.height - paddleHeight));
    
    // Computer AI - follows the ball with slight delay for challenge
    const computerCenter = computer.y + paddleHeight / 2;
    const ballCenter = ball.y;
    const difficulty = 0.08; // Lower = easier
    
    if (computerCenter < ballCenter - 20) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 20) {
        computer.y -= computer.speed;
    }
    
    // Keep computer paddle in bounds
    computer.y = Math.max(0, Math.min(computer.y, canvas.height - paddleHeight));
    
    // Ball physics
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(ball.y, canvas.height - ball.radius));
    }
    
    // Ball collision with player paddle
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + paddleHeight / 2)) / (paddleHeight / 2);
        ball.dy += hitPos * 4;
        
        // Increase ball speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ball.maxSpeed) {
            ball.dx = (ball.dx / speed) * Math.min(speed + 0.5, ball.maxSpeed);
            ball.dy = (ball.dy / speed) * Math.min(speed + 0.5, ball.maxSpeed);
        }
    }
    
    // Ball collision with computer paddle
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + paddleHeight / 2)) / (paddleHeight / 2);
        ball.dy += hitPos * 4;
        
        // Increase ball speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ball.maxSpeed) {
            ball.dx = (ball.dx / speed) * Math.min(speed + 0.5, ball.maxSpeed);
            ball.dy = (ball.dy / speed) * Math.min(speed + 0.5, ball.maxSpeed);
        }
    }
    
    // Scoring - ball goes off screen
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
        updateScore();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 6;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');
    
    // Draw center line
    drawCenterLine();
    
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#00ff00');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#ff0000');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffff00');
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();