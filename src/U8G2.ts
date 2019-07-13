export class U8G2 {
    constructor(private ctx: CanvasRenderingContext2D) {
        this.ctx.lineWidth = 1;
        
        this.ctx.imageSmoothingEnabled = false;
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

// clear
// clearBuffer
// clearDisplay
// disableUTF8Print
// drawBitmap
// drawBox
// drawCircle
// drawDisc
// drawEllipse
// drawFilledEllipse
// drawFrame
// drawGlyph
// drawHLine
// drawLine
// drawPixel
// drawRBox
// drawRFrame
// drawStr
// drawTriangle
// drawUTF8
// drawVLine
// drawXBM
// enableUTF8Print
// firstPage
// getAscent
// getDescent
// getDisplayHeight
// getDisplayWidth
// getMaxCharHeight
// getMaxCharWidth
// getMenuEvent
// getStrWidth
// getUTF8Width
// home
// initDisplay
// nextPage
// print
// sendBuffer
// sendF
// setAutoPageClear
// setBitmapMode
// setBusClock
// setClipWindow
// setContrast
// setCursor
// setDisplayRotation
// setDrawColor
// setFlipMode
// setFont
// setFontDirection
// setFontMode
// setFontPosBaseline
// setFontPosBottom
// setFontPosTop
// setFontPosCenter
// setFontRefHeightAll
// setFontRefHeightExtendedText
// setFontRefHeightText
// setI2CAddress
// setMaxClipWindow

    drawLine(x0: number, y0: number, x1: number, y1: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
    }
}
