"use client";

import { useRouter } from "next/navigation";
import { createBoard } from "@/lib/api"

const Home = () => {

  const router = useRouter();

  const handleCreateBoard = async () => {
    const board = await createBoard();
    router.push(`/board/${board.id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FAFAF9] text-[#1C1C1C] gap-6">
      <h1 className="text-2xl font-semibold">Whiteboard</h1>
      <button
        className="px-5 py-2.5 rounded-md text-sm font-medium bg-[#4C5FD5] text-white hover:opacity-90 transition-opacity" 
        onClick={handleCreateBoard}> Create new board
      </button>
    </div>
  );
};

export default Home;
