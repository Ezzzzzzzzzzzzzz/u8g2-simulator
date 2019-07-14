import * as React from "react";
import {
    Panel, PanelHeading,
    PanelBlock, Notification, Container, Icon, Dropdown, DropdownTrigger,
    Button, DropdownItem, DropdownContent, DropdownMenu, Column, Columns, Tile, Box, Title, Input
} from "bloomer";
import MonacoEditor from "react-monaco-editor";
import { U8G2 } from "./U8G2";
import { Display } from "./UiEditorApi";
import { examples, UiExample, INTRO } from "./Examples";

interface UiEditorState {
    code: string;
    lastChange: number;
    saveEnabled: boolean;
    codeEditor: monaco.editor.ICodeEditor | null;
    display: Display;
    lcdReady: boolean;
    errorMsg: string;
    displayDropdownActive: boolean;
    loopDropdownActive: boolean;
    exampleDropdownActive: boolean;
    fps: number;
    counter: number;
    loop: boolean;
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
            code: INTRO.code,
            lastChange: Date.now(),
            saveEnabled: true,
            codeEditor: null,
            display: oled128x64,
            displayDropdownActive: false,
            loopDropdownActive: false,
            exampleDropdownActive: false,
            lcdReady: false,
            errorMsg: "",
            loop: false,
            counter: 0,
            fps: 15
        };
        this.toggleDisplaySelector = this.toggleDisplaySelector.bind(this);
        this.toggleLoopSelector = this.toggleLoopSelector.bind(this);
        this.toggleExampleSelector = this.toggleExampleSelector.bind(this);
        this.loop = this.loop.bind(this);
    }

    componentDidMount() {
        this.redraw();
    }

    setDisplay(d: Display) {
        this.toggleDisplaySelector();
        this.setState({ display: d, lcdReady: false });
    }

    toggleDisplaySelector() {
        this.setState(prevState => ({ displayDropdownActive: !prevState.displayDropdownActive }));
    }

    toggleLoopSelector() {
        this.setState(prevState => ({ loopDropdownActive: !prevState.loopDropdownActive }));
    }

    toggleExampleSelector() {
        this.setState(prevState => ({ exampleDropdownActive: !prevState.exampleDropdownActive }));
    }

    transpile(code: string) {
        let transpiled = code;

        let lines = transpiled.split("\n");

        lines = lines.map(line => {
            if (line.startsWith("void")) {
                line = line.replace(/void /g, "function ");
                line = line.replace(/U8G2 u8g2/g, "u8g2");
                line = line.replace(/u?int((8|16|32)_t)? /g, "");
                line = line.replace(/float /g, "");
                line = line.replace(/double /g, "");
            } else {
                line = line.replace(/u?int((8|16|32)_t)? /g, "var ");
                line = line.replace(/float /g, "var ");
                line = line.replace(/double /g, "var ");
            }
            line = line.replace(/(U8G2_[a-zA-Z0-9_-]*)/g, "\"$1\"");
            line = line.replace(/(u8g2_font_[a-zA-Z0-9_-]*)/g, "\"$1\"");

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
            try {

                const result = eval("(function() { var counter = " + this.state.counter + "; " + transpiled + "return draw;})");
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
    }

    loop() {
        console.log("loop", this.state.counter);

        this.setState(prev => ({ counter: prev.counter + 1 }));
        this.redraw();
        if (this.state.loop) {
            setTimeout(this.loop, 1000 / this.state.fps);
        } else {
            this.setState({ counter: 0 });
        }

    }
    onLoopChange = () => {
        if (!this.state.loop) {
            setTimeout(this.loop, 250);
        }
        this.setState(prevState => ({ loop: !prevState.loop }));
    }

    setExample = (example: UiExample) => {
        this.setState({ code: example.code });
    }

    onFpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ fps: parseInt(e.target.value, 10) });
    }

    renderDisplay = () => {
        return (
            <div>
                <Panel>
                    <PanelHeading><Icon className="fa fa-tv" /> Display ({this.state.display.name})</PanelHeading>
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

            </div>
        );
    }

    renderDisplaySelector = () => {
        return (
            <Dropdown isActive={this.state.displayDropdownActive}>
                <DropdownTrigger>
                    <Button onClick={this.toggleDisplaySelector} isOutlined aria-haspopup="true" aria-controls="dropdown-menu">
                        <Icon className="fa fa-tv" isSize="small" />
                        <span>{this.state.display.name}</span>
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

    renderExampleSelector = () => {
        // examples
        return (
            <Dropdown isActive={this.state.exampleDropdownActive}>
                <DropdownTrigger>
                    <Button onClick={this.toggleExampleSelector} isOutlined aria-haspopup="true" aria-controls="dropdown-menu">
                        <Icon className="fa fa-file" isSize="small" />
                        <span>Examples</span>
                        <Icon className="fa fa-angle-down" isSize="small" />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu>
                    <DropdownContent>
                        {
                            examples.map(e => <DropdownItem key={e.name} onClick={() => this.setExample(e)}>{e.name}</DropdownItem>
                            )
                        }
                    </DropdownContent>
                </DropdownMenu>
            </Dropdown >
        );
    }

    renderLoopEditor = () => {
        return (
            <Dropdown isActive={this.state.loopDropdownActive}>
                <DropdownTrigger>
                    <Button isOutlined aria-haspopup="true" aria-controls="dropdown-menu">
                        <Icon onChange={this.onLoopChange} className="fa fa-play" />
                        <span onClick={this.onLoopChange} >Loop {this.state.counter > 0 ? "(" + this.state.counter + ")" : ""}</span>
                        <Icon onClick={this.toggleLoopSelector} className="fa fa-angle-down" />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu>
                    <DropdownContent>
                        <DropdownItem>FPS:</DropdownItem>
                        <DropdownItem><Input type="text" placeholder="fps" value={this.state.fps} className="small-input" onChange={this.onFpsChange} /></DropdownItem>
                    </DropdownContent>
                </DropdownMenu>
            </Dropdown>
        );
    }

    renderCodeEditor = () => {
        return (
            <Panel style={{ marginTop: "10px" }}>
                <PanelHeading><Icon className="fa fa-code" /> Code (Syntax: C++) (Do not paste from 3rd parties <Icon className="fa fa-warning" />)</PanelHeading>
                <PanelBlock>
                    {this.renderDisplaySelector()}
                    <Button onClick={() => this.redraw()}><Icon className="fa fa-cogs" />&nbsp;Run Once</Button>
                    {this.renderLoopEditor()}
                    {this.renderExampleSelector()}
                </PanelBlock>
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
            <div>
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
