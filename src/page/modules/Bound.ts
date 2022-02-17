
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

function fillBounds(): Bound[] {
    let returnArray: Bound[] = [];
    for (let i = 0; i < 1/boundWidth; i++) {
        returnArray.push(new Bound(boundWidth * i, boundWidth, (0.5 - boundDist / 2), boundDist));
    }
    return returnArray;
}
