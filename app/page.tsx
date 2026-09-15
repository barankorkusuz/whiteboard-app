"use client";

import { useRouter } from "next/navigation";

const Home = () => {

  const router = useRouter();

  const createBoard = async () => {
    const res = await fetch("/api/boards",{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({title: "Untitled Board", content: []}),
    } );
    const board = await res.json();

    router.push(`/board/${board.id}`);
  };

  return (
    <div>
      <button onClick={createBoard}> Create new board</button>
    </div>
  );
};

export default Home;
