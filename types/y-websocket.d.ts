declare module "y-websocket"{
    import * as Y from "yjs";
    import { Awareness } from "y-protocols/awareness";

    export class WebsocketProvider{
        constructor(
            serverUrl: string,
            roomname: string,
            doc: Y.Doc,
            opts?: {
                connect?: boolean;
                params?: Record<string, string>;
                resyncInterval?: number;
            }
        );

        awareness: Awareness;
        wsconnected: boolean;
        synced: boolean;

        on(event: "status", callback: (event: {status: "connected" | "disconnected"}) => void): void;
        on(event: "sync", callback: (isSynced: boolean) => void): void;

        connect(): void;
        disconnect(): void;
        destroy(): void;
    }
}