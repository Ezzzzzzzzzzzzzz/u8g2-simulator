import { Display } from "./UiEditorApi";

export type CIRC_OPT =
    "U8G2_DRAW_UPPER_RIGHT" |
    "U8G2_DRAW_UPPER_LEFT" |
    "U8G2_DRAW_LOWER_LEFT" |
    "U8G2_DRAW_LOWER_RIGHT" |
    "U8G2_DRAW_ALL";

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

    drawBox(x: number, y: number, w: number, h: number) {
        this.drawLine(x, y, x + w, y);
        this.drawLine(x, y, x, y + h);
        this.drawLine(x, y + h, x + w, y + h);
        this.drawLine(x + w, y, x + w, y + h);
    }

    drawCircle(x: number, y: number, r: number, opt: CIRC_OPT = "U8G2_DRAW_ALL") {
        this.ctx.beginPath();
        switch (opt) {
            case "U8G2_DRAW_UPPER_RIGHT":
                this.ctx.arc(x, y, r, 1.5 * Math.PI, 0 * Math.PI);
                break;
            case "U8G2_DRAW_UPPER_LEFT":
                this.ctx.arc(x, y, r, 1 * Math.PI, 1.5 * Math.PI);
                break;
            case "U8G2_DRAW_LOWER_LEFT":
                this.ctx.arc(x, y, r, 0.5 * Math.PI, 1 * Math.PI);
                break;
            case "U8G2_DRAW_LOWER_RIGHT":
                this.ctx.arc(x, y, r, 0 * Math.PI, 0.5 * Math.PI);
                break;
            case "U8G2_DRAW_ALL":
                this.ctx.arc(x, y, r, 0, 2 * Math.PI);
                break;
        }
        this.ctx.stroke();
    }

    drawLine(x0: number, y0: number, x1: number, y1: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
    }

    setDrawColor(color: number) {
        this.ctx.fillStyle = this.display.getColorValue(color);
        this.ctx.strokeStyle = this.display.getColorValue(color);
        this.drawColor = color;
    }
}
