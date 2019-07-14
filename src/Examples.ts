
export interface UiExample {
    name: string;
    code: string;
}

export const INTRO: UiExample = {
    name: "Intro",
    code: "\nuint8_t helper = 0;" +
        "\nvoid draw(U8G2 u8g2) {" +
        "\n    u8g2.setDrawColor(1);" +
        "\n    u8g2.drawPixel(1, 0);" +
        "\n    u8g2.drawPixel(3, 0);" +
        "\n    u8g2.setFont(u8g2_font_timR12_tf);" +
        "\n    u8g2.drawStr(1,16,\"Hi, this editor supports\");" +
        "\n    u8g2.drawStr(1,32,\"a tiny bit of C++ transp.\");" +
        "\n    u8g2.drawStr(1,48,\"but it is infact javascript\");" +
        "\n    // this should help you copy and paste the \"c++\" code to the Arduino IDE" +
        "\n    // Datatypes get translated to \"var\": (u)int(8,16,32)(_t), float, double" +
        "\n" +
        "\n    // this code gets eval(..)'ed in the background with an fake u8g2 instance mapped to the HTML5 Canvas above" +
        "\n}"
}

const BATTERY_SIGNAL: UiExample = {
    name: "Battery/Signal",
    code: "\nvoid drawBattery(U8G2 u8g2, int x, int y, int w, int h, int segments, int lvl) {" +
        "\n    u8g2.drawFrame(x,y,w,h);" +
        "\n    u8g2.drawFrame(x + w / 3, y - 2, w / 3, 2);" +
        "\n    " +
        "\n    for(int i = 0; i < segments; i++) {" +
        "\n        if ((segments -i) > lvl) {" +
        "\n            u8g2.drawFrame(x+2, y + i*h/segments + 2, w-4, h/(segments+1) - 1);" +
        "\n        } else {" +
        "\n            u8g2.drawBox(x+2, y + i*h/segments +2, w-3, h/(segments+1) - 1);" +
        "\n        }" +
        "\n    }" +
        "\n" +
        "\n}" +
        "\nvoid drawSignal(U8G2 u8g2, uint8_t x, uint8_t y, uint8_t strength) {" +
        "\n    for (uint8_t i = 0; i < strength; i++) {" +
        "\n        u8g2.drawCircle(x,y,i*3, U8G2_DRAW_UPPER_RIGHT);" +
        "\n    }" +
        "\n}" +
        "\n" +
        "\n" +
        "\nvoid draw(U8G2 u8g2) {" +
        "\n    u8g2.setDrawColor(1);" +
        "\n    u8g2.setFont(u8g2_font_courR12_tf);" +
        "\n    u8g2.drawStr(2,12,\"Battery: \");" +
        "\n    u8g2.drawStr(2,44,\"Signal: \");" +
        "\n    drawBattery(u8g2, 70,4,12,20,5,counter%6);" +
        "\n    drawSignal(u8g2, 70,46,counter%6);" +
        "\n}"
};

const UGLY_BIRD: UiExample = {
    name: "Ugly Bird",
    code: "\nvoid drawBird(U8G2 u8g2, uint8_t x0, uint8_t y0, uint8_t state) {" +
        "\n    // the eye" +
        "\n    u8g2.drawEllipse(x0,y0,5,2);" +
        "\n    u8g2.drawPixel(x0+1, y0-1);" +
        "\n    u8g2.drawPixel(x0+2, y0-1);" +
        "\n    u8g2.drawPixel(x0+2, y0);" +
        "\n" +
        "\n    // the body" +
        "\n    u8g2.drawEllipse(x0-3, y0+1, 8,5)" +
        "\n" +
        "\n    // the mouth" +
        "\n    u8g2.drawEllipse(x0+2, y0+4,3,1);" +
        "\n" +
        "\n    // the wings" +
        "\n    u8g2.drawEllipse(x0-9, y0+1 + counter % 3, 6, counter % 3 + 1);" +
        "\n}" +
        "\n" +
        "\nvoid draw(U8G2 u8g2) {" +
        "\n    u8g2.setDrawColor(1);" +
        "\n" +
        "\n    drawBird(u8g2, 30, Math.sin(counter/4)*8+20);" +
        "\n}"
};

