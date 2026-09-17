"use-client"

import { forwardRef, Fragment, useImperativeHandle, useRef } from "react";
import { Stage, Layer, Line, Circle, Text } from "react-konva";
import Konva from "konva";
import { LineData, CursorData } from "@/lib/types";

type CanvasProps = {
    lines: LineData[];
    remoteCursors: { [clientId: number]: CursorData };
    onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
    onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
    onMouseUp: () => void;
    width?: number;
    height?: number;
    liveLines: { [clientId: number]: LineData };
};

export type CanvasHandle = {
    exportPNG: (pixelRatio?: number) => string | undefined;
};

const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas({
    lines,
    remoteCursors,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    width = 1000,
    height = 700,
    liveLines,
}, ref){
    const contentLayerRef = useRef<Konva.Layer>(null);

    useImperativeHandle(ref, () => ({
        exportPNG: (pixelRatio = 2) => contentLayerRef.current?.toDataURL({ pixelRatio }),
    }));

    return(
        <div className="bg-white border border-gray-200 shadow-sm">
            <Stage
                width={width}
                height={height}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
            >
                <Layer ref = {contentLayerRef}>
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
                    {Object.entries(liveLines).map(([clientId, line]) => (
                        <Line
                            key = {`live-${clientId}`}
                            points={line.points}
                            stroke={line.color}
                            strokeWidth={line.strokeWidth}
                            tension={0.5}
                            lineCap="round"
                            lineJoin="round"
                            globalCompositeOperation={line.tool === "eraser" ? "destination-out": "source-over"}
                        />
                    ))}
                    </Layer>
                    <Layer listening={false}>
                        {Object.entries(remoteCursors).map(([clientId, cursor]) => (
                            <Fragment key={clientId}>
                            <Circle 
                                x={cursor.x}
                                y={cursor.y}
                                radius={cursor.strokeWidth/2}
                                fill={cursor.tool === "eraser" ? "transparent" : cursor.color}
                                stroke={cursor.color}
                                strokeWidth={cursor.tool === "eraser" ? 2 : 0}
                            />
                            <Text x={cursor.x - 24} y={cursor.y + 8} text={cursor.name} fill={cursor.color}/>
                        </Fragment>
                        ))}
                    </Layer>
            </Stage>
        </div>
    );
});

export default Canvas