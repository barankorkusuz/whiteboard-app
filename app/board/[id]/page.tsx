"use client";
import React from "react";
import { useParams } from "next/navigation";
import { saveBoard } from "@/lib/api"
import { useWhiteboardSync } from "@/lib/useWhiteboardSync";
import Toolbar from "@/components/Toolbar";
import Canvas from "@/components/Canvas";

const App = () => {
  const [tool, setTool] = React.useState<"pen" | "eraser">("pen");
  const [color, setColor] = React.useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = React.useState<number>(5);
  const isDrawing = React.useRef(false);  
  
  const params = useParams();
  const boardId = params.id as string;

  const { lines, setLines, remoteCursors, pushLine, clearLines,  updateCursor } = useWhiteboardSync(boardId);

  const handleSave = async () => {
    await saveBoard(boardId, lines);
  }

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, {tool, points: [pos.x, pos.y], color, strokeWidth}]);
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    updateCursor(point);
    // no drawing - skipping
    if (!isDrawing.current){
      return;
    }

    
    let lastLine = lines[lines.length-1];

    //add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    //replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    const finishedLine = lines[lines.length - 1];
    pushLine(finishedLine);
  };


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
      />
      <div className="flex-1 flex items-center justify-center">
        <Canvas
          lines={lines}
          remoteCursors={remoteCursors}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          />
      </div>
    </div>
  );
}
export default App
