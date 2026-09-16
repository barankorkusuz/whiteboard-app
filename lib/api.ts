import {LineData} from "./types"

type Board = {
    id: string;
    title: string;
    content: LineData[];
    createdAt: string;
    updatedAt: string;
};

export async function createBoard(title: string = "Untitled Board"): Promise<Board>{

    const res = await fetch("/api/boards", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title, content: []}),
    });

    return res.json();
}

export async function saveBoard(id: string, content: LineData[]): Promise<Board>{
    const res = await fetch("/api/boards", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id, content}),
    });

    return res.json();
}

export async function fetchBoard(id: string): Promise<Board>{
    const res = await fetch(`/api/boards/${id}`);
    return res.json();
}