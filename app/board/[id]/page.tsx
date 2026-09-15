"use client";
import React, { useEffect } from "react";
import {Stage, Layer, Line } from "react-konva";
import { useParams } from "next/navigation";

type LineData = {
    points: typeof Line[];
    color: string;
    strokeWidth: number;
};

const App = () => {
  const [tool, setTool] = React.useState("pen");
  const [lines, setLines] = React.useState<LineData[]>([]);
  const [color, setColor] = React.useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = React.useState<number>(5);
  const isDrawing = React.useRef(false);

  const params = useParams();
  const boardId = params.id as string;

  useEffect(() => {
      fetch(`api/boards/${boardId}`)
      .then((res) => res.json())
      .then((board) => {
        if (board.content){
          setLines(board.content);
        }
      })
  }, [boardId]);

  const handleSave = async () => {

    const res = await fetch("/api/boards", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({id: boardId, title: "My Board", content: lines}),
    });

    const board = await res.json();
    setBoardId(board.id);
    localStorage.setItem("boardId", board.id);
  }

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, {tool, points: [pos.x, pos.y], color, strokeWidth}]);
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current){
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length-1];

    //add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    //replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };


  return (
    <div
    style={
      {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }
    }
    >
      <button onClick={()=> setLines([])}> Clear </button>
      <button onClick={handleSave}> Save </button>
      <select
        value = {tool}
        onChange={(e) => {setTool(e.target.value);}}>
          <option value="pen">Pen</option>
          <option value="eraser">Eraser</option>
        </select>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          />
          <input
          type="range"
          min = {1}
          max = {25}
          value = {strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          />
    <Stage 
    style={
      {
        borderWidth: "6px"
      }
    } width = {1000} 
      height = {500}
      onMouseDown = {handleMouseDown}
      onMouseMove = {handleMouseMove}
      onMouseUp = {handleMouseUp}>
      
      <Layer> 
        {lines.map((line,i) => (
          <Line
          key={i}
          points={line.points}
          stroke={line.color}
          strokeWidth={line.strokeWidth}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          globalCompositeOperation={
            line.tool === "eraser" ? "destination-out": "source-over"
          }
/>      
      ))}
        

      </Layer>
    </Stage>
    </div>
  );
}
export default App
