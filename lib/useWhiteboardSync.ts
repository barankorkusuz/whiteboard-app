import { useEffect, useRef, useState } from "react"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import { LineData, CursorData } from "./types"
import { fetchBoard } from "./api"

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:1234";

export function useWhiteboardSync(boardId: string){

    const [lines, setLines] = useState<LineData[]>([]);
    const [remoteCursors, setRemoteCursors] = useState<{ [clientId: number]: CursorData }>({});

    const ylinesRef = useRef<Y.Array<LineData> | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);

    const userColor = useRef(`hsl(${Math.floor(Math.random() * 360)}, 70% 50%)`);
    const userName = useRef(`User-${Math.floor(Math.random() * 1000)}`);

    useEffect(() => {
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider(WEBSOCKET_URL, boardId, ydoc);
        const ylines = ydoc.getArray<LineData>("lines");

        ylinesRef.current = ylines;
        providerRef.current = provider;

        provider.awareness.setLocalStateField("user", {
            name: userName.current,
            color: userColor.current,
        });

        const updateLines = () => setLines(ylines.toArray());
        ylines.observe(updateLines);


        provider.awareness.on("change", () => {
            const states = provider. awareness.getStates();
            const cursors: typeof remoteCursors = {};

            states.forEach((state, clientId) => {
                if (clientId === provider.awareness.clientID) return;
                if (state.cursor && state.user){
                    cursors[clientId] = {x: state.cursor.x, y: state.cursor.y, name: state.user.name, color: state.user.color};
                }
            });
            setRemoteCursors(cursors);
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

    const pushLine = (line: LineData) => ylinesRef.current?.push([line]);
    const clearLines = () => {
        const ylines = ylinesRef.current;
        if (ylines) ylines.delete(0, ylines.length);
    };
    const updateCursor = (point: { x: number, y: number }) => providerRef.current?.awareness.setLocalStateField("cursor", point);

    return { lines, setLines, remoteCursors, pushLine, clearLines, updateCursor };
}