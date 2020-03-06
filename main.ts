
const foreground = "#000000";
const background = "#FFFFFF";
const playerColor = "#0000AA";
const wallColor = "#AA0000";

const defaultDim = 640;
const boundWidth = 0.05;

const gravity = 0.00011;
const jumpAccel = -0.005;
const boundDistSpeed = -0.00008;
const minBoundDist = 0.3;
const stepDist = 0.04;
const margin = 0.02;
const gameAccel = 0.0000008;
const wallH = 0.25;

let bounds: Bound[];
let walls: Wall[];
let score: number = 0;
let speed: number = 0.005;
let player: Player;
let ctx: CanvasRenderingContext2D;
let dim: number;
let boundDist: number = 0.6;
let state: string = "paused";
let countdownTime: number = 3;

$(document).ready(() => {

    $("#start").click(() => {
        if (state == "paused") {
            state = "countdown";
        }
    });

    let canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
    ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;

    dim = Math.min(canvas.width, canvas.height);
    canvas.width = canvas.height = dim;

    player = new Player(canvas.width);
    
    $(document).keydown(e => {
        if (e.keyCode == 32 && state == "playing") player.jump();
    })

    bounds = fillBounds(dim);
    walls = [];

    drawScreen(ctx);

    tick();
});

function tick() {

    switch(state) {
        case "playing":
            playTick();
            break;
        case "countdown":
            countdownTick();
            break;
    }

    requestAnimationFrame(tick);

}

function playTick() {

    player.tick(dim);

    speed += gameAccel;

    bounds.forEach(b => {
        b.top.x -= speed * dim;
        b.bottom.x -= speed * dim;
    })

    walls.forEach(w => {
        w.x -= speed * dim;
    })
    
    let lastBound = bounds[bounds.length-1];
    while (lastBound.top.x + lastBound.top.w <= dim) {

        score++;

        if (boundDist > minBoundDist) {
            boundDist += boundDistSpeed;
        }

        bounds.push(newRandomBound(lastBound));
        lastBound = bounds[bounds.length-1];

        if (score % 30 == 0) {
            walls.push(newRandomWall(lastBound));
        }

    }

    while (bounds[0].top.x + bounds[0].top.w < 0) bounds.shift();
    while (walls.length > 0 && walls[0].x + walls[0].w < 0) walls.shift();

    drawScreen(ctx);

    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    bgText(ctx, String(score), 0, dim, dim/20);

}

function drawScreen(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, dim, dim);
    drawAll(ctx, bounds);
    drawAll(ctx, walls);
    player.draw(ctx);
}

function countdownTick() {
    if (countdownTime <= 1/60) {
        state = "playing";
    } else {
        countdownTime -= 1/60;
        
        drawScreen(ctx);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        bgText(ctx, String(Math.ceil(countdownTime))[0], dim/2, dim/2, dim/5);
    }
}

function bgText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize: number, shadowSize: number = 1) {
    ctx.font = fontSize+"pt Arial";
    ctx.fillStyle = foreground;
    ctx.fillText(text, x, y);

    ctx.lineWidth = shadowSize;
    ctx.strokeStyle = background;
    ctx.strokeText(text, x, y);
}

function newRandomWall(lastBound: Bound): Wall {
    let minY = Math.max(margin * dim, lastBound.top.h);
    let maxY = Math.min(dim - margin * dim - wallH * dim, lastBound.bottom.y - wallH * dim);

    let randY = Math.random() * (maxY - minY) + minY;
    return new Wall(lastBound.top.x, randY);
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

function drawAll(ctx: CanvasRenderingContext2D, objects: IDrawable[]) {
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

class Wall extends CollideRect {
    constructor(x: number, y: number) {
        super(x, y, boundWidth * dim, wallH * dim);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = wallColor;
        floorFillRect(ctx, this.x, this.y, this.w, this.h);
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
