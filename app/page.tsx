// app/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

type Board = {
  _id: string;
  title: string;
};

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newTitle, setNewTitle] = useState("");

  async function loadBoards() {
    const res = await fetch("/api/boards");
    const data = await res.json();
    setBoards(data);
  }

  useEffect(() => {
    loadBoards();
  }, []);

  async function handleCreateBoard(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error("Failed to create board:", msg);
      alert("Could not create board: " + msg);
      return;
    }

    setNewTitle("");
    loadBoards();
  }

  async function handleDeleteBoard(id: string) {
    const confirmed = window.confirm(
      "Delete this board and all its lists and cards? This cannot be undone."
    );
    if (!confirmed) return;

    const res = await fetch(`/api/boards/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error("Failed to delete board:", msg);
      alert("Could not delete board: " + msg);
      return;
    }

    setBoards((prev) => prev.filter((b) => b._id !== id));
  }

  async function handleRenameBoard(board: Board) {
    const newName = window.prompt("New board name:", board.title);
    if (!newName || !newName.trim()) return;

    const res = await fetch(`/api/boards/${board._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newName }),
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error("Failed to rename board:", msg);
      alert("Could not rename board: " + msg);
      return;
    }

    const updated: Board = await res.json();
    setBoards((prev) =>
      prev.map((b) => (b._id === updated._id ? updated : b))
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Boards</h1>
            <p className="text-sm text-slate-400 mt-1">
              Create a board and click its title to manage lists and cards.
            </p>
          </div>
        </header>

        {/* Create board form */}
        <form
          onSubmit={handleCreateBoard}
          className="mb-6 flex gap-3 items-center"
        >
          <input
            className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-slate-50 placeholder:text-slate-500 flex-1"
            placeholder="New board title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded shadow-sm whitespace-nowrap"
          >
            Create board
          </button>
        </form>

        {/* Boards list (grid-like feel could be added with grid classes if needed) */}
        <div className="space-y-3">
          {boards.map((board) => (
            <div
              key={board._id}
              className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm"
            >
              <Link
                href={`/board/${board._id}`}
                className="font-medium text-slate-50 hover:text-indigo-300 hover:underline"
              >
                {board.title}
              </Link>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRenameBoard(board)}
                  className="text-sm text-slate-300 hover:text-slate-100"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDeleteBoard(board._id)}
                  className="text-sm text-red-300 hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {boards.length === 0 && (
            <p className="text-slate-400 text-sm">
              No boards yet. Use the field above to create your first board.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
