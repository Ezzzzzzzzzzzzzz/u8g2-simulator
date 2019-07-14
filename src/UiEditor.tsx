import * as React from "react";
import {
    Panel, PanelHeading,
    PanelBlock, Notification, Container, Icon, Dropdown, DropdownTrigger,
    Button, DropdownItem, DropdownContent, DropdownMenu, Column, Columns, Tile, Box, Title
} from "bloomer";
import MonacoEditor from "react-monaco-editor";
import { U8G2 } from "./U8G2";
import { Display } from "./UiEditorApi";

interface UiEditorState {
    code: string;
    lastChange: number;
    saveEnabled: boolean;
    codeEditor: monaco.editor.ICodeEditor | null;
    display: Display;
    lcdReady: boolean;
    errorMsg: string;
    displayDropdownActive: boolean;
}

const oled128x64: Display = {
    name: "OLED 128x64",
    width: 128,
    height: 64,
    resetColor: 0,
    getColorValue: (color: number) => {
        switch (color) {
            case 0: return "#000000";
            case 1: return "#ffffff";
            default:
                return "#FF0000";
        }
    }
};
const oled128x32: Display = {
    name: "OLED 128x32",
    width: 128,
    height: 32,
    resetColor: 0,
    getColorValue: (color: number) => {
        switch (color) {
            case 0: return "#000000";
            case 1: return "#ffffff";
            default:
                return "#FF0000";
        }
    }
};
const nokia5110: Display = {
    name: "Nokia 5110",
    width: 84,
    height: 48,
    resetColor: 0,
    getColorValue: (color: number) => {
        switch (color) {
            case 0: return "#616A4B";
            case 1: return "#222222";
            default:
                return "#FF0000";
        }
    }
};

const displays = [oled128x64, oled128x32, nokia5110];

export class UiEditor extends React.Component<{}, UiEditorState> {
    ctx: CanvasRenderingContext2D | null = null;
    canvas: HTMLCanvasElement | null = null;

