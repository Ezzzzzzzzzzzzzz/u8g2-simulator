import * as React from "react";
import {
    Panel, PanelHeading,
    PanelBlock, Notification, Container, Icon, Dropdown, DropdownTrigger,
    Button, DropdownItem, DropdownContent, DropdownMenu, Column, Columns
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
    canvas: CanvasRenderingContext2D | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            code: "" +
                "\nvoid draw(U8G2 u8g2) {" +
                "\n    u8g2.setDrawColor(1);" +
                "\n    u8g2.drawCircle(32, 32, 16);" +
                "\n    u8g2.u8g2_draw_circle(66, 32, 16);" +
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

    redraw() {
        if (this.canvas) {
            const ctx = this.canvas;
            ctx.fillStyle = this.state.display.getColorValue(this.state.display.resetColor);
            ctx.fillRect(0, 0, this.state.display.width, this.state.display.height);

            const u8g2: U8G2 = new U8G2(ctx, this.state.display);
            const transpiled = this.transpile(this.state.code);
            console.log(transpiled);
            try {

                const result = eval("(function() { " + transpiled + "return draw;})");
                if (result) {
                    result()(u8g2);
                    this.setState({ errorMsg: "" });
                }
            } catch (e) {
                this.setState({ errorMsg: e.name + ":\n\n" + e.message });
            }
        }
    }

    onCodeChange = (updatedCode: string) => {
        this.setState({ code: updatedCode });
        this.redraw();
    }

    renderDisplay = () => {
        return (
            <Panel>
                <PanelHeading><Icon className="fa fa-tv" /> Display ({this.state.display.name})</PanelHeading>
                <PanelBlock>
                    {this.renderDisplaySelector()}
                </PanelBlock>
                <PanelBlock>
                    <canvas className="lcd-canvas" ref={c => {
                        if (c) {
                            console.log("assigned canvas");
                            this.canvas = c.getContext("2d");
                            if (this.canvas && !this.state.lcdReady) {
                                this.canvas.scale(1, 1);
                                this.setState({ lcdReady: true });
                            }

                        }
                    }
                    } width={this.state.display.width} height={this.state.display.height} />
                    {this.state.errorMsg ?
                        <Container className="padLeft">
                            <Notification>
                                {this.state.errorMsg}
                            </Notification>
                        </Container> : ""
                    }
                </PanelBlock>
            </Panel>
        );
    }

    renderCodeEditor = () => {
        return (
            <Panel>
                <PanelHeading><Icon className="fa fa-code" /> Code (C++)</PanelHeading>
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
                            Object.getOwnPropertyNames(U8G2.prototype).sort().filter(p => p !== "constructor").map(p => {
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
