import { Display } from "./UiEditorApi";

export class U8G2 {
    private drawColor = 0;

    constructor(private ctx: CanvasRenderingContext2D, private display: Display) {
        this.ctx.lineWidth = 1;
        this.ctx.imageSmoothingEnabled = false;
    }

    clear() {
        let t = this.drawColor;
        this.setDrawColor(this.display.resetColor);
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.display.width, this.display.height);
        this.ctx.fill();
        this.setDrawColor(t);
    }

    setDrawColor(color: number) {
        this.ctx.fillStyle = this.display.getColorValue(color);
        this.ctx.strokeStyle = this.display.getColorValue(color);
        this.drawColor = color;
    }

    drawLine(x0: number, y0: number, x1: number, y1: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
    }
}
