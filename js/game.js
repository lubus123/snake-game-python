import { Snake } from './snake.js';
import { Food } from './food.js';
import { PowerUp } from './powerup.js';
import { Particle } from './particle.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, GAME_CONFIG } from './constants.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.snake = new Snake();
        this.food = new Food();
        this.powerUps = [];
        this.particles = [];
        this.score = 0;
        this.gameOver = false;
        this.lastPowerUpSpawn = Date.now();
        this.lastUpdate = Date.now();
        this.gameSpeed = GAME_CONFIG.BASE_SPEED;
        
        this.bindEvents();
        this.spawnPowerUp();
        this.gameLoop();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) {
                if (e.key === ' ') {
                    e.preventDefault();
                    this.restart();
                }
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.snake.changeDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.snake.changeDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.snake.changeDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.snake.changeDirection({ x: 1, y: 0 });
                    break;
            }
        });
    }

    spawnPowerUp() {
        const timeSinceLastSpawn = Date.now() - this.lastPowerUpSpawn;
        const spawnDelay = Math.random() * (GAME_CONFIG.POWER_UP_SPAWN_MAX - GAME_CONFIG.POWER_UP_SPAWN_MIN) + GAME_CONFIG.POWER_UP_SPAWN_MIN;
        
        if (timeSinceLastSpawn > spawnDelay) {
            const powerUp = new PowerUp();
            // Ensure power-up doesn't spawn on snake or food
            while (this.snake.positions.some(pos => pos.x === powerUp.position.x && pos.y === powerUp.position.y) ||
                   (powerUp.position.x === this.food.position.x && powerUp.position.y === this.food.position.y)) {
                powerUp.position = powerUp.generatePosition();
            }
            this.powerUps.push(powerUp);
            this.lastPowerUpSpawn = Date.now();
        }
    }

    createExplosion(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    update() {
        const currentTime = Date.now();
        const actualSpeed = this.gameSpeed / this.snake.speedMultiplier;
        
        if (currentTime - this.lastUpdate < actualSpeed) {
            return;
        }
        this.lastUpdate = currentTime;

        if (!this.snake.move()) {
            this.gameOver = true;
            return;
        }

        // Check food collision
        const head = this.snake.positions[0];
        if (head.x === this.food.position.x && head.y === this.food.position.y) {
            this.snake.growSnake();
            
            let points = 10;
            if (this.snake.doublePoints) {
                points *= 2;
            }
            this.score += points;

            const foodX = this.food.position.x * 20 + 10; // GRID_SIZE = 20
            const foodY = this.food.position.y * 20 + 10;
            this.createExplosion(foodX, foodY, COLORS.RED, 20);

            // Respawn food
            do {
                this.food.position = this.food.generatePosition();
            } while (this.snake.positions.some(pos => pos.x === this.food.position.x && pos.y === this.food.position.y));
        }

        // Check power-up collisions
        this.powerUps = this.powerUps.filter(powerUp => {
            if (head.x === powerUp.position.x && head.y === powerUp.position.y) {
                this.snake.applyPowerUp(powerUp.type);
                
                const powerX = powerUp.position.x * 20 + 10; // GRID_SIZE = 20
                const powerY = powerUp.position.y * 20 + 10;
                this.createExplosion(powerX, powerY, powerUp.getColor(), 25);
                
                return false;
            }
            return !powerUp.isExpired();
        });

        // Update particles
        this.particles = this.particles.filter(particle => particle.update());

        // Spawn new power-ups
        this.spawnPowerUp();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = COLORS.BLACK;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));

        // Draw game objects
        this.snake.draw(this.ctx);
        this.food.draw(this.ctx);
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = COLORS.WHITE;
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 50);

        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    getScore() {
        return this.score;
    }

    getSnakeStatus() {
        return {
            ghostMode: this.snake.ghostMode,
            doublePoints: this.snake.doublePoints,
            speedBoost: this.snake.speedMultiplier > 1
        };
    }

    restart() {
        this.snake = new Snake();
        this.food = new Food();
        this.powerUps = [];
        this.particles = [];
        this.score = 0;
        this.gameOver = false;
        this.lastPowerUpSpawn = Date.now();
        this.lastUpdate = Date.now();
    }

    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw();
        } else {
            this.drawGameOver();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}