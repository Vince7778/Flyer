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
var boundWidth = 0.05;
var gravity = 0.00011;
var jumpAccel = -0.005;
var boundDistSpeed = -0.00008;
var minBoundDist = 0.3;
var stepDist = 0.04;
var margin = 0.02;
var gameAccel = 0.0000008;
var wallH = 0.25;
var bounds;
var walls;
var score = 0;
var speed = 0.005;
var player;
var ctx;
var dim;
var boundDist = 0.6;
var state = "paused";
$(document).ready(function () {
    var canvas = document.getElementById("main_canvas");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    dim = Math.min(canvas.width, canvas.height);
    canvas.width = canvas.height = dim;
    player = new Player(canvas.width);
    $(document).keydown(function (e) {
        if (e.keyCode == 32)
            player.jump();
    });
    bounds = fillBounds(dim);
    walls = [];
    state = "playing";
    tick();
});
function tick() {
    if (state == "playing") {
        playTick();
    }
}
function playTick() {
    player.tick(dim);
    speed += gameAccel;
    bounds.forEach(function (b) {
        b.top.x -= speed * dim;
        b.bottom.x -= speed * dim;
    });
    walls.forEach(function (w) {
        w.x -= speed * dim;
    });
    var lastBound = bounds[bounds.length - 1];
    while (lastBound.top.x + lastBound.top.w <= dim) {
        score++;
        if (boundDist > minBoundDist) {
            boundDist += boundDistSpeed;
        }
        bounds.push(newRandomBound(lastBound));
        lastBound = bounds[bounds.length - 1];
        if (score % 20 == 0) {
            walls.push(newRandomWall(lastBound));
        }
    }
    while (bounds[0].top.x + bounds[0].top.w < 0)
        bounds.shift();
    ctx.clearRect(0, 0, dim, dim);
    drawAll(ctx, bounds);
    drawAll(ctx, walls);
    player.draw(ctx);
    requestAnimationFrame(tick);
}
function newRandomWall(lastBound) {
    var minY = Math.max(margin * dim, lastBound.top.h);
    var maxY = Math.min(dim - margin * dim - wallH * dim, lastBound.bottom.y - wallH * dim);
    var randY = Math.random() * (maxY - minY) + minY;
    return new Wall(lastBound.top.x, randY);
}
function newRandomBound(lastBound) {
    var maxTop = Math.min(dim - boundDist * dim - margin * dim, lastBound.top.h + stepDist * dim);
    var minTop = Math.max(margin * dim, lastBound.top.h - stepDist * dim);
    var x = lastBound.top.x + lastBound.top.w;
    var w = dim * boundWidth;
    var random = Math.random();
    if (random < 0.2)
        return new Bound(x, w, lastBound.top.h, boundDist * dim, dim);
    if (random < 0.6)
        return new Bound(x, w, minTop, boundDist * dim, dim);
    return new Bound(x, w, maxTop, boundDist * dim, dim);
}
function drawAll(ctx, objects) {
    objects.forEach(function (e) { return e.draw(ctx); });
}
function fillBounds(dim) {
    var returnArray = [];
    for (var i = 0; i < 1 / boundWidth; i++) {
        returnArray.push(new Bound(boundWidth * dim * i, boundWidth * dim, (0.5 - boundDist / 2) * dim, boundDist * dim, dim));
    }
    return returnArray;
}
function floorFillRect(ctx, x, y, w, h) {
    ctx.fillRect(Math.floor(x) - 1, Math.floor(y) - 1, Math.ceil(w) + 1, Math.ceil(h) + 1);
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
        floorFillRect(ctx, this.x, this.y, this.w, this.h);
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
        return _super.call(this, x, y, boundWidth * dim, wallH * dim) || this;
    }
    Wall.prototype.draw = function (ctx) {
        ctx.fillStyle = wallColor;
        floorFillRect(ctx, this.x, this.y, this.w, this.h);
    };
    return Wall;
}(CollideRect));
var Bound = /** @class */ (function () {
    function Bound(x, w, topH, dist, dim) {
        this.top = new CollideRect(x, 0, w, topH);
        this.bottom = new CollideRect(x, topH + dist, w, dim);
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
    function Player(dim) {
        this.accel = 0;
        this.dead = false;
        this.x = dim * 0.1;
        this.y = dim * 0.5;
        this.size = Math.ceil(dim * 0.02);
    }
    Player.prototype.draw = function (ctx) {
        ctx.fillStyle = playerColor;
        floorFillRect(ctx, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    };
    Player.prototype.tick = function (dim) {
        this.y += this.accel * dim;
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
