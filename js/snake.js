import { GRID_WIDTH, GRID_HEIGHT, GRID_SIZE, COLORS, POWER_UP_TYPES, GAME_CONFIG } from './constants.js';

export class Snake {
    constructor() {
        this.positions = [{ x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) }];
        this.direction = { x: 1, y: 0 };
        this.grow = false;
        this.speedMultiplier = 1.0;
        this.ghostMode = false;
        this.ghostEndTime = 0;
        this.doublePoints = false;
        this.doublePointsEndTime = 0;
        this.trailPositions = [];
    }

    move() {
        const head = this.positions[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        // Add trail effect
        this.trailPositions.push({
            x: head.x * GRID_SIZE + GRID_SIZE / 2,
            y: head.y * GRID_SIZE + GRID_SIZE / 2
        });
        if (this.trailPositions.length > 10) {
            this.trailPositions.shift();
        }

        // Check boundaries and collisions
        if (!this.ghostMode) {
            if (newHead.x < 0 || newHead.x >= GRID_WIDTH || 
                newHead.y < 0 || newHead.y >= GRID_HEIGHT) {
                return false;
            }
            if (this.positions.some(pos => pos.x === newHead.x && pos.y === newHead.y)) {
                return false;
            }
        } else {
            // Wrap around in ghost mode
            newHead.x = ((newHead.x % GRID_WIDTH) + GRID_WIDTH) % GRID_WIDTH;
            newHead.y = ((newHead.y % GRID_HEIGHT) + GRID_HEIGHT) % GRID_HEIGHT;
        }

        this.positions.unshift(newHead);

        if (!this.grow) {
            this.positions.pop();
        } else {
            this.grow = false;
        }

        this.updatePowerUps();
        return true;
    }

    updatePowerUps() {
        const currentTime = Date.now();

        if (this.ghostMode && currentTime > this.ghostEndTime) {
            this.ghostMode = false;
        }

        if (this.doublePoints && currentTime > this.doublePointsEndTime) {
            this.doublePoints = false;
        }
    }

    changeDirection(direction) {
        if (direction.x !== -this.direction.x || direction.y !== -this.direction.y) {
            this.direction = direction;
        }
    }

    growSnake() {
        this.grow = true;
    }

    shrink() {
        if (this.positions.length > 3) {
            const halfLength = Math.floor(this.positions.length / 2);
            this.positions = this.positions.slice(0, halfLength);
        }
    }

    applyPowerUp(powerType) {
        const currentTime = Date.now();

        switch (powerType) {
            case POWER_UP_TYPES.SPEED:
                this.speedMultiplier = 2.0;
                setTimeout(() => {
                    this.speedMultiplier = 1.0;
                }, GAME_CONFIG.SPEED_BOOST_DURATION);
                break;
            case POWER_UP_TYPES.GHOST:
                this.ghostMode = true;
                this.ghostEndTime = currentTime + GAME_CONFIG.GHOST_DURATION;
                break;
            case POWER_UP_TYPES.DOUBLE_POINTS:
                this.doublePoints = true;
                this.doublePointsEndTime = currentTime + GAME_CONFIG.DOUBLE_POINTS_DURATION;
                break;
            case POWER_UP_TYPES.SHRINK:
                this.shrink();
                break;
        }
    }

    draw(ctx) {
        // Draw trail
        this.trailPositions.forEach((pos, index) => {
            const alpha = (index + 1) / this.trailPositions.length * 0.3;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = COLORS.GREEN;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw snake
        this.positions.forEach((pos, index) => {
            const x = pos.x * GRID_SIZE;
            const y = pos.y * GRID_SIZE;

            if (index === 0) {
                // Head with glow
                ctx.save();
                ctx.shadowColor = this.ghostMode ? COLORS.PURPLE : COLORS.BRIGHT_GREEN;
                ctx.shadowBlur = 10;
                ctx.fillStyle = this.ghostMode ? COLORS.PURPLE : COLORS.BRIGHT_GREEN;
                ctx.fillRect(x - 2, y - 2, GRID_SIZE + 4, GRID_SIZE + 4);
                ctx.restore();
            } else {
                // Body
                const alpha = this.ghostMode ? 0.5 : Math.max(0.3, 1 - (index * 0.05));
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.ghostMode ? COLORS.PURPLE : COLORS.GREEN;
                ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
                ctx.restore();
            }

            // Border
            ctx.strokeStyle = COLORS.BLACK;
            ctx.strokeRect(x, y, GRID_SIZE, GRID_SIZE);
        });
    }
}