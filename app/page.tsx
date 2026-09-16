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
    <div>
      <button onClick={handleCreateBoard}> Create new board</button>
    </div>
  );
};

export default Home;
