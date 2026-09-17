import { useEffect, useRef, useState, useCallback } from "react"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import { LineData, CursorData } from "./types"
import { fetchBoard } from "./api"

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:1234";

export function useWhiteboardSync(boardId: string){

    const [lines, setLines] = useState<LineData[]>([]);
    const [liveLines, setLiveLines] = useState<{ [clientId: number]: LineData }>({});
    const [remoteCursors, setRemoteCursors] = useState<{ [clientId: number]: CursorData }>({});

    const ylinesRef = useRef<Y.Array<LineData> | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);

    

    useEffect(() => {
        const userName = `User-${Math.floor(Math.random() * 1000)}`;
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider(WEBSOCKET_URL, boardId, ydoc);
        const ylines = ydoc.getArray<LineData>("lines");

        ylinesRef.current = ylines;
        providerRef.current = provider;

        provider.awareness.setLocalStateField("user", {
            name: userName,
        });

        const updateLines = () => setLines(ylines.toArray());
        ylines.observe(updateLines);


        provider.awareness.on("change", () => {
            const states = provider. awareness.getStates();
            const cursors: typeof remoteCursors = {};
            const drawingLines: typeof liveLines = {};

            states.forEach((state, clientId) => {
                if (clientId === provider.awareness.clientID) return;
                if (state.cursor && state.user){
                    cursors[clientId] = {x: state.cursor.x, y: state.cursor.y, name: state.user.name, color: state.drawSettings.color || "#000000", strokeWidth: state.drawSettings.strokeWidth || 5, tool: state.drawSettings.tool || "pen" };
                }
                if (state.liveLine){
                    drawingLines[clientId] = state.liveLine;
                }
            });
            setRemoteCursors(cursors);
            setLiveLines(drawingLines);
        });

        provider.on("sync", (isSynced: boolean) => {
            if (isSynced && ylines.length === 0){
                fetchBoard(boardId).then((board) => {
                    if (board.content?.length > 0) ylines.push(board.content);
                });
            }
        });
        
        return () => {
            ylines.unobserve(updateLines);
            provider.destroy();
        };
        
    }, [boardId]);

    const pushLine = useCallback((line: LineData) => ylinesRef.current?.push([line]), []);
    const clearLines = useCallback(() => {
        const ylines = ylinesRef.current;
        if (ylines) ylines.delete(0, ylines.length);
    }, []);
    const updateCursor = useCallback((point: { x: number, y: number }) => providerRef.current?.awareness.setLocalStateField("cursor", point), []);
    const updateLiveLine = useCallback((line: LineData | null) => {providerRef.current?.awareness.setLocalStateField("liveLine", line)}, []);
    const updateDrawSettings = useCallback((settings: {color: string, strokeWidth: number, tool: "pen" | "eraser"}) => {providerRef.current?.awareness.setLocalStateField("drawSettings", settings)},[]);
    
    return { lines, setLines, remoteCursors, liveLines, pushLine, clearLines, updateCursor, updateLiveLine, updateDrawSettings };
}