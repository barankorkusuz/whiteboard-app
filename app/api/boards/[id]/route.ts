import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    {params}: {params: {id:string}}
){
    const {id} = await params;

    const board = await prisma.board.findUnique({
        where: {id},
    });

    if (!board){
        return NextResponse.json({error: "Board not found"}, {status: 404});
    }

    return NextResponse.json(board);
}