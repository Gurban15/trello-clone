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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load boards from API
  useEffect(() => {
    async function loadBoards() {
      try {
        setLoading(true);
        const res = await fetch("/api/boards", { cache: "no-store" });
        if (!res.ok) {
          console.error("Failed to load boards", await res.text());
          return;
        }
        const data = await res.json();
        setBoards(data);
      } catch (err) {
        console.error("Error loading boards", err);
      } finally {
        setLoading(false);
      }
    }

    loadBoards();
  }, []);

  // Create board
  async function handleCreateBoard(e: FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    try {
      setSaving(true);
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        console.error("Failed to create board", await res.text());
        return;
      }

      const board: Board = await res.json();
      setBoards((prev) => [...prev, board]);
      setNewTitle("");
    } catch (err) {
      console.error("Error creating board", err);
    } finally {
      setSaving(false);
    }
  }

  // Rename board
  async function handleRenameBoard(id: string) {
    const current = boards.find((b) => b._id === id);
    const newName = window.prompt("New board name:", current?.title ?? "");
    const title = newName?.trim();
    if (!title || title === current?.title) return;

    try {
      const res = await fetch(`/api/boards/${id}`, {
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
        prev.map((b) => (b._id === id ? { ...b, title: updated.title } : b))
      );
    } catch (err) {
      console.error("Error renaming board", err);
      alert("Could not rename board.");
    }
  }

  // Delete board
  async function handleDeleteBoard(id: string) {
    const confirmed = window.confirm(
      "Delete this board and all its lists and cards? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });

      // 204 = success with no body
      if (!res.ok && res.status !== 204) {
        console.error("Failed to delete board:", await res.text());
        alert("Could not delete board.");
        return;
      }

      setBoards((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Error deleting board", err);
      alert("Could not delete board.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Boards</h1>

        <form
          onSubmit={handleCreateBoard}
          className="flex gap-2 mb-6 items-center"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New board title"
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-60"
          >
            Create board
          </button>
        </form>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading boards…</p>
        ) : boards.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No boards yet. Use the field above to create one.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {boards.map((board) => (
              <div
                key={board._id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-3"
              >
                <Link
                  href={`/board/${board._id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {board.title}
                </Link>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleRenameBoard(board._id)}
                    className="text-xs text-blue-300 hover:text-blue-200"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBoard(board._id)}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
