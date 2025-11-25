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
  const [isCreating, setIsCreating] = useState(false);
  const [loadingBoards, setLoadingBoards] = useState(false);

  // ---------- Load boards from API ----------
  async function loadBoards() {
    try {
      setLoadingBoards(true);
      const res = await fetch("/api/boards", { cache: "no-store" });

      if (!res.ok) {
        console.error("Failed to load boards:", await res.text());
        alert("Could not load boards.");
        return;
      }

      const data: Board[] = await res.json();
      setBoards(data);
    } catch (error) {
      console.error("Error loading boards:", error);
      alert("Unexpected error while loading boards.");
    } finally {
      setLoadingBoards(false);
    }
  }

  useEffect(() => {
    loadBoards();
  }, []);

  // ---------- Create board ----------
  async function handleCreateBoard(e: FormEvent) {
    e.preventDefault();

    const title = newTitle.trim();
    if (!title) {
      alert("Please enter a board name.");
      return;
    }

    try {
      setIsCreating(true);

      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        console.error("Failed to create board:", await res.text());
        alert("Could not create board.");
        return;
      }

      const created: Board = await res.json();
      // add the new one at the end
      setBoards((prev) => [...prev, created]);
      setNewTitle("");
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Unexpected error while creating board.");
    } finally {
      setIsCreating(false);
    }
  }

  // ---------- Rename board ----------
  async function handleRenameBoard(board: Board) {
    const input = window.prompt("New board name:", board.title);
    if (input == null) return; // Cancel pressed

    const title = input.trim();
    if (!title || title === board.title) return;

    try {
      const res = await fetch(`/api/boards/${board._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        console.error("Failed to rename board:", await res.text());
        alert("Could not rename board.");
        return;
      }

      const updated: Board = await res.json();

      setBoards((prev) =>
        prev.map((b) => (b._id === board._id ? updated : b))
      );
    } catch (error) {
      console.error("Error renaming board:", error);
      alert("Unexpected error while renaming board.");
    }
  }

  // ---------- Delete board ----------
  async function handleDeleteBoard(board: Board) {
    const ok = window.confirm(
      `Delete board "${board.title}" and all its lists and cards? This cannot be undone.`
    );
    if (!ok) return;

    try {
      const res = await fetch(`/api/boards/${board._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Failed to delete board:", await res.text());
        alert("Could not delete board.");
        return;
      }

      setBoards((prev) => prev.filter((b) => b._id !== board._id));
    } catch (error) {
      console.error("Error deleting board:", error);
      alert("Unexpected error while deleting board.");
    }
  }

  // ---------- UI ----------
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Boards</h1>
        <p className="text-slate-400 mb-6">
          Create a board and click its title to manage lists and cards.
        </p>

        {/* Create board form */}
        <form
          onSubmit={handleCreateBoard}
          className="mb-8 flex gap-3 items-center"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New board title"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create board"}
          </button>
        </form>

        {/* Loading indicator */}
        {loadingBoards && (
          <p className="text-slate-400 text-sm mb-3">Loading boards…</p>
        )}

        {/* List of boards */}
        <div className="space-y-3">
          {boards.map((board) => (
            <div
              key={board._id}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 hover:border-blue-500 transition"
            >
              <Link
                href={`/board/${board._id}`}
                className="text-lg font-medium text-slate-100 hover:text-blue-400"
              >
                {board.title || "Untitled board"}
              </Link>

              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => handleRenameBoard(board)}
                  className="text-slate-300 hover:text-blue-400 underline-offset-4 hover:underline"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBoard(board)}
                  className="text-red-400 hover:text-red-300 underline-offset-4 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {boards.length === 0 && !loadingBoards && (
            <p className="text-slate-500 text-sm">
              No boards yet. Use the field above to create your first board.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
