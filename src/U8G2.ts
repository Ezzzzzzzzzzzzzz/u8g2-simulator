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
        this.ctx.fillRect(x, y, w, h);
    }

    drawCircle(x: number, y: number, r: number, opt: CIRC_OPT = "U8G2_DRAW_ALL", fill: boolean = false) {
        this.ctx.beginPath();
        if (fill) {
            this.ctx.moveTo(x, y);
        }
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
        if (fill) {
            this.ctx.moveTo(x, y);
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
        this.ctx.closePath();
    }

    drawDisk(x: number, y: number, r: number, opt: CIRC_OPT = "U8G2_DRAW_ALL") {
        this.drawCircle(x, y, r, opt, true);
    }

    drawEllipse(x0: number, y0: number, rx: number, ry: number, opt: CIRC_OPT = "U8G2_DRAW_ALL", fill: boolean = false) {
        // this helped: http://www.williammalone.com/briefs/how-to-draw-ellipse-html5-canvas/
        this.ctx.beginPath();

        this.ctx.moveTo(x0, y0 - ry / 2); // A1
        // TODO: implement the options

        this.ctx.bezierCurveTo(
            x0 + rx / 2, y0 - ry / 2, // C1
            x0 + rx / 2, y0 + ry / 2, // C2
            x0, y0 + ry / 2); // A2

        this.ctx.bezierCurveTo(
            x0 - rx / 2, y0 + ry / 2, // C3
            x0 - rx / 2, y0 - ry / 2, // C4
            x0, y0 - ry / 2); // A1

        if (fill) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
        this.ctx.closePath();
    }
    drawFilledEllipse(x0: number, y0: number, rx: number, ry: number, opt: CIRC_OPT = "U8G2_DRAW_ALL") {
        this.drawEllipse(x0, y0, rx, ry, opt, true);
    }

    drawFrame(x: number, y: number, w: number, h: number) {
        this.ctx.rect(x, y, w, h);
        this.ctx.stroke();
    }

    drawHLine(x: number, y: number, w: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + w, y);
        this.ctx.stroke();
    }

    drawVLine(x: number, y: number, h: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + h);
        this.ctx.stroke();
    }

    drawLine(x0: number, y0: number, x1: number, y1: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
    }

    drawPixel(x: number, y: number) {
        // todo: this is bad, because of the twos, i.e. it will break if a different scale is used
        const id = this.ctx.createImageData(2, 2);
        const d = id.data;
        const hexColor = this.display.getColorValue(this.drawColor);
        d[0] = parseInt(hexColor.slice(1, 1 + 2), 16);
        d[1] = parseInt(hexColor.slice(3, 3 + 2), 16);
        d[2] = parseInt(hexColor.slice(5, 5 + 2), 16);
        d[3] = 255;
        console.log(d);
        this.ctx.putImageData(id, x * 2, y * 2);
    }

    drawRFrame(x: number, y: number, w: number, h: number, r: number) {
        this.drawVLine(x, y + r, h - 2 * r);
        this.drawVLine(x + w, y + r, h - 2 * r);
        this.drawHLine(x + r, y, w - 2 * r);
        this.drawHLine(x + r, y + h, w - 2 * r);
        this.drawCircle(x + w - r, y + r, r, "U8G2_DRAW_UPPER_RIGHT");
        this.drawCircle(x + r, y + r, r, "U8G2_DRAW_UPPER_LEFT");
        this.drawCircle(x + r, y + h - r, r, "U8G2_DRAW_LOWER_LEFT");
        this.drawCircle(x + w - r, y + h - r, r, "U8G2_DRAW_LOWER_RIGHT");
    }

    drawRBox(x: number, y: number, w: number, h: number, r: number) {
        this.drawBox(x + r, y, w - 2 * r, r);
        this.drawBox(x, y + r, r, h - 2 * r);
        this.drawBox(x + r, y + h - r, w - 2 * r, r);
        this.drawBox(x + w - r, y + r, r, h - 2 * r);
        this.drawBox(x + r, y + r, w - 2 * r, h - 2 * r);

        this.drawDisk(x + w - r, y + r, r, "U8G2_DRAW_UPPER_RIGHT");
        this.drawDisk(x + r, y + r, r, "U8G2_DRAW_UPPER_LEFT");
        this.drawDisk(x + r, y + h - r, r, "U8G2_DRAW_LOWER_LEFT");
        this.drawDisk(x + w - r, y + h - r, r, "U8G2_DRAW_LOWER_RIGHT");
    }

    setDrawColor(color: number) {
        this.ctx.fillStyle = this.display.getColorValue(color);
        this.ctx.strokeStyle = this.display.getColorValue(color);
        this.drawColor = color;
    }
}
