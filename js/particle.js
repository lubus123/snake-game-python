export class Particle {
    constructor(x, y, color, velocityX = null, velocityY = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocityX = velocityX !== null ? velocityX : (Math.random() - 0.5) * 6;
        this.velocityY = velocityY !== null ? velocityY : (Math.random() - 0.5) * 6;
        this.life = 30;
        this.maxLife = 30;
        this.size = Math.random() * 3 + 2;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.1;
        this.life--;
        return this.life > 0;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}