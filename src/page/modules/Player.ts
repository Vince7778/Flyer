

class Player implements IDrawable {
    x: number;
    y: number;
    size: number;
    accel: number = 0;
    dead: boolean = false;

    constructor() {
        this.x = 0.1;
        this.y = 0.5;
        this.size = 0.02;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = playerColor;
        floorFillRectDim(ctx, this.x-this.size/2, this.y-this.size/2, this.size, this.size);
    }

    tick(dt: number) {
        this.y += this.accel*dt;
        this.accel += gravity*dt;
    }

    corners(): number[] {
        return [this.x - this.size/2, this.y - this.size/2, this.x + this.size/2, this.y + this.size/2];
    }

    jump() {
        this.accel += jumpAccel;
    }
}
