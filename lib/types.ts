export type LineData = {
    tool: "pen" | "eraser";
    points: number[];
    color: string;
    strokeWidth: number;
};

export type CursorData = {
    x: number;
    y: number;
    name: string;
    color: string;
};