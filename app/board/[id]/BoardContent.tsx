"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import posthog from "@/lib/posthogClient";

type Board = {
  _id: string;
  title: string;
};

type List = {
  _id: string;
  title: string;
  boardId: string;
};

type Card = {
  _id: string;
  title: string;
  description?: string;
  listId: string;
};

type Props = {
  boardId: string;
};

export default function BoardContent({ boardId }: Props) {
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(true);

  const [newListTitle, setNewListTitle] = useState("");
  const [newCardTitles, setNewCardTitles] = useState<Record<string, string>>(
    {}
  );


  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState(false);

  async function loadBoard() {
    setLoadingBoard(true);
    try {
      const res = await fetch(`/api/board-full?id=${boardId}`);
      if (!res.ok) {
        console.error("Failed to load board:", await res.text());
        setBoard(null);
        setLists([]);
        setCards([]);
        return;
      }

      const json = await res.json();
      setBoard(json.board);
      setLists(json.lists || []);
      setCards(json.cards || []);

      if (posthog) {
        posthog.capture("board_opened", { boardId });
      }
    } catch (err) {
      console.error("Error loading board:", err);
      setBoard(null);
      setLists([]);
      setCards([]);
    } finally {
      setLoadingBoard(false);
    }
  }

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId]);


  async function handleCreateList(e: FormEvent) {
    e.preventDefault();
    const title = newListTitle.trim();
    if (!title) return;

    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, boardId }),
      });

      if (!res.ok) {
        console.error("Error creating list:", await res.text());
        alert("Could not create list.");
        return;
      }

      const created: List = await res.json();
      setLists((prev) => [...prev, created]);
      setNewListTitle("");

      if (posthog) {
        posthog.capture("list_created", {
          listId: created._id,
          boardId,
        });
      }
    } catch (err) {
      console.error("Error creating list:", err);
      alert("Could not create list.");
    }
  }

  async function handleRenameList(list: List) {
    const nextTitle = window.prompt("New list title", list.title);
    if (!nextTitle) return;

    const title = nextTitle.trim();
    if (!title || title === list.title) return;

    try {
      const res = await fetch(`/api/lists/${list._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        console.error("Error renaming list:", await res.text());
        alert("Could not rename list.");
        return;
      }

      const updated: List = await res.json();
      setLists((prev) =>
        prev.map((l) => (l._id === updated._id ? updated : l))
      );

      if (posthog) {
        posthog.capture("list_updated", {
          listId: updated._id,
          boardId,
        });
      }
    } catch (err) {
      console.error("Error renaming list:", err);
      alert("Could not rename list.");
    }
  }

  async function handleDeleteList(list: List) {
    const confirmed = window.confirm(
      "Delete this list and all its cards? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/lists/${list._id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        console.error("Error deleting list:", await res.text());
        alert("Could not delete list.");
        return;
      }

      setLists((prev) => prev.filter((l) => l._id !== list._id));
      setCards((prev) => prev.filter((c) => c.listId !== list._id));

      if (posthog) {
        posthog.capture("list_deleted", {
          listId: list._id,
          boardId,
        });
      }
    } catch (err) {
      console.error("Error deleting list:", err);
      alert("Could not delete list.");
    }
  }



  async function handleCreateCard(listId: string) {
    const title = (newCardTitles[listId] || "").trim();
    if (!title) return;

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, listId }),
      });

      if (!res.ok) {
        console.error("Error creating card:", await res.text());
        alert("Could not create card.");
        return;
      }

      const created: Card = await res.json();
      setCards((prev) => [...prev, created]);

      setNewCardTitles((prev) => ({
        ...prev,
        [listId]: "",
      }));

      if (posthog) {
        posthog.capture("card_created", {
          cardId: created._id,
          listId,
          boardId,
        });
      }
    } catch (err) {
      console.error("Error creating card:", err);
      alert("Could not create card.");
    }
  }

  // Open modal for a card
  function openCard(card: Card) {
    setEditingCard(card);
    setEditTitle(card.title);
    setEditDescription(card.description || "");
  }

  async function handleSaveCard() {
    if (!editingCard) return;

    setIsSavingCard(true);
    try {
      const res = await fetch(`/api/cards/${editingCard._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
        }),
      });

      if (!res.ok) {
        console.error("Error updating card:", await res.text());
        alert("Could not save card. Please try again.");
        return;
      }

      const updated: Card = await res.json();

      setCards((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );

      if (posthog) {
        posthog.capture("card_updated", {
          cardId: updated._id,
          boardId,
        });
      }

      alert("Card saved.");
      setEditingCard(null);
    } catch (err) {
      console.error("Error updating card:", err);
      alert("Could not save card. Please try again.");
    } finally {
      setIsSavingCard(false);
    }
  }


  async function handleDeleteCardFromModal() {
    if (!editingCard) return;

    const confirmed = window.confirm("Delete this card? This cannot be undone.");
    if (!confirmed) return;

    setIsDeletingCard(true);
    try {
      const res = await fetch(`/api/cards/${editingCard._id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        console.error("Error deleting card:", await res.text());
        alert("Could not delete card. Please try again.");
        return;
      }

      setCards((prev) => prev.filter((c) => c._id !== editingCard._id));

      if (posthog) {
        posthog.capture("card_deleted", {
          cardId: editingCard._id,
          boardId,
        });
      }

      alert("Card deleted.");
      setEditingCard(null);
    } catch (err) {
      console.error("Error deleting card:", err);
      alert("Could not delete card. Please try again.");
    } finally {
      setIsDeletingCard(false);
    }
  }



  if (loadingBoard) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-slate-300">Loading board…</p>
        </div>
      </main>
    );
  }

  if (!board) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 space-y-4">
          <Link
            href="/"
            className="text-sm text-indigo-300 hover:text-indigo-200 underline"
          >
            ← Back to boards
          </Link>
          <h1 className="text-2xl font-semibold">Board</h1>
          <p className="text-slate-400">Board not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm text-indigo-300 hover:text-indigo-200 underline"
            >
              ← Back to boards
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">{board.title}</h1>
          </div>

          {/* Add list */}
          <form
            onSubmit={handleCreateList}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="New list title"
              className="w-56 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
            />
            <button
              type="submit"
              className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Add list
            </button>
          </form>
        </div>

        {/* Lists + cards */}
        <section className="flex gap-4 overflow-x-auto pb-4">
          {lists.map((list) => (
            <div
              key={list._id}
              className="w-64 flex-shrink-0 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col"
            >
              {/* List header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
                <h2 className="truncate text-sm font-semibold">
                  {list.title}
                </h2>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleRenameList(list)}
                    className="rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteList(list)}
                    className="rounded border border-rose-500 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
                {cards
                  .filter((c) => c.listId === list._id)
                  .map((card) => (
                    <button
                      key={card._id}
                      type="button"
                      onClick={() => openCard(card)}
                      className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-left text-sm text-slate-50 hover:border-emerald-500 hover:bg-slate-800/80"
                    >
                      <span className="block truncate">{card.title}</span>
                      {card.description && (
                        <span className="mt-1 block text-xs text-slate-400 line-clamp-2">
                          {card.description}
                        </span>
                      )}
                    </button>
                  ))}
              </div>

              {/* New card input */}
              <div className="border-t border-slate-800 px-3 py-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="New card title"
                    className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-50 outline-none focus:border-emerald-500"
                    value={newCardTitles[list._id] || ""}
                    onChange={(e) =>
                      setNewCardTitles((prev) => ({
                        ...prev,
                        [list._id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleCreateCard(list._id)}
                    className="rounded bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {lists.length === 0 && (
            <p className="text-sm text-slate-400">
              No lists yet. Use the field above to create your first list.
            </p>
          )}
        </section>
      </div>

      {/* Card edit modal */}
      {editingCard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-xl bg-slate-900 p-6 shadow-xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-50">
                Edit card
              </h2>
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="text-slate-400 hover:text-slate-200 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
                  placeholder="Add some details about this card…"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Changes are saved when you click{" "}
                  <span className="font-semibold">Save</span>.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSaveCard}
                disabled={isSavingCard}
                className="inline-flex items-center justify-center rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                {isSavingCard ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={handleDeleteCardFromModal}
                disabled={isDeletingCard}
                className="inline-flex items-center justify-center rounded border border-rose-500 px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/10 disabled:opacity-60"
              >
                {isDeletingCard ? "Deleting…" : "Delete card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
