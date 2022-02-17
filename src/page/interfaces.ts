
interface ICollideable {
    collide(player: Player): boolean;
}

interface IDrawable {
    draw(ctx: CanvasRenderingContext2D): void;
}
