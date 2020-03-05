
const foreground = "#000000";
const background = "#FFFFFF";
const defaultDim = 640;

$(document).ready(() => {
    let canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
    let ctx = canvas.getContext("2d");

    let dim = Math.min(canvas.width, canvas.height);
    canvas.width = canvas.height = dim;

    let player = new Player(canvas.width);
    player.draw(ctx);
});

interface ICollideable {
    collide(player: Player): boolean;
}

interface IDrawable {
    draw(ctx: CanvasRenderingContext2D): void;
}

class CollideRect implements ICollideable, IDrawable {
    constructor(public x: number, public y: number, public w: number, public h: number) {}

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = foreground;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    collide(player: Player): boolean {
        let corners = player.corners();
        return corners[0] < this.x + this.w && corners[2] > this.x &&
            corners[1] < this.y + this.h && corners[3] > this.y;
    }
}

class Bounds implements ICollideable, IDrawable {
    top: CollideRect;
    bottom: CollideRect;
    
    constructor(x: number, w: number, topH: number, dist: number, dim: number) {
        this.top = new CollideRect(x, 0, w, topH);
        this.bottom = new CollideRect(x, topH + dist, w, dim);
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.top.draw(ctx);
        this.bottom.draw(ctx);
    }

    collide(player: Player): boolean {
        return this.top.collide(player) || this.bottom.collide(player);
    }
}

class Player {
    x: number;
    y: number;
    size: number;
    accel: number = 0;
    dead: boolean = false;

    constructor(dim: number) {
        this.x = dim * 0.1;
        this.y = dim * 0.5;
        this.size = Math.ceil(dim * 0.02);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = foreground;
        ctx.fillRect(this.x-this.size/2, this.y-this.size/2, this.size, this.size);
    }

    tick() {
        this.y += this.accel;
    }

    corners(): number[] {
        return [this.x - this.size/2, this.y - this.size/2, this.x + this.size/2, this.y + this.size/2];
    }
}
