"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import posthog from "@/lib/posthogClient";

type Board = {
  _id: string;
  title: string;
};

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [creating, setCreating] = useState(false);

  
  async function loadBoards() {
    try {
      setLoadingBoards(true);
      const res = await fetch("/api/boards");
      if (!res.ok) {
        console.error("Failed to load boards:", await res.text());
        return;
      }
      const json = await res.json();
      setBoards(json.boards || []);
    } catch (err) {
      console.error("Error loading boards", err);
    } finally {
      setLoadingBoards(false);
    }
  }

  useEffect(() => {
    loadBoards();
  }, []);

  
  async function handleCreateBoard() {
    const title = newTitle.trim();
    if (!title) return;

    try {
      setCreating(true);
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

      const created = await res.json();

      
      if (posthog) {
        posthog.capture("board_created", {
          boardId: created._id,
          title: created.title,
        });
      }

      setNewTitle("");
      await loadBoards();
    } catch (err) {
      console.error("Error creating board", err);
      alert("Could not create board.");
    } finally {
      setCreating(false);
    }
  }


  async function handleRenameBoard(id: string, currentTitle: string) {
    const input = window.prompt("New board name:", currentTitle);
    if (input === null) return; // user cancelled

    const title = input.trim();
    if (!title || title === currentTitle) return;

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


      if (posthog) {
        posthog.capture("board_renamed", { boardId: id, title });
      }

      await loadBoards();
    } catch (err) {
      console.error("Error renaming board", err);
      alert("Could not rename board.");
    }
  }


  async function handleDeleteBoard(id: string) {
    const confirmed = window.confirm(
      "Delete this board and all its lists and cards? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });

      if (!res.ok && res.status !== 204) {
        console.error("Failed to delete board:", await res.text());
        alert("Could not delete board.");
        return;
      }

      // analytics
      if (posthog) {
        posthog.capture("board_deleted", { boardId: id });
      }

      await loadBoards();
    } catch (err) {
      console.error("Error deleting board", err);
      alert("Could not delete board.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Boards</h1>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New board title"
            className="flex-1 rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
          <button
            type="button"
            onClick={handleCreateBoard}
            disabled={creating}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create board"}
          </button>
        </div>

        <div className="space-y-2">
          {boards.map((board) => (
            <div
              key={board._id}
              className="flex items-center justify-between rounded border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <Link
                href={`/board/${board._id}`}
                className="text-sm hover:underline"
              >
                {board.title}
              </Link>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleRenameBoard(board._id, board.title || "")
                  }
                  className="px-3 py-1 text-xs rounded border border-slate-700 hover:bg-slate-800"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBoard(board._id)}
                  className="px-3 py-1 text-xs rounded border border-pink-600 text-pink-300 hover:bg-pink-900/40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {boards.length === 0 && !loadingBoards && (
            <p className="text-sm text-slate-400 mt-4">
              No boards yet. Use the field above to create your first board.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
