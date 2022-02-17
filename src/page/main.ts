
const foreground = "#000000";
const background = "#FFFFFF";
const playerColor = "#0000AA";
const wallColor = "#AA0000";

const defaultDim = 640;
const minTextSize = 11;

const boundWidth = 0.05;
const gravity = 0.00011;
const jumpAccel = -0.004;
const boundDistSpeed = -0.00016;
const minBoundDist = 0.45;
const stepDist = 0.04;
const margin = 0.02;
const gameAccel = 0.0000016;
const wallH = 0.25;

const el = (n: string) => document.getElementById(n);

let bounds: Bound[];
let walls: Wall[];
let score: number = 0;
let speed: number = 0.008;
let player: Player;
let ctx: CanvasRenderingContext2D;
let dim: number;
let boundDist: number = 0.7;
let state: string = "paused";
let countdownTime: number = 3;

function resize() {
    let canvasElem = el("main-canvas");
    let canvas = canvasElem as HTMLCanvasElement;

    let cwidth = Math.min(canvasElem.parentElement.offsetWidth, 640);
    let cheight = Math.min(canvasElem.parentElement.offsetHeight, 640);
    dim = Math.min(cwidth, cheight);

    canvas.width = dim;
    canvas.height = dim;
}

document.addEventListener("readystatechange", () => {
    
    el("restart").addEventListener("click", e => {
        e.preventDefault();
        restart();
    });
    el("restart").addEventListener("mousedown", e => {
        e.preventDefault();
    });

    let canvasElem = el("main-canvas");
    let canvas = canvasElem as HTMLCanvasElement;

    resize();

    ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;

    player = new Player();
    bounds = fillBounds();
    walls = [];
    
    document.addEventListener("keydown", e => {
        if (e.key === "Space") {
            e.preventDefault();
            if (state == "playing") {
                player.jump();
            } else if (state == "paused") {
                state = "countdown";
            }
        }
    })

    drawScreen(ctx);

    tick();
});

document.addEventListener("mousedown", e => {
    let target = <HTMLElement>e.target;
    if (target.nodeName !== "BUTTON" && target.nodeName !== "A") {
        e.preventDefault();
        if (state == "playing") {
            player.jump();
        } else if (state == "paused") {
            state = "countdown";
        }
    }
});

window.addEventListener("resize", resize);

function restart() {
    player = new Player();
    boundDist = 0.7;
    bounds = fillBounds();
    walls = [];
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
        case "paused":
            pausedTick();
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
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, dim, dim);
    drawAll(ctx, ...bounds, ...walls);
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

function pausedTick() {
    drawScreen(ctx);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    bgText(ctx, "Click to start", 1/2, 1/2, 1/12);
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

function drawAll(ctx: CanvasRenderingContext2D, ...objects: IDrawable[]) {
    objects.forEach(e => e.draw(ctx));
}

function floorFillRectDim(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillRect(Math.floor(x*dim)-1, Math.floor(y*dim)-1, Math.ceil(w*dim)+1, Math.ceil(h*dim)+1);
}
