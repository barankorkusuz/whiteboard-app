"use-client"

import { Fragment } from "react";
import { Stage, Layer, Line, Circle, Text } from "react-konva";
import { LineData, CursorData } from "@/lib/types";

type CanvasProps = {
    lines: LineData[];
    remoteCursors: { [clientId: number]: CursorData };
    onMouseDown: (e: any) => void;
    onMouseMove: (e: any) => void;
    onMouseUp: () => void;
    width?: number;
    height?: number;
};

export default function Canvas({
    lines,
    remoteCursors,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    width = 1000,
    height = 700,
}: CanvasProps){

    return(
        <div className="bg-white border border-gray-200 shadow-sm">
        <Stage
            width={width}
            height={height}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        >
            <Layer>
                {lines.map((line, i) => (
                    <Line
                        key={i}
                        points={line.points}
                        stroke={line.color}
                        strokeWidth={line.strokeWidth}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                        globalCompositeOperation={line.tool === "eraser" ? "destination-out": "source-over"}
                    />
                ))}
                {Object.entries(remoteCursors).map(([clientId, cursor]) => (
                    <Fragment key={clientId}>
                        <Circle x={cursor.x} y={cursor.y} radius={5} fill={cursor.color} />
                        <Text x={cursor.x + 8} y={cursor.y -8} text={cursor.name} fill={cursor.color}/>
                    </Fragment>
                ))

                }
                </Layer>
        </Stage>
        </div>
    );
}
