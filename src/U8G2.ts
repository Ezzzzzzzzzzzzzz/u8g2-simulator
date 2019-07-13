export class U8G2 {
    private drawColor = 0;

    constructor(private ctx: CanvasRenderingContext2D, private resetColor: number, private width: number, private height: number) {
        this.ctx.lineWidth = 1;
        this.ctx.imageSmoothingEnabled = false;
    }

    clear() {
        let t = this.drawColor;
        this.setDrawColor(this.resetColor);
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.width, this.height);
        this.ctx.fill();
        this.setDrawColor(t);
    }

    setDrawColor(color: number) {
        switch (color) {
            case 0:
                this.ctx.fillStyle = "#000000";
                this.ctx.strokeStyle = "#000000";
                break;
            case 1:
                this.ctx.fillStyle = "#FFFFFF";
                this.ctx.strokeStyle = "#FFFFFF";
                break;
        }
        this.drawColor = color;
    }

    drawLine(x0: number, y0: number, x1: number, y1: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
    }
}
