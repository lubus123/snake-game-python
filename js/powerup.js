import { GRID_WIDTH, GRID_HEIGHT, GRID_SIZE, COLORS, POWER_UP_TYPES, GAME_CONFIG } from './constants.js';

export class PowerUp {
    constructor() {
        this.position = this.generatePosition();
        this.type = this.getRandomType();
        this.spawnTime = Date.now();
        this.duration = GAME_CONFIG.POWER_UP_DURATION;
        this.pulseTime = 0;
    }

    getRandomType() {
        const types = Object.values(POWER_UP_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    generatePosition() {
        return {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    }

    isExpired() {
        return Date.now() - this.spawnTime > this.duration;
    }

    getColor() {
        const colors = {
            [POWER_UP_TYPES.SPEED]: COLORS.GOLD,
            [POWER_UP_TYPES.GHOST]: COLORS.PURPLE,
            [POWER_UP_TYPES.DOUBLE_POINTS]: COLORS.MAGENTA,
            [POWER_UP_TYPES.SHRINK]: COLORS.ORANGE
        };
        return colors[this.type] || COLORS.WHITE;
    }

    getSymbol() {
        const symbols = {
            [POWER_UP_TYPES.SPEED]: '>>',
            [POWER_UP_TYPES.GHOST]: '👻',
            [POWER_UP_TYPES.DOUBLE_POINTS]: 'x2',
            [POWER_UP_TYPES.SHRINK]: '--'
        };
        return symbols[this.type] || '?';
    }

    draw(ctx) {
        this.pulseTime += 0.1;
        const pulse = Math.abs(Math.sin(this.pulseTime)) * 3;
        const x = this.position.x * GRID_SIZE;
        const y = this.position.y * GRID_SIZE;

        // Glow effect
        ctx.save();
        ctx.shadowColor = this.getColor();
        ctx.shadowBlur = 10 + pulse;
        ctx.fillStyle = this.getColor();
        ctx.fillRect(x - pulse, y - pulse, GRID_SIZE + pulse * 2, GRID_SIZE + pulse * 2);
        ctx.restore();

        // Inner circle
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, (GRID_SIZE / 2) - 2, 0, Math.PI * 2);
        ctx.fill();

        // Symbol
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.getSymbol(), x + GRID_SIZE / 2, y + GRID_SIZE / 2 + 4);
    }
}