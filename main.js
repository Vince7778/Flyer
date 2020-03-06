var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var foreground = "#000000";
var background = "#FFFFFF";
var playerColor = "#0000AA";
var wallColor = "#AA0000";
var defaultDim = 640;
var minTextSize = 11;
var boundWidth = 0.05;
var gravity = 0.00011;
var jumpAccel = -0.004;
var boundDistSpeed = -0.00008;
var minBoundDist = 0.3;
var stepDist = 0.04;
var margin = 0.02;
var gameAccel = 0.0000008;
var wallH = 0.25;
var bounds;
var walls;
var score = 0;
var speed = 0.008;
var player;
var ctx;
var dim;
var boundDist = 0.6;
var state = "paused";
var countdownTime = 3;
$(document).ready(function () {
    $("#start").click(function () {
        if (state == "paused") {
            state = "countdown";
        }
    });
    $("#restart").click(function () {
        restart();
    });
    var canvasElem = $("#main-canvas");
    var canvas = canvasElem[0];
    var cwidth = Math.min(canvasElem.parent().width(), 640);
    var cheight = Math.min(canvasElem.parent().height(), 640);
    dim = Math.min(cwidth, cheight);
    canvasElem.width(dim);
    canvas.width = dim;
    canvasElem.height(dim);
    canvas.height = dim;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    player = new Player();
    bounds = fillBounds();
    walls = [];
    $(document).keydown(function (e) {
        if (e.keyCode == 32 && state == "playing") {
            e.preventDefault();
            player.jump();
        }
    });
    drawScreen(ctx);
    tick();
});
$(document).click(function (e) {
    var target = $(e.target);
    if (!target.is("button") && !target.is("a") && state == "playing") {
        player.jump();
    }
});
$(window).resize(function () {
    var canvasElem = $("#main-canvas");
    var canvas = canvasElem[0];
    var cwidth = Math.min(canvasElem.parent().width(), 640);
    var cheight = Math.min(canvasElem.parent().height(), 640);
    dim = Math.min(cwidth, cheight);
    canvasElem.width(dim);
    canvas.width = dim;
    canvasElem.height(dim);
    canvas.height = dim;
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
    switch (state) {
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
    bounds.forEach(function (b) {
        b.top.x -= speed;
        b.bottom.x -= speed;
    });
    walls.forEach(function (w) {
        w.x -= speed;
    });
    var lastBound = bounds[bounds.length - 1];
    while (lastBound.top.x + lastBound.top.w <= 1) {
        score++;
        if (boundDist > minBoundDist) {
            boundDist += boundDistSpeed;
        }
        bounds.push(newRandomBound(lastBound));
        lastBound = bounds[bounds.length - 1];
        if (score % 30 == 0) {
            walls.push(newRandomWall(lastBound));
        }
    }
    if (player.y <= 0 || player.y + player.size / 2 >= 1) {
        state = "ended";
        return;
    }
    bounds.forEach(function (b) {
        if (b.collide(player)) {
            state = "ended";
            return;
        }
    });
    walls.forEach(function (b) {
        if (b.collide(player)) {
            state = "ended";
            return;
        }
    });
    while (bounds[0].top.x + bounds[0].top.w < 0)
        bounds.shift();
    while (walls.length > 0 && walls[0].x + walls[0].w < 0)
        walls.shift();
    drawScreen(ctx);
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    bgText(ctx, String(score), 0, 1, 1 / 20);
}
function drawScreen(ctx) {
    ctx.clearRect(0, 0, dim, dim);
    drawAll(ctx, bounds);
    drawAll(ctx, walls);
    player.draw(ctx);
}
function countdownTick() {
    if (countdownTime <= 1 / 60) {
        state = "playing";
    }
    else {
        countdownTime -= 1 / 60;
        drawScreen(ctx);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        bgText(ctx, String(Math.ceil(countdownTime))[0], 1 / 2, 1 / 2, 1 / 5);
    }
}
function endedTick() {
    drawScreen(ctx);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    bgText(ctx, "Score: " + String(score), 1 / 2, 1 / 2, 1 / 10);
}
function bgText(ctx, text, x, y, fontSize, shadowSize) {
    if (shadowSize === void 0) { shadowSize = 1; }
    fontSize = Math.max(fontSize * dim, minTextSize);
    ctx.font = fontSize + "pt Arial";
    ctx.fillStyle = foreground;
    ctx.fillText(text, x * dim, y * dim);
    ctx.lineWidth = shadowSize;
    ctx.strokeStyle = background;
    ctx.strokeText(text, x * dim, y * dim);
}
function newRandomWall(lastBound) {
    var minY = Math.max(margin, lastBound.top.h);
    var maxY = Math.min(1 - margin - wallH, lastBound.bottom.y - wallH);
    var randY = Math.random() * (maxY - minY) + minY;
    return new Wall(lastBound.top.x, randY);
}
function newRandomBound(lastBound) {
    var maxTop = Math.min(1 - boundDist - margin, lastBound.top.h + stepDist);
    var minTop = Math.max(margin, lastBound.top.h - stepDist);
    var x = lastBound.top.x + lastBound.top.w;
    var w = boundWidth;
    var random = Math.random();
    if (random < 0.2)
        return new Bound(x, w, lastBound.top.h, boundDist);
    if (random < 0.6)
        return new Bound(x, w, minTop, boundDist);
    return new Bound(x, w, maxTop, boundDist);
}
function drawAll(ctx, objects) {
    objects.forEach(function (e) { return e.draw(ctx); });
}
function fillBounds() {
    var returnArray = [];
    for (var i = 0; i < 1 / boundWidth; i++) {
        returnArray.push(new Bound(boundWidth * i, boundWidth, (0.5 - boundDist / 2), boundDist));
    }
    return returnArray;
}
function floorFillRectDim(ctx, x, y, w, h) {
    ctx.fillRect(Math.floor(x * dim) - 1, Math.floor(y * dim) - 1, Math.ceil(w * dim) + 1, Math.ceil(h * dim) + 1);
}
var CollideRect = /** @class */ (function () {
    function CollideRect(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    CollideRect.prototype.draw = function (ctx) {
        ctx.fillStyle = foreground;
        floorFillRectDim(ctx, this.x, this.y, this.w, this.h);
    };
    CollideRect.prototype.collide = function (player) {
        var corners = player.corners();
        return corners[0] < this.x + this.w && corners[2] > this.x &&
            corners[1] < this.y + this.h && corners[3] > this.y;
    };
    return CollideRect;
}());
var Wall = /** @class */ (function (_super) {
    __extends(Wall, _super);
    function Wall(x, y) {
        return _super.call(this, x, y, boundWidth, wallH) || this;
    }
    Wall.prototype.draw = function (ctx) {
        ctx.fillStyle = wallColor;
        floorFillRectDim(ctx, this.x, this.y, this.w, this.h);
    };
    return Wall;
}(CollideRect));
var Bound = /** @class */ (function () {
    function Bound(x, w, topH, dist) {
        this.top = new CollideRect(x, 0, w, topH);
        this.bottom = new CollideRect(x, topH + dist, w, 1);
    }
    Bound.prototype.draw = function (ctx) {
        this.top.draw(ctx);
        this.bottom.draw(ctx);
    };
    Bound.prototype.collide = function (player) {
        return this.top.collide(player) || this.bottom.collide(player);
    };
    return Bound;
}());
var Player = /** @class */ (function () {
    function Player() {
        this.accel = 0;
        this.dead = false;
        this.x = 0.1;
        this.y = 0.5;
        this.size = 0.02;
    }
    Player.prototype.draw = function (ctx) {
        ctx.fillStyle = playerColor;
        floorFillRectDim(ctx, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    };
    Player.prototype.tick = function () {
        this.y += this.accel;
        this.accel += gravity;
    };
    Player.prototype.corners = function () {
        return [this.x - this.size / 2, this.y - this.size / 2, this.x + this.size / 2, this.y + this.size / 2];
    };
    Player.prototype.jump = function () {
        this.accel += jumpAccel;
    };
    return Player;
}());
