
class CollideRect implements ICollideable, IDrawable {
    constructor(public x: number, public y: number, public w: number, public h: number) {}

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = foreground;
        floorFillRectDim(ctx, this.x, this.y, this.w, this.h);
    }

    collide(player: Player): boolean {
        let corners = player.corners();
        return corners[0] < this.x + this.w && corners[2] > this.x &&
            corners[1] < this.y + this.h && corners[3] > this.y;
    }
}
