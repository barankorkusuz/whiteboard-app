"use client";
import React, { useEffect } from "react";
import {Stage, Layer, Line, Circle, Text } from "react-konva";
import { useParams } from "next/navigation";
import * as Y from "yjs";
import { WebsocketProvider} from "y-websocket";
import { useRef } from "react";


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

  const [remoteCursors, setRemoteCursors] = React.useState<{[clientId: number]: {x: number; y: number; name: string; color: string};}>({});
  const userColor = useRef(`hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`);
  const userName = useRef(`User-${Math.floor(Math.random() * 1000)}`);

  const params = useParams();
  const boardId = params.id as string;

  const ydocRef = useRef<Y.Doc | null>(null);
  const ylinesRef = useRef<Y.Array<LineData> | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  useEffect(()=> {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider("ws://localhost:1234", boardId, ydoc);
    const ylines = ydoc.getArray<LineData>("lines");

    providerRef.current = provider;

    

    provider.awareness.setLocalStateField("user", {
      name: userName.current,
      color: userColor.current,
    });

    provider.awareness.on("change", () => {
      const states = provider.awareness.getStates();
      const cursors: typeof remoteCursors = {};

      states.forEach((state, clientId) => {
        if (clientId === provider.awareness.clientID) return;
        if (state.cursor && state.user){
          cursors[clientId] = {
            x: state.cursor.x,
            y: state.cursor.y,
            name: state.user.name,
            color: state.user.color,
          };
        }
      });
      setRemoteCursors(cursors);
    });

    ydocRef.current = ydoc;
    ylinesRef.current = ylines;

    const updateLines = () => {
      setLines(ylines.toArray());
    };

    ylines.observe(updateLines);

    provider.on("status", (event: any) => {
      console.log("Yjs connection status: ", event.status);
    });

    provider.on("sync", (isSynced: boolean) =>{
      if (isSynced && ylines.length === 0){
        fetch(`/api/boards/${boardId}`)
          .then((res) => res.json())
          .then((board) => {
        if (board.content && board.content.length > 0){
          ylines.push(board.content);
        }
      });
      }
    });

    

    return () =>{
      ylines.unobserve(updateLines);
      provider.destroy();
    };
  }, [boardId]);

  const handleSave = async () => {

    await fetch("/api/boards", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({id: boardId, title: "My Board", content: lines}),
    });
  }

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, {tool, points: [pos.x, pos.y], color, strokeWidth}]);
    //ylinesRef.current?.push([...lines, {tool, points: [pos.x, pos.y], color, strokeWidth}]);
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    providerRef.current?.awareness.setLocalStateField("cursor", point);
    // no drawing - skipping
    if (!isDrawing.current){
      return;
    }

    
    let lastLine = lines[lines.length-1];

    //add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    //replace last
    lines.splice(lines.length - 1, 1, lastLine);
    //ylinesRef.current?.push(lines.concat());
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    const finishedLine = lines[lines.length - 1];
    ylinesRef.current?.push([finishedLine]);

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
      onMouseUp = {handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      >
      
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

      {Object.entries(remoteCursors).map(([clientId, cursor]) => (
        <React.Fragment key = {clientId}>
          <Circle x = {cursor.x} y = {cursor.y} radius = {5} fill = {cursor.color} />
          <Text x = {cursor.x + 8} y = {cursor.y - 8} text = {cursor.name} fill = {cursor.color} fontSize = {12}/>
        </React.Fragment>
      ))}

      
        

      </Layer>
    </Stage>
    </div>
  );
}
export default App
