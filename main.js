var foreground = "#000000";
var background = "#FFFFFF";
var defaultDim = 640;
$(document).ready(function () {
    var canvas = document.getElementById("main_canvas");
    var ctx = canvas.getContext("2d");
    var dim = Math.min(canvas.width, canvas.height);
    canvas.width = canvas.height = dim;
    var player = new Player(canvas.width);
    player.draw(ctx);
});
var CollideRect = /** @class */ (function () {
    function CollideRect(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    CollideRect.prototype.draw = function (ctx) {
        ctx.fillStyle = foreground;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    };
    CollideRect.prototype.collide = function (player) {
        var corners = player.corners();
        return corners[0] < this.x + this.w && corners[2] > this.x &&
            corners[1] < this.y + this.h && corners[3] > this.y;
    };
    return CollideRect;
}());
var Bounds = /** @class */ (function () {
    function Bounds(x, w, topH, dist, dim) {
        this.top = new CollideRect(x, 0, w, topH);
        this.bottom = new CollideRect(x, topH + dist, w, dim);
    }
    Bounds.prototype.draw = function (ctx) {
        this.top.draw(ctx);
        this.bottom.draw(ctx);
    };
    Bounds.prototype.collide = function (player) {
        return this.top.collide(player) || this.bottom.collide(player);
    };
    return Bounds;
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
        ctx.fillStyle = foreground;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    };
    Player.prototype.tick = function () {
        this.y += this.accel;
    };
    Player.prototype.corners = function () {
        return [this.x - this.size / 2, this.y - this.size / 2, this.x + this.size / 2, this.y + this.size / 2];
    };
    return Player;
}());
