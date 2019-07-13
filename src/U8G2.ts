export class U8G2 {
    constructor(private ctx: CanvasRenderingContext2D) {
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
    }

    drawLine(x0: number, y0: number, x1: number, y1: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
    }
}