    canvasX2: HTMLCanvasElement | null = null;
    canvasX4: HTMLCanvasElement | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            code: "" +
                "\nvoid draw(U8G2 u8g2) {" +
                "\n    u8g2.setDrawColor(1);" +
                "\n    u8g2.drawPixel(1, 0);" +
                "\n    u8g2.drawPixel(3, 0);" +
                "\n    u8g2.setFont(u8g2_font_timR16_tf);" +
                "\n    u8g2.drawStr(10,16,\"hi\");" +
                "\n}"
            ,
            lastChange: Date.now(),
            saveEnabled: true,
            codeEditor: null,
            display: oled128x64,
            displayDropdownActive: false,
            lcdReady: false,
            errorMsg: ""
        };
        this.toggleDisplaySelector = this.toggleDisplaySelector.bind(this);
    }

    componentDidMount() {
        this.redraw();
    }

    setDisplay(d: Display) {
        this.toggleDisplaySelector();
        this.setState({ display: d, lcdReady: false });
        setTimeout(() => this.onCodeChange(this.state.code), 100);
    }

    toggleDisplaySelector() {
        this.setState(prevState => ({ displayDropdownActive: !prevState.displayDropdownActive }));
    }

    transpile(code: string) {
        let transpiled = code;

        let lines = transpiled.split("\n");

        lines = lines.map(line => {
            if (line.startsWith("void")) {
                line = line.replace(new RegExp("void", "g"), "function");
                line = line.replace(new RegExp("U8G2 u8g2", "g"), "u8g2");
                line = line.replace(new RegExp("u*int\d*[_t]* ", "g"), "");
                line = line.replace(new RegExp("float ", "g"), "");
                line = line.replace(new RegExp("double ", "g"), "");
            } else {
                line = line.replace(new RegExp("u*int\d*[_t]* ", "g"), "var ");
                line = line.replace(new RegExp("float ", "g"), "var ");
                line = line.replace(new RegExp("double ", "g"), "");
            }
            line = line.replace(new RegExp("(U8G2_[a-zA-Z0-9_-]*)", "g"), "\"$1\"");
            line = line.replace(new RegExp("(u8g2_font_[a-zA-Z0-9_-]*)", "g"), "\"$1\"");

            return line;
        });

        return lines.join("\n");
    }

    scaleUp(ctx: CanvasRenderingContext2D, scaledCtx: CanvasRenderingContext2D, w: number, h: number) {
        let origImage = ctx.getImageData(0, 0, w, h);
        let scaledImage = scaledCtx.getImageData(0, 0, w * 2, h * 2);
        for (let y = 0; y < origImage.height; y++) {
            for (let x = 0; x < origImage.width; x++) {
                // get pixeldata (r,g,b,a)
                let origOffset = (x: number, y: number) => {
                    return (x + y * origImage.width) * 4;
                };

                let r = origImage.data[origOffset(x, y) + 0];
                let g = origImage.data[origOffset(x, y) + 1];
                let b = origImage.data[origOffset(x, y) + 2];
                let a = origImage.data[origOffset(x, y) + 3];

                // manual 2x linear scale
                scaledImage.data[(x * 2 + y * 2 * scaledImage.width) * 4 + 0] = r;
                scaledImage.data[(x * 2 + y * 2 * scaledImage.width) * 4 + 1] = g;
                scaledImage.data[(x * 2 + y * 2 * scaledImage.width) * 4 + 2] = b;
                scaledImage.data[(x * 2 + y * 2 * scaledImage.width) * 4 + 3] = a;

                scaledImage.data[((x * 2) + 1 + y * 2 * scaledImage.width) * 4 + 0] = r;
                scaledImage.data[((x * 2) + 1 + y * 2 * scaledImage.width) * 4 + 1] = g;
                scaledImage.data[((x * 2) + 1 + y * 2 * scaledImage.width) * 4 + 2] = b;
                scaledImage.data[((x * 2) + 1 + y * 2 * scaledImage.width) * 4 + 3] = a;

                scaledImage.data[(x * 2 + (y * 2 + 1) * scaledImage.width) * 4 + 0] = r;
                scaledImage.data[(x * 2 + (y * 2 + 1) * scaledImage.width) * 4 + 1] = g;
                scaledImage.data[(x * 2 + (y * 2 + 1) * scaledImage.width) * 4 + 2] = b;
                scaledImage.data[(x * 2 + (y * 2 + 1) * scaledImage.width) * 4 + 3] = a;

                scaledImage.data[((x * 2) + 1 + (y * 2 + 1) * scaledImage.width) * 4 + 0] = r;
                scaledImage.data[((x * 2) + 1 + (y * 2 + 1) * scaledImage.width) * 4 + 1] = g;
                scaledImage.data[((x * 2) + 1 + (y * 2 + 1) * scaledImage.width) * 4 + 2] = b;
                scaledImage.data[((x * 2) + 1 + (y * 2 + 1) * scaledImage.width) * 4 + 3] = a;
            }
        }
        scaledCtx.putImageData(scaledImage, 0, 0);
    }

    redraw() {
        if (this.ctx) {
            this.ctx.fillStyle = this.state.display.getColorValue(this.state.display.resetColor);
            this.ctx.fillRect(0, 0, this.state.display.width, this.state.display.height);

            const u8g2: U8G2 = new U8G2(this.ctx, this.state.display);
            const transpiled = this.transpile(this.state.code);
            // console.log(transpiled);
            try {

                const result = eval("(function() { " + transpiled + "return draw;})");
                if (result) {
                    result()(u8g2);
                    this.setState({ errorMsg: "" });
                }
            } catch (e) {
                this.setState({ errorMsg: e.name + ":\n\n" + e.message });
            }

            if (this.canvasX2) {
                let sCtx = this.canvasX2.getContext("2d");
                if (sCtx) {

                    this.scaleUp(this.ctx, sCtx, this.state.display.width, this.state.display.height);

                    if (this.canvasX4) {
                        let s4Ctx = this.canvasX4.getContext("2d");
                        if (s4Ctx) {
                            this.scaleUp(sCtx, s4Ctx, this.state.display.width * 2, this.state.display.height * 2);
                        }
                    }
                }
            }
        }
    }

    onCodeChange = (updatedCode: string) => {
        this.setState({ code: updatedCode });
        this.redraw();
    }

    renderDisplay = () => {
        return (
            <div>
                <Panel>
                    <PanelHeading><Icon className="fa fa-tv" /> Display ({this.state.display.name})</PanelHeading>
                    <PanelBlock>
                        {this.renderDisplaySelector()}
                    </PanelBlock>
                    <PanelBlock>
                        <Tile isAncestor>
                            <Tile isSize={4} isVertical isParent>
                                <Tile isChild render={
                                    (props: any) => (
                                        <Box {...props}>
                                            <Title>1:1</Title>
                                            <canvas className="lcd-canvas" ref={c => {
                                                if (c) {
                                                    this.canvas = c;
                                                    this.ctx = c.getContext("2d");
                                                    if (this.ctx && !this.state.lcdReady) {
                                                        this.setState({ lcdReady: true });
                                                    }

                                                }
                                            }
                                            } width={this.state.display.width} height={this.state.display.height} />
                                        </Box>
                                    )
                                } />
                                <Tile isChild render={
                                    (props: any) => (
                                        <Box {...props}>
                                            <Title>1:2</Title>
                                            <canvas className="lcd-canvas-scaled" ref={c => {
                                                if (c) {
                                                    this.canvasX2 = c;
                                                }
                                            }
                                            } width={this.state.display.width * 2} height={this.state.display.height * 2} />
                                        </Box>
                                    )
                                } />
                            </Tile>
                            <Tile isParent>
                                <Tile isChild render={
                                    (props: any) => (
                                        <Box {...props}>
                                            <Title>1:4</Title>
                                            <canvas className="lcd-canvas-scaled" ref={c => {
                                                if (c) {
                                                    this.canvasX4 = c;
                                                }
                                            }
                                            } width={this.state.display.width * 4} height={this.state.display.height * 4} />
                                        </Box>
                                    )
                                } />
                            </Tile>
                        </Tile>
                    </PanelBlock>
                </Panel>
                {this.state.errorMsg ?
                    <Panel>
                        <PanelHeading>Error</PanelHeading>
                        <PanelBlock>
                            <Container className="padLeft">
                                <Notification>
                                    {this.state.errorMsg}
                                </Notification>
                            </Container>
                        </PanelBlock>
                    </Panel>
                    : ""
                }
            </div>
        );
    }

    renderCodeEditor = () => {
        return (
            <Panel style={{ marginTop: "10px" }}>
                <PanelHeading><Icon className="fa fa-code" /> Code (Syntax: C++) (Do not paste from 3rd parties <Icon className="fa fa-warning" />)</PanelHeading>
                <PanelBlock>
                    {/* <Label></Label> */}
                    <MonacoEditor
                        width="100%"
                        height="500"
                        language="cpp"
                        theme="vs-light"
                        value={this.state.code}
                        options={{
                            selectOnLineNumbers: true
                        }}
                        onChange={this.onCodeChange}
                        editorDidMount={(editor: monaco.editor.ICodeEditor) => {
                            editor.focus();
                            this.setState({ codeEditor: editor });
                        }}
                    />
                </PanelBlock>
                {/* <Button onClick={this.redraw}>Run</Button> */}
            </Panel>
        );
    }

    renderDocumentation = () => {
        return (
            <Panel>
                <PanelHeading><Icon className="fa fa-file" /> Documentation</PanelHeading>
                <PanelBlock>The following functions are supported:</PanelBlock>
                <PanelBlock>
                    <br />
                    <ul>
                        {
                            Object.getOwnPropertyNames(U8G2.prototype).sort().filter(p => p !== "constructor" && !p.startsWith("_")).map(p => {
                                return <li key={p}><a href={"https://github.com/olikraus/u8g2/wiki/u8g2reference#" + p} target="_blank">{p}</a></li>;
                            })
                        }
                    </ul>
                </PanelBlock>
            </Panel>
        );
    }

    renderDisplaySelector = () => {
        return (
            <Dropdown isActive={this.state.displayDropdownActive}>
                <DropdownTrigger>
                    <Button onClick={this.toggleDisplaySelector} isOutlined aria-haspopup="true" aria-controls="dropdown-menu">
                        <span>Select</span>
                        <Icon className="fa fa-angle-down" isSize="small" />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu>
                    <DropdownContent>
                        {
                            displays.map(d => <DropdownItem key={d.name} onClick={() => this.setDisplay(d)}>{d.name}</DropdownItem>
                            )
                        }
                    </DropdownContent>
                </DropdownMenu>
            </Dropdown >
        );
    }

    render() {
        return (
            <div className="main">
                <Columns isCentered>
                    <Column isSize="3/4">
                        {this.renderDisplay()}
                        {this.renderCodeEditor()}
                    </Column>
                    <Column isSize="1/4">
                        {this.renderDocumentation()}
                    </Column>
                </Columns>
            </div>
        );
    }

}
