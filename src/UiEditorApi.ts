
export interface Display {
    name: string;
    width: number;
    height: number;
    resetColor: number;
    getColorValue(i: number): string;
}
