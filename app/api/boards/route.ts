import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request){

    const body = await request.json();
    const { id, title, content } = body;

    if (id){
        // if bard already exists just update it
        const board = await prisma.board.update({
            where: {id},
            data: {content},
        });
        return NextResponse.json(board);
    }
    else{
        const board = await prisma.board.create({
            data: {title: title || "Untitled Board", content},
        });
        return NextResponse.json(board);
    }

}

