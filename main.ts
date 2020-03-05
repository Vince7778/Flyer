
const foreground = "#000000";
const background = "#FFFFFF";
const playerColor = "#3333FF";

const defaultDim = 640;
const boundWidth = 0.05;

const gravity = 0.00011;
const jumpAccel = -0.004;
const boundDistSpeed = -0.00002;
const minBoundDist = 0.3;
const stepDist = 0.04;
const margin = 0.02;

let bounds: Bound[];
let speed: number = 0.005;
let player: Player;
let ctx: CanvasRenderingContext2D;
let dim: number;
let boundDist: number = 0.6;

$(document).ready(() => {

    let canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    dim = Math.min(canvas.width, canvas.height);
    canvas.width = canvas.height = dim;

    player = new Player(canvas.width);
    
    $(document).keydown(e => {
        if (e.keyCode == 32) player.jump();
    })

    player.draw(ctx);

    bounds = fillBounds(dim);
    drawAll(bounds, ctx);

    tick();
});

function tick() {

    player.tick(dim);

    if (boundDist > minBoundDist) {
        boundDist += boundDistSpeed;
    }

    bounds.forEach(b => {
        b.top.x -= speed * dim;
        b.bottom.x -= speed * dim;
    })
    
    let lastBound = bounds[bounds.length-1];
    if (lastBound.top.x + lastBound.top.w <= dim) {
        bounds.push(newRandomBound(lastBound));
    }

    ctx.clearRect(0, 0, dim, dim);

    player.draw(ctx);
    drawAll(bounds, ctx);
    requestAnimationFrame(tick);

}

function newRandomBound(lastBound: Bound): Bound {
    let maxTop = Math.min(dim - boundDist * dim - margin * dim, lastBound.top.h + stepDist * dim);
    let minTop = Math.max(margin * dim, lastBound.top.h - stepDist * dim);
    let x = lastBound.top.x + lastBound.top.w;
    let w = dim * boundWidth;

    let random = Math.random();
    if (random < 0.2) return new Bound(x, w, lastBound.top.h, boundDist * dim, dim);
    if (random < 0.6) return new Bound(x, w, minTop, boundDist * dim, dim);
    return new Bound(x, w, maxTop, boundDist * dim, dim);
}

function drawAll(objects: IDrawable[], ctx: CanvasRenderingContext2D) {
    objects.forEach(e => e.draw(ctx));
}

function fillBounds(dim: number): Bound[] {
    let returnArray: Bound[] = [];
    for (let i = 0; i < 1/boundWidth; i++) {
        returnArray.push(new Bound(boundWidth * dim * i, boundWidth * dim, (0.5 - boundDist / 2) * dim, boundDist * dim, dim));
    }
    return returnArray;
}

function floorFillRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillRect(Math.floor(x)-1, Math.floor(y)-1, Math.ceil(w)+1, Math.ceil(h)+1);
}

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
        floorFillRect(ctx, this.x, this.y, this.w, this.h);
    }

    collide(player: Player): boolean {
        let corners = player.corners();
        return corners[0] < this.x + this.w && corners[2] > this.x &&
            corners[1] < this.y + this.h && corners[3] > this.y;
    }
}

class Bound implements ICollideable, IDrawable {
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

class Player implements IDrawable {
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
        ctx.fillStyle = playerColor;
        floorFillRect(ctx, this.x-this.size/2, this.y-this.size/2, this.size, this.size);
    }

    tick(dim: number) {
        this.y += this.accel * dim;
        this.accel += gravity;
    }

    corners(): number[] {
        return [this.x - this.size/2, this.y - this.size/2, this.x + this.size/2, this.y + this.size/2];
    }

    jump() {
        this.accel += jumpAccel;
    }
}
