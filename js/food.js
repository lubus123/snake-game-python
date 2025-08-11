import { GRID_WIDTH, GRID_HEIGHT, GRID_SIZE, COLORS } from './constants.js';

export class Food {
    constructor() {
        this.position = this.generatePosition();
        this.pulseTime = 0;
    }

    generatePosition() {
        return {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    }

    draw(ctx) {
        this.pulseTime += 0.05;
        const pulse = Math.abs(Math.sin(this.pulseTime)) * 3;
        const x = this.position.x * GRID_SIZE;
        const y = this.position.y * GRID_SIZE;

        // Outer glow
        ctx.save();
        ctx.shadowColor = COLORS.RED;
        ctx.shadowBlur = pulse + 5;
        ctx.fillStyle = COLORS.RED;
        ctx.beginPath();
        ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, (GRID_SIZE / 2) + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Inner circle
        ctx.fillStyle = COLORS.LIGHT_RED;
        ctx.beginPath();
        ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, (GRID_SIZE / 2) - 3, 0, Math.PI * 2);
        ctx.fill();
    }
}