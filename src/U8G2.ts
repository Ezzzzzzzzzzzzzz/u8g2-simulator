import { Display } from "./UiEditorApi";

export type CIRC_OPT =
    "U8G2_DRAW_UPPER_RIGHT" |
    "U8G2_DRAW_UPPER_LEFT" |
    "U8G2_DRAW_LOWER_LEFT" |
    "U8G2_DRAW_LOWER_RIGHT" |
    "U8G2_DRAW_ALL";

const adobeFontMapper = (font: string) => {
    // u8g2_font_[]_tf
    const parts = font.split("_");
    let f = parts[2];
    let fontName = "Courier";
    if (f.startsWith("cour")) {
        fontName = "Courier";
        f = f.substring(4);
    } else if (f.startsWith("helv")) {
        fontName = "Helvetica";
        f = f.substring(4);
    } else if (f.startsWith("tim")) {
        fontName = "Times New Roman";
        f = f.substring(3);
    }

    if (f.startsWith("B")) {
        return "bold " + f.split("B")[1] + "px " + fontName;
    } else if (f.startsWith("R")) {
        return f.split("R")[1] + "px " + fontName;
    }

    return "08px Courier";
};

export class U8G2 {
    private drawColor = 0;
    private font: string = adobeFontMapper("u8g2_font_courR08_tf");

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


    private drawCircleSection(x: number, y: number, x0: number, y0: number, option: CIRC_OPT) {
        if (option === "U8G2_DRAW_UPPER_RIGHT" || option === "U8G2_DRAW_ALL") {
            this.drawPixel(x0 + x, y0 - y);
            this.drawPixel(x0 + y, y0 - x);
        }

        if (option === "U8G2_DRAW_UPPER_LEFT" || option === "U8G2_DRAW_ALL") {
            this.drawPixel(x0 - x, y0 - y);
            this.drawPixel(x0 - y, y0 - x);
        }

        if (option === "U8G2_DRAW_LOWER_LEFT" || option === "U8G2_DRAW_ALL") {
            this.drawPixel(x0 + x, y0 + y);
            this.drawPixel(x0 + y, y0 + x);
        }

        if (option === "U8G2_DRAW_LOWER_RIGHT" || option === "U8G2_DRAW_ALL") {
            this.drawPixel(x0 - x, y0 + y);
            this.drawPixel(x0 - y, y0 + x);
        }

    }

    drawCircle(x0: number, y0: number, rad: number, option: CIRC_OPT = "U8G2_DRAW_ALL") {
        let f;
        let ddFx;
        let ddFy;
        let x;
        let y;

        f = 1;
        f -= rad;
        ddFx = 1;
        ddFy = 0;
        ddFy -= rad;
        ddFy *= 2;
        x = 0;
        y = rad;

        this.drawCircleSection(x, y, x0, y0, option);

        while (x < y) {
            if (f >= 0) {
                y--;
                ddFy += 2;
                f += ddFy;
            }
            x++;
            ddFx += 2;
            f += ddFx;

            this.drawCircleSection(x, y, x0, y0, option);
        }
    }

    private drawDiskSection(x: number, y: number, x0: number, y0: number, option: CIRC_OPT) {
        if (option === "U8G2_DRAW_UPPER_RIGHT" || option === "U8G2_DRAW_ALL") {
            this.drawVLine(x0 + x, y0 - y, y + 1);
            this.drawVLine(x0 + y, y0 - x, x + 1);
        }

        if (option === "U8G2_DRAW_UPPER_LEFT" || option === "U8G2_DRAW_ALL") {
            this.drawVLine(x0 - x, y0 - y, y + 1);
            this.drawVLine(x0 - y, y0 - x, x + 1);
        }

        if (option === "U8G2_DRAW_LOWER_LEFT" || option === "U8G2_DRAW_ALL") {
            this.drawVLine(x0 + x, y0, y + 1);
            this.drawVLine(x0 + y, y0, x + 1);
        }

        if (option === "U8G2_DRAW_LOWER_RIGHT" || option === "U8G2_DRAW_ALL") {
            this.drawVLine(x0 - x, y0, y + 1);
            this.drawVLine(x0 - y, y0, x + 1);
        }

    }

    drawDisk(x0: number, y0: number, rad: number, option: CIRC_OPT = "U8G2_DRAW_ALL") {
        let f;
        let ddFx;
        let ddFy;
        let x;
        let y;

        f = 1;
        f -= rad;
        ddFx = 1;
        ddFy = 0;
        ddFy -= rad;
        ddFy *= 2;
        x = 0;
        y = rad;

        this.drawDiskSection(x, y, x0, y0, option);

        while (x < y) {
            if (f >= 0) {
                y--;
                ddFy += 2;
                f += ddFy;
            }
            x++;
            ddFx += 2;
            f += ddFx;

            this.drawDiskSection(x, y, x0, y0, option);
        }
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
        this.drawHLine(x, y, w);
        this.drawHLine(x, y + h, w);

        this.drawVLine(x, y, h);
        this.drawVLine(x + w, y, h);
    }