const WEATHER_CLOCK: UiExample = {
    name: "Weather / Clock",
    code:
        "\nvoid drawLabelTop(U8G2 u8g2, uint8_t day) {" +
        "\n    u8g2.setFont(u8g2_font_courR10_tf);" +
        "\n    switch(day) {" +
        "\n        case 0:" +
        "\n                u8g2.drawStr(46,8 ,\"Monday\");" +
        "\n        break;" +
        "\n        case 1:" +
        "\n                u8g2.drawStr(44,8 ,\"Tuesday\"); " +
        "\n        break;" +
        "\n        case 2:" +
        "\n                u8g2.drawStr(39,8 ,\"Wednesday\");" +
        "\n        break;" +
        "\n        case 3:" +
        "\n                u8g2.drawStr(41,8 ,\"Thursday\");" +
        "\n        break;" +
        "\n        case 4:" +
        "\n                u8g2.drawStr(46,8 ,\"Friday\");" +
        "\n        break;" +
        "\n        case 5:" +
        "\n                u8g2.drawStr(42,8 ,\"Saturday\");" +
        "\n        break;" +
        "\n        case 6:" +
        "\n                u8g2.drawStr(46,8 ,\"Sunday\");" +
        "\n        break;" +
        "\n    }" +
        "\n" +
        "\n    u8g2.drawRFrame(u8g2.getDisplayWidth()/4, -20, u8g2.getDisplayWidth()/2,32, 4);" +
        "\n}" +
        "\n" +
        "\nvoid drawSignal(U8G2 u8g2, uint8_t strength) {" +
        "\n    for (uint8_t i = 0; i < strength; i++) {" +
        "\n        u8g2.drawVLine(u8g2.getDisplayWidth() - 10 + i*2, 6-i, i);" +
        "\n    }" +
        "\n}" +
        "\n" +
        "\nvoid drawMiniBattery(U8G2 u8g2, uint8_t level) {" +
        "\n    u8g2.drawHLine(u8g2.getDisplayWidth() - 20, 2, 8);" +
        "\n    u8g2.drawPixel(u8g2.getDisplayWidth() - 20 + 8, 3);" +
        "\n    u8g2.drawPixel(u8g2.getDisplayWidth() - 20 + 8, 4);" +
        "\n    u8g2.drawPixel(u8g2.getDisplayWidth() - 20, 3);" +
        "\n    u8g2.drawPixel(u8g2.getDisplayWidth() - 20, 4);" +
        "\n    u8g2.drawHLine(u8g2.getDisplayWidth() - 20, 5, 8);" +
        "\n" +
        "\n    u8g2.drawHLine(u8g2.getDisplayWidth() - 19, 3, level%8);" +
        "\n    u8g2.drawHLine(u8g2.getDisplayWidth() - 19, 4, level%8);" +
        "\n}" +
        "\n" +
        "\nvoid drawTime(U8G2 u8g2) {" +
        "\n    u8g2.setFont(u8g2_font_courB24_tf);" +
        "\n" +
        "\n    u8g2.drawStr(28, 41, \"08:\" + (counter % 60 < 10 ? \"0\": \"\") + counter % 60);" +
        "\n}" +
        "\n" +
        "\nvoid drawTemp(U8G2 u8g2, float value) {" +
        "\n    u8g2.setFont(u8g2_font_courB12_tf);" +
        "\n    u8g2.drawStr(1, u8g2.getDisplayHeight()-1, \"\" + value + \"C\");" +
        "\n" +
        "\n    u8g2.drawRFrame(-4, u8g2.getDisplayHeight()-11, 64,24, 4);" +
        "\n}" +
        "\n" +
        "\nvoid drawPres(U8G2 u8g2, float value) {" +
        "\n    u8g2.setFont(u8g2_font_courB12_tf);" +
        "\n    u8g2.drawStr(u8g2.getDisplayWidth() - (\"\" + value).length*10 +2, u8g2.getDisplayHeight()-1, \"\" + value + \"mb\");" +
        "\n" +
        "\n    u8g2.drawRFrame(u8g2.getDisplayWidth()/2+4, u8g2.getDisplayHeight()-11, 64,24, 4);" +
        "\n}" +
        "\n" +
        "\nvoid draw(U8G2 u8g2) {" +
        "\n    u8g2.setDrawColor(1);" +
        "\n    drawLabelTop(u8g2, counter % 7);" +
        "\n    drawSignal(u8g2, counter % 7);" +
        "\n    drawMiniBattery(u8g2, counter);" +
        "\n    drawTime(u8g2);" +
        "\n    drawTemp(u8g2, 23.4);" +
        "\n    drawPres(u8g2, 1024.3);" +
        "\n}"
};

export const examples = [INTRO, BATTERY_SIGNAL, UGLY_BIRD, WEATHER_CLOCK];
