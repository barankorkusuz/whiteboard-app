"use-client"

import { forwardRef, Fragment, useImperativeHandle, useRef } from "react";
import { Stage, Layer, Line, Circle, Text } from "react-konva";
import Konva from "konva";
import { LineData, CursorData } from "@/lib/types";

type CanvasProps = {
    lines: LineData[];
    ownCursor: { x: number; y:number; color: string; strokeWidth: number; tool: "pen" | "eraser"} | null;
    onMouseLeave: () => void;
    remoteCursors: { [clientId: number]: CursorData };
    onMouseDown: (e: Konva.KonvaEventObject<PointerEvent>) => void;
    onMouseMove: (e: Konva.KonvaEventObject<PointerEvent>) => void;
    onMouseUp: () => void;
    width?: number;
    height?: number;
    scale?: number;
    liveLines: { [clientId: number]: LineData };
};

export type CanvasHandle = {
    exportPNG: (pixelRatio?: number) => string | undefined;
};

const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas({
    lines,
    ownCursor,
    onMouseLeave,
    remoteCursors,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    width = 1000,
    height = 700,
    scale = 1,
    liveLines,
}, ref){
    const contentLayerRef = useRef<Konva.Layer>(null);

    useImperativeHandle(ref, () => ({
        exportPNG: (pixelRatio = 2) => contentLayerRef.current?.toDataURL({ pixelRatio: pixelRatio / scale }),
    }));

    return(
        <div className="bg-white border border-gray-200 shadow-sm touch-none select-none [-webkit-touch-callout:none]" style={{ width: width * scale, height: height * scale}}>
            <Stage
                width={width * scale}
                height={height * scale}
                scaleX={scale}
                scaleY={scale}
                onPointerDown={onMouseDown}
                onPointerMove={onMouseMove}
                onPointerUp={onMouseUp}
                onPointerLeave={onMouseLeave}
                style={{ touchAction: "none", userSelect: "none", WebkitTouchCallout: "none", cursor: "none" }}
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
                        {ownCursor && (
                            <Circle 
                                x={ownCursor.x}
                                y={ownCursor.y}
                                radius={ownCursor.strokeWidth/2}
                                fill={ownCursor.tool === "eraser" ? "transparent" : ownCursor.color}
                                stroke={ownCursor.color}
                                strokeWidth={ownCursor.tool === "eraser" ? 2 : 0}
                            />
                        )}
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