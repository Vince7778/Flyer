
class Wall extends CollideRect {
    constructor(x: number, y: number) {
        super(x, y, boundWidth, wallH);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = wallColor;
        floorFillRectDim(ctx, this.x, this.y, this.w, this.h);
    }
}

function newRandomWall(lastBound: Bound): Wall {
    let minY = Math.max(margin, lastBound.top.h);
    let maxY = Math.min(1 - margin - wallH, lastBound.bottom.y - wallH);

    let randY = Math.random() * (maxY - minY) + minY;
    return new Wall(lastBound.top.x, randY);
}
