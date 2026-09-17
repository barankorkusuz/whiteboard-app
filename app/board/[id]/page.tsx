"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { saveBoard } from "@/lib/api"
import { useWhiteboardSync } from "@/lib/useWhiteboardSync";
import Toolbar from "@/components/Toolbar";
import Canvas from "@/components/Canvas";
import type { CanvasHandle } from "@/components/Canvas";
import { useRef } from "react";
import type Konva from "konva";

const App = () => {
  const [tool, setTool] = React.useState<"pen" | "eraser">("pen");
  const [color, setColor] = React.useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = React.useState<number>(5);
  const isDrawing = React.useRef(false);  
  
  const params = useParams();
  const boardId = params.id as string;

  const canvasRef = useRef<CanvasHandle>(null);

  const { lines, setLines, remoteCursors, liveLines, pushLine, clearLines, updateCursor, updateLiveLine, updateDrawSettings } = useWhiteboardSync(boardId);

  const handleSave = async () => {
    await saveBoard(boardId, lines);
  }

  const handleMouseDown = (e:Konva.KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    const newLine = {tool, points: [pos.x, pos.y], color, strokeWidth}
    setLines([...lines, newLine]);
    updateLiveLine(newLine);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    updateCursor(point);
    // no drawing - skipping
    if (!isDrawing.current)return;
    
    const lastLine = lines[lines.length-1];
    const updatedLine = {
      ...lastLine,
      points: [...lastLine.points, point.x, point.y],
    };
    setLines([...lines.slice(0, -1), updatedLine]);
    updateLiveLine(updatedLine);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    const finishedLine = lines[lines.length - 1];
    pushLine(finishedLine);
    updateLiveLine(null);
  };

  const handleExport = () => {
    const uri = canvasRef.current?.exportPNG();
    if (!uri) return;

    const link = document.createElement("a");
    link.download = `board-${boardId}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    updateDrawSettings({color, strokeWidth, tool});
  }, [color, strokeWidth, tool , updateDrawSettings]);


  return (
    <div className="flex flex-col h-screen bg-[#FAFAF9] text-[#1C1C1C]">
      <Toolbar
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        tool={tool}
        onToolChange={setTool}
        onClear={clearLines}
        onSave={handleSave}
        onExport={handleExport}
      />
      <div className="flex-1 flex items-center justify-center">
        <Canvas
          lines={lines}
          remoteCursors={remoteCursors}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={canvasRef}
          liveLines={liveLines}
          />
      </div>
    </div>
  );
}
export default App
