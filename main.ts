
const foreground = "#000000";
const background = "#FFFFFF";
const playerColor = "#0000AA";
const wallColor = "#AA0000";

const defaultDim = 640;
const minTextSize = 11;

const boundWidth = 0.05;
const gravity = 0.00011;
const jumpAccel = -0.0035;
const boundDistSpeed = -0.00008;
const minBoundDist = 0.3;
const stepDist = 0.04;
const margin = 0.02;
const gameAccel = 0.0000008;
const wallH = 0.25;

let bounds: Bound[];
let walls: Wall[];
let score: number = 0;
let speed: number = 0.008;
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
    $("#restart").click(() => {
        restart();
    })

    let canvasElem = $("#main-canvas");
    let canvas = canvasElem[0] as HTMLCanvasElement;

    let cwidth = Math.min(canvasElem.parent().width(), 640);
    let cheight = Math.min(canvasElem.parent().height(), 640);
    dim = Math.min(cwidth, cheight);

    canvasElem.width(dim); canvas.width = dim;
    canvasElem.height(dim); canvas.height = dim;

    ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;

    player = new Player();
    bounds = fillBounds();
    walls = [];
    
    $(document).keydown(e => {
        if (e.keyCode == 32 && state == "playing") {
            e.preventDefault();
            player.jump();
        }
    })

    drawScreen(ctx);

    tick();
});

$(document).click(e => {
    let target = $(e.target);
    if (!target.is("button")) {
        player.jump();
    }
});

$(window).resize(() => {
    let canvasElem = $("#main-canvas");
    let canvas = canvasElem[0] as HTMLCanvasElement;

    let cwidth = Math.min(canvasElem.parent().width(), 640);
    let cheight = Math.min(canvasElem.parent().height(), 640);
    dim = Math.min(cwidth, cheight);

    canvasElem.width(dim); canvas.width = dim;
    canvasElem.height(dim); canvas.height = dim;
});

function restart() {
    player = new Player();
    bounds = fillBounds();
    walls = [];
    boundDist = 0.6;
    state = "paused";
    countdownTime = 3;
    score = 0;
    speed = 0.008;
}

function tick() {

    switch(state) {
        case "playing":
            playTick();
            break;
        case "countdown":
            countdownTick();
            break;
        case "ended":
            endedTick();
            break;
        default:
            drawScreen(ctx);
            break;
    }

    requestAnimationFrame(tick);

}

function playTick() {

    player.tick();

    speed += gameAccel;

    bounds.forEach(b => {
        b.top.x -= speed;
        b.bottom.x -= speed;
    })

    walls.forEach(w => {
        w.x -= speed;
    })
    
    let lastBound = bounds[bounds.length-1];
    while (lastBound.top.x + lastBound.top.w <= 1) {

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

    if (player.y <= 0 || player.y + player.size/2 >= 1) {
        state = "ended";
        return;
    }

    bounds.forEach(b => {
        if (b.collide(player)) {
            state = "ended";
            return;
        }
    });

    walls.forEach(b => {
        if (b.collide(player)) {
            state = "ended";
            return;
        }
    });

    while (bounds[0].top.x + bounds[0].top.w < 0) bounds.shift();
    while (walls.length > 0 && walls[0].x + walls[0].w < 0) walls.shift();

    drawScreen(ctx);

    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    bgText(ctx, String(score), 0, 1, 1/20);

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
        bgText(ctx, String(Math.ceil(countdownTime))[0], 1/2, 1/2, 1/5);
    }
}

function endedTick() {
    drawScreen(ctx);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    bgText(ctx, "Score: "+String(score), 1/2, 1/2, 1/10);
}

function bgText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize: number, shadowSize: number = 1) {
    fontSize = Math.max(fontSize * dim, minTextSize);

    ctx.font = fontSize+"pt Arial";
    ctx.fillStyle = foreground;
    ctx.fillText(text, x * dim, y * dim);

    ctx.lineWidth = shadowSize;
    ctx.strokeStyle = background;
    ctx.strokeText(text, x * dim, y * dim);
}

function newRandomWall(lastBound: Bound): Wall {
    let minY = Math.max(margin, lastBound.top.h);
    let maxY = Math.min(1 - margin - wallH, lastBound.bottom.y - wallH);

    let randY = Math.random() * (maxY - minY) + minY;
    return new Wall(lastBound.top.x, randY);
}

function newRandomBound(lastBound: Bound): Bound {
    let maxTop = Math.min(1 - boundDist - margin, lastBound.top.h + stepDist);
    let minTop = Math.max(margin, lastBound.top.h - stepDist);
    let x = lastBound.top.x + lastBound.top.w;
    let w = boundWidth;

    let random = Math.random();
    if (random < 0.2) return new Bound(x, w, lastBound.top.h, boundDist);
    if (random < 0.6) return new Bound(x, w, minTop, boundDist);
    return new Bound(x, w, maxTop, boundDist);
}

function drawAll(ctx: CanvasRenderingContext2D, objects: IDrawable[]) {
    objects.forEach(e => e.draw(ctx));
}

function fillBounds(): Bound[] {
    let returnArray: Bound[] = [];
    for (let i = 0; i < 1/boundWidth; i++) {
        returnArray.push(new Bound(boundWidth * i, boundWidth, (0.5 - boundDist / 2), boundDist));
    }
    return returnArray;
}

function floorFillRectDim(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillRect(Math.floor(x*dim)-1, Math.floor(y*dim)-1, Math.ceil(w*dim)+1, Math.ceil(h*dim)+1);
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
        floorFillRectDim(ctx, this.x, this.y, this.w, this.h);
    }

    collide(player: Player): boolean {
        let corners = player.corners();
        return corners[0] < this.x + this.w && corners[2] > this.x &&
            corners[1] < this.y + this.h && corners[3] > this.y;
    }
}

class Wall extends CollideRect {
    constructor(x: number, y: number) {
        super(x, y, boundWidth, wallH);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = wallColor;
        floorFillRectDim(ctx, this.x, this.y, this.w, this.h);
    }
}

class Bound implements ICollideable, IDrawable {
    top: CollideRect;
    bottom: CollideRect;
    
    constructor(x: number, w: number, topH: number, dist: number) {
        this.top = new CollideRect(x, 0, w, topH);
        this.bottom = new CollideRect(x, topH + dist, w, 1);
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

    constructor() {
        this.x = 0.1;
        this.y = 0.5;
        this.size = 0.02;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = playerColor;
        floorFillRectDim(ctx, this.x-this.size/2, this.y-this.size/2, this.size, this.size);
    }

    tick() {
        this.y += this.accel;
        this.accel += gravity;
    }

    corners(): number[] {
        return [this.x - this.size/2, this.y - this.size/2, this.x + this.size/2, this.y + this.size/2];
    }

    jump() {
        this.accel += jumpAccel;
    }
}
