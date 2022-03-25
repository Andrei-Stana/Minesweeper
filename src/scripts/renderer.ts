import {GameConfig} from "./minesweeper.js";
import {Field, FieldState, Mine, UnknownFieldState} from "./field.js";

export class Renderer {
    constructor(private readonly ctx: CanvasRenderingContext2D,
                private readonly gameConfig: GameConfig,
                private readonly fieldPixelSize: number,
                private readonly fields: Field[][]) {
    }

    public render(): void {
        this.renderFields();
        this.drawGrid();
    }



    private renderFields(): void {
        const singleFieldPixel = this.fieldPixelSize / this.gameConfig.fieldSize;
        const translateFieldPos = (f: Field) => {
            const leftUpperX = f.colNo * singleFieldPixel;
            const leftUpperY = f.rowNo * singleFieldPixel;
            const rightLowerX = leftUpperX + singleFieldPixel;
            const rightLowerY = leftUpperY + singleFieldPixel;
            return [new Position(leftUpperX, leftUpperY), new Position(rightLowerX, rightLowerY)];
        };

        let row: number = 0;
        let col: number = 0;
        let value = 0;


        for (let fRow of this.fields) {
            for (let field of fRow) {
                const [leftUpper, rightLower] = translateFieldPos(field);
                const fRenderer = new FieldRenderer(c => {
                    this.drawRect(leftUpper, rightLower, c, field.neighbourMines);
                });
                field.renderOnField(fRenderer, new Hitbox(leftUpper, rightLower));
                col++;
            }
            row++;
        }
    }


    private drawGrid(): void {
        const gap = this.fieldPixelSize / this.gameConfig.fieldSize;
        const origin = new Position(0, 0);
        let start = origin;
        let end = start.moveY(this.fieldPixelSize);
        for (let i = 0; i <= this.gameConfig.fieldSize; i++) {
            this.drawLine(start, end);
            start = start.moveX(gap);
            end = end.moveX(gap);
        }
        start = origin;
        end = start.moveX(this.fieldPixelSize);
        for (let i = 0; i <= this.gameConfig.fieldSize; i++) {
            this.drawLine(start, end);
            start = start.moveY(gap);
            end = end.moveY(gap);
        }
    }

    private drawLine(startPos: Position, endPos: Position): void {
        this.ctx.beginPath();
        this.ctx.moveTo(startPos.x, startPos.y);
        this.ctx.lineTo(endPos.x, endPos.y);
        this.ctx.stroke();
    }


    private drawRect(leftUpper: Position, rightLower: Position, color: string, value: number): void {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.rect(leftUpper.x, leftUpper.y,
            leftUpper.horizontalDistanceTo(rightLower),
            leftUpper.verticalDistanceTo(rightLower));
        this.ctx.fill();

        if (value == undefined) return;
        this.ctx.fillStyle = "black";
        this.ctx.font ="20px Georgia"
        this.ctx.fillText(value.toString() ,leftUpper.x + leftUpper.horizontalDistanceTo(rightLower) / 2 - 5.5, leftUpper.y + leftUpper.verticalDistanceTo(rightLower) / 2 + 5.5);
    }

}

export class FieldRenderer {
    constructor(private readonly draw: (color: string) => void) {
    }

    public render(state: FieldState): void {
        let color: string = null;
        switch (state) {
            case FieldState.Hidden: {
                color = 'grey';
            }
                break;
            case FieldState.Unveiled: {
                color = 'white';
            }
                break;
            case FieldState.Flagged: {
                color = 'blue';
            }
                break;
            case FieldState.Detonated: {
                color = 'red';
            }
                break;
            default: {
                throw new UnknownFieldState(state);
            }
        }
        this.draw(color);
    }
}
export class Hitbox {
    constructor(private readonly leftUpper: Position,
                private readonly rightLower: Position) {
    }

    public isHit(hit: Position): boolean {
        return hit.x >= this.leftUpper.x
            && hit.x <= this.rightLower.x
            && hit.y >= this.leftUpper.y
            && hit.y <= this.rightLower.y;
    }
}

export class Position {
    constructor(public readonly x: number,
                public readonly y: number) {
    }

    public moveX(pixel: number): Position {
        return new Position(this.x + pixel, this.y);
    }

    public moveY(pixel: number): Position {
        return new Position(this.x, this.y + pixel);
    }

    public horizontalDistanceTo(other: Position): number {
        const distance = this.x - other.x;
        return Math.abs(distance);
    }

    public verticalDistanceTo(other: Position): number {
        const distance = this.y - other.y;
        return Math.abs(distance);
    }
}