    drawHLine(x: number, y: number, w: number) {
        for (let i = 0; i < w; i++) {
            this.drawPixel(x + i, y);
        }
    }

    drawVLine(x: number, y: number, h: number) {
        for (let i = 0; i < h; i++) {
            this.drawPixel(x, y + i);
        }
    }

    drawLine(x0: number, y0: number, x1: number, y1: number) {
        // first draw the start/stop
        this.drawPixel(x0, y0);
        this.drawPixel(x1, y1);

        // catch the pixel
        if (x0 === x1 && y0 === y1) {
            // we are done here
            return;
        }

        // catch the VLine
        if (x0 === x1) {
            if (y0 < y1) {
                this.drawVLine(x0, y0, y1 - y0);
            } else {
                this.drawVLine(x0, y1, y0 - y1);
            }
            return;
        }

        // catch the HLine
        if (y0 === y1) {
            if (x0 < x1) {
                this.drawHLine(x0, y0, x1 - x0);
            } else {
                this.drawHLine(x1, y0, x0 - x1);
            }
            return;
        }

        const w = Math.abs(x1 - x0);
        const s = w / Math.abs(y1 - y0);

        if (x0 < x1) {
            let y = 0;
            for (let x = 0; x < w; x += s) {
                this.drawHLine(x0 + x, y0 + y, s);
                if (y0 < y1) {
                    y++;
                } else {
                    y--;
                }
            }
        }
        if (x0 > x1) {
            let y = 0;
            for (let x = 0; x < w; x += s) {
                this.drawHLine(x1 + x, y1 + y, s);
                if (y0 > y1) {
                    y++;
                } else {
                    y--;
                }
            }
        }
    }

    drawPixel(x: number, y: number) {
        const id = this.ctx.createImageData(1, 1);
        const d = id.data;
        const hexColor = this.display.getColorValue(this.drawColor);
        d[0] = parseInt(hexColor.slice(1, 1 + 2), 16);
        d[1] = parseInt(hexColor.slice(3, 3 + 2), 16);
        d[2] = parseInt(hexColor.slice(5, 5 + 2), 16);
        d[3] = 255;

        console.log(x, y);
        this.ctx.putImageData(id, x, y);
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

    drawTriangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) {
        this.drawLine(x0, y0, x1, y1);
        this.drawLine(x1, y1, x2, y2);
        this.drawLine(x2, y2, x0, y0);
    }

    setFont(font: string) {
        this.font = adobeFontMapper(font);
    }

    drawString(x: number, y: number, str: string) {
        this.ctx.font = this.font;
        this.ctx.fillText(str, x, y);
    }

    setDrawColor(color: number) {
        this.ctx.fillStyle = this.display.getColorValue(color);
        this.ctx.strokeStyle = this.display.getColorValue(color);
        this.drawColor = color;
    }

    getDisplayHeight() {
        return this.display.height;
    }

    getDisplayWidth() {
        return this.display.width;
    }

    getStrWidth(txt: string) {
        return this.ctx.measureText(txt);
    }

    drawBitmap(x0: number, y0: number, cnt: number, h: number, bitmap: number[]) {
        // cnt: Number of bytes of the bitmap in horizontal direction. The width of the bitmap is cnt*8.
        // h: Height of the bitmap.

        for (let x = 0; x < cnt; x++) {
            for (let y = 0; y < h; y++) {

                const bytes = (bitmap[x + y * cnt] + 256).toString(2);
                for (let b = 0; b < 8; b++) {
                    if (bytes[b + 1] === "1") {
                        this.drawPixel(x * 8 + x0 + b, y + y0);
                    }
                }
            }
        }
    }

    drawXBM(x0: number, y0: number, w: number, h: number, bitmap: number[]) {
        // first find out the real width of the xbm
        const fixedW = w % 8 === 0 ? w : (Math.floor(w / 8) + 1) * 8;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < fixedW; x++) {
                if (x >= w) {
                    break;
                }
                // get next byte
                const byteIndex = Math.floor((x + y * fixedW) / 8);
                const byte = bitmap[byteIndex];
                const bits = (byte + 256).toString(2);

                if (bits[8 - (x + y * fixedW) % 8] === "1") {
                    this.drawPixel(x + x0, y + y0);
                }
            }
        }
    }
}
