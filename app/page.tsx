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

  // ---------- load boards ----------
  async function loadBoards() {
    try {
      setLoadingBoards(true);
      const res = await fetch("/api/boards", { cache: "no-store" });
      if (!res.ok) {
        console.error("Failed to load boards:", await res.text());
        return;
      }
      const data: Board[] = await res.json();
      // replace, don't append → avoids duplicated titles
      setBoards(data);
    } catch (error) {
      console.error("Error loading boards", error);
    } finally {
      setLoadingBoards(false);
    }
  }

  useEffect(() => {
    loadBoards();
  }, []);

  // ---------- create board ----------
  async function handleCreateBoard(e: FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    try {
      setIsCreating(true);
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        console.error("Failed to create board:", await res.text());
        alert("Could not create board");
        return;
      }

      setNewTitle("");
      await loadBoards();
    } catch (error) {
      console.error("Error creating board", error);
    } finally {
      setIsCreating(false);
    }
  }

  // ---------- rename board ----------
  async function handleRenameBoard(id: string) {
    const current = boards.find((b) => b._id === id);
    const input = prompt("New board name:", current?.title ?? "");
    if (input == null) return;

    const title = input.trim();
    if (!title) return;

    try {
      const res = await fetch(`/api/boards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        console.error("Failed to rename board:", await res.text());
        alert("Could not rename board");
        return;
      }

      await loadBoards();
    } catch (error) {
      console.error("Error renaming board", error);
    }
  }

  // ---------- delete board ----------
  async function handleDeleteBoard(id: string) {
    const ok = confirm(
      "Delete this board and all its lists and cards? This cannot be undone."
    );
    if (!ok) return;

    try {
      const res = await fetch(`/api/boards/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Failed to delete board:", await res.text());
        alert("Could not delete board");
        return;
      }

      // Optimistic update
      setBoards((prev) => prev.filter((b) => b._id !== id));
    } catch (error) {
      console.error("Error deleting board", error);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Boards</h1>
        <p className="text-slate-400 mb-6">
          Create a board and click its title to manage lists and cards.
        </p>

        <form
          onSubmit={handleCreateBoard}
          className="flex gap-3 mb-8 items-center"
        >
          <input
            className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="New board title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            type="submit"
            disabled={isCreating || !newTitle.trim()}
            className="rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium px-4 py-2"
          >
            {isCreating ? "Creating..." : "Create board"}
          </button>
        </form>

        {loadingBoards && (
          <p className="text-slate-400 text-sm mb-4">Loading boards…</p>
        )}

        {boards.length === 0 && !loadingBoards && (
          <p className="text-slate-500 text-sm">
            No boards yet. Use the field above to create your first board.
          </p>
        )}

        <div className="space-y-3">
          {boards.map((board) => (
            <div
              key={board._id}
              className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 px-4 py-3"
            >
              <Link
                href={`/board/${board._id}`}
                className="text-sm font-medium hover:underline"
              >
                {board.title}
              </Link>

              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => handleRenameBoard(board._id)}
                  className="text-slate-300 hover:text-slate-50"
                >
                  Rename
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteBoard(board._id)}
                  className="text-rose-400 hover:text-rose-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
