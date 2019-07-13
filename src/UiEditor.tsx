import * as React from "react";
import { Field, Control, Panel, PanelHeading, PanelBlock } from "bloomer";
import MonacoEditor from "react-monaco-editor";
import { Button } from "bloomer/lib/elements/Button";
import { U8G2 } from "./U8G2";

interface UiEditorState {
    code: string;
    lastChange: number;
    saveEnabled: boolean;
    codeEditor: monaco.editor.ICodeEditor | null;
    lcdSize: { width: number, height: number };
}

export class UiEditor extends React.Component<{}, UiEditorState> {
    canvas: CanvasRenderingContext2D | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            code: "void drawBox(U8G2 u8g2, int x0, int y0, int w, int h) {" +
                "\n    u8g2.drawLine(x0, y0, x0 + w, y0);" +
                "\n    u8g2.drawLine(x0, y0, x0, y0 + h);" +
                "\n    u8g2.drawLine(x0, y0 + h, x0 + w, y0 + h);" +
                "\n    u8g2.drawLine(x0 + w, y0, x0 + w, y0 + h);" +
                "\n}" +
                "\n" +
                "\nvoid draw(U8G2 u8g2) {" +
                "\n    u8g2.setDrawColor(1);" +
                "\n    u8g2.drawLine(10, 25, 15, 30);" +
                "\n    u8g2.drawLine(15, 30, 35, 30);" +
                "\n    u8g2.drawLine(35, 30, 40, 25);" +
                "\n" +
                "\n    drawBox(u8g2, 10, 10, 10, 10);" +
                "\n    drawBox(u8g2, 30, 10, 10, 10);" +
                "\n}"
            ,
            lastChange: Date.now(),
            saveEnabled: true,
            codeEditor: null,
            lcdSize: { width: 128, height: 64 }
        };
    }

    componentDidMount() {
        this.redraw();
    }

    transpile(code: string) {
        let transpiled = code;

        let lines = transpiled.split("\n");

        lines = lines.map(line => {
            if (line.startsWith("void")) {
                line = line.replace(new RegExp("void", "g"), "function");
                line = line.replace(new RegExp("U8G2 u8g2", "g"), "u8g2");
                line = line.replace(new RegExp("int ", "g"), "");
            }
            return line;
        });

        return lines.join("\n");
    }

    redraw = () => {
        if (this.canvas) {
            const ctx = this.canvas;
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, 100, 100);

            const u8g2: U8G2 = new U8G2(ctx);
            u8g2.setDrawColor(0);
            const transpiled = this.transpile(this.state.code);
            console.log(transpiled);
            const result = eval("(function() { " + transpiled + "return draw;})");
            if (result) {
                result()(u8g2);
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
                <PanelHeading>Display</PanelHeading>
                <PanelBlock>
                    <canvas className="lcd-canvas" ref={c => {
                        if (c) {
                            this.canvas = c.getContext("2d");
                        }
                    }
                    } width={this.state.lcdSize.width} height={this.state.lcdSize.height} />
                </PanelBlock>
            </Panel>
        );
    }

    renderCodeEditor = () => {
        return (
            <Panel>
                <PanelHeading>Code</PanelHeading>
                <Field>
                    {/* <Label></Label> */}
                    <Control>
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
                    </Control>
                </Field>
                <Button onClick={this.redraw}>Run</Button>
            </Panel>
        );
    }

    render() {
        return (
            <div className="main">
                {this.renderDisplay()}
                {this.renderCodeEditor()}
            </div>
        );
    }

}
