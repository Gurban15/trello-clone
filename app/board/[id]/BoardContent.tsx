// app/board/[id]/BoardContent.tsx
"use client";

import { useState, FormEvent, MouseEvent } from "react";

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

interface Props {
  boardId: string;
  initialLists: List[];
  initialCards: Card[];
}

export default function BoardContent({
  boardId,
  initialLists,
  initialCards,
}: Props) {
  const [lists, setLists] = useState<List[]>(initialLists);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [newListTitle, setNewListTitle] = useState("");
  const [newCardTitles, setNewCardTitles] = useState<Record<string, string>>(
    {}
  );

  // Modal state for cards
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editCardTitle, setEditCardTitle] = useState("");
  const [editCardDescription, setEditCardDescription] = useState("");

  // ---------------- LISTS ----------------

  async function handleCreateList(e: FormEvent) {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId, title: newListTitle }),
    });

    if (res.ok) {
      const list: List = await res.json();
      setLists((prev) => [...prev, list]);
      setNewListTitle("");
    } else {
      const msg = await res.text();
      console.error("Failed to create list:", msg);
      alert("Could not create list: " + msg);
    }
  }

  async function handleRenameList(list: List) {
    const newName = window.prompt("New list name:", list.title);
    if (!newName || !newName.trim()) return;

    const res = await fetch(`/api/lists/${list._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newName }),
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error("Failed to rename list:", msg);
      alert("Could not rename list: " + msg);
      return;
    }

    const updated: List = await res.json();
    setLists((prev) =>
      prev.map((l) => (l._id === updated._id ? updated : l))
    );
  }

  async function handleDeleteList(listId: string) {
    const confirmed = window.confirm(
      "Delete this list and all its cards? This cannot be undone."
    );
    if (!confirmed) return;

    const res = await fetch(`/api/lists/${listId}`, { method: "DELETE" });

    if (!res.ok) {
      const msg = await res.text();
      console.error("Failed to delete list:", msg);
      alert("Could not delete list: " + msg);
      return;
    }

    setLists((prev) => prev.filter((l) => l._id !== listId));
    setCards((prev) => prev.filter((c) => c.listId !== listId));
  }

  // ---------------- CARDS ----------------

  async function handleCreateCard(listId: string, e: FormEvent) {
    e.preventDefault();
    const title = newCardTitles[listId];
    if (!title || !title.trim()) return;

    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId, title }), // description optional at creation
    });

    if (res.ok) {
      const card: Card = await res.json();
      setCards((prev) => [...prev, card]);
      setNewCardTitles((prev) => ({ ...prev, [listId]: "" }));
    } else {
      const msg = await res.text();
      console.error("Failed to create card:", msg);
      alert("Could not create card: " + msg);
    }
  }

  async function handleDeleteCard(cardId: string) {
    const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    if (!res.ok) {
      const msg = await res.text();
      console.error("Failed to delete card:", msg);
      alert("Could not delete card: " + msg);
      return;
    }

    setCards((prev) => prev.filter((c) => c._id !== cardId));

    // If this card is open in the modal, close it
    setSelectedCard((current) =>
      current && current._id === cardId ? null : current
    );
  }

  function openCardModal(card: Card) {
    setSelectedCard(card);
    setEditCardTitle(card.title);
    setEditCardDescription(card.description ?? "");
  }

  function closeCardModal() {
    setSelectedCard(null);
  }

  async function handleSaveCard() {
    if (!selectedCard) return;
    if (!editCardTitle.trim()) {
      alert("Title cannot be empty");
      return;
    }

    const res = await fetch(`/api/cards/${selectedCard._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editCardTitle,
        description: editCardDescription,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error("Failed to update card:", msg);
      alert("Could not update card: " + msg);
      return;
    }

    const updated: Card = await res.json();

    setCards((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c))
    );

    // ✅ Close the modal after successful save
    closeCardModal();
  }

  // ---------------- RENDER ----------------

  return (
    <div className="space-y-4">
      {/* Create list */}
      <form onSubmit={handleCreateList} className="flex gap-2">
        <input
          className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-slate-50 placeholder:text-slate-400 flex-1"
          placeholder="New list title"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded shadow-sm"
        >
          Add list
        </button>
      </form>

      {/* Lists + cards */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {lists.map((list) => {
          const listCards = cards.filter((c) => c.listId === list._id);
          const cardTitle = newCardTitles[list._id] ?? "";

          return (
            <div
              key={list._id}
              className="bg-slate-800/80 border border-slate-700 rounded-xl shadow-lg p-3 w-64 flex-shrink-0"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-slate-50 text-sm truncate">
                  {list.title}
                </h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handleRenameList(list)}
                    className="text-[11px] text-slate-300 hover:text-slate-100"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDeleteList(list._id)}
                    className="text-[11px] text-red-300 hover:text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-3 max-h-64 overflow-y-auto pr-1">
                {listCards.map((card) => (
                  <div
                    key={card._id}
                    onClick={() => openCardModal(card)}
                    className="bg-slate-700 rounded-lg px-2 py-1.5 text-xs flex justify-between items-center text-slate-50 cursor-pointer hover:bg-slate-600"
                  >
                    <span className="truncate">{card.title}</span>
                    <button
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation(); // don’t open modal when clicking delete
                        handleDeleteCard(card._id);
                      }}
                      className="text-[10px] text-red-300 hover:text-red-200 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {listCards.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">
                    No cards yet.
                  </p>
                )}
              </div>

              {/* Add card */}
              <form
                onSubmit={(e) => handleCreateCard(list._id, e)}
                className="flex gap-1"
              >
                <input
                  className="bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] flex-1 rounded text-slate-50 placeholder:text-slate-500"
                  placeholder="New card title"
                  value={cardTitle}
                  onChange={(e) =>
                    setNewCardTitles((prev) => ({
                      ...prev,
                      [list._id]: e.target.value,
                    }))
                  }
                />
                <button
                  type="submit"
                  className="px-2 text-[11px] bg-emerald-500 hover:bg-emerald-400 text-white rounded"
                >
                  +
                </button>
              </form>
            </div>
          );
        })}

        {lists.length === 0 && (
          <p className="text-slate-400 text-sm">
            No lists yet for this board. Create one above to get started.
          </p>
        )}
      </div>

      {/* Card modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-50">
                Edit card
              </h2>
              <button
                onClick={closeCardModal}
                className="text-slate-400 hover:text-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Title
                </label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-slate-50 placeholder:text-slate-500"
                  value={editCardTitle}
                  onChange={(e) => setEditCardTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-slate-50 placeholder:text-slate-500 min-h-[120px]"
                  value={editCardDescription}
                  onChange={(e) => setEditCardDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() =>
                  selectedCard && handleDeleteCard(selectedCard._id)
                }
                className="text-sm text-red-300 hover:text-red-200"
              >
                Delete card
              </button>

              <div className="flex gap-2">
                <button
                  onClick={closeCardModal}
                  className="px-4 py-2 text-sm rounded border border-slate-600 text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCard}
                  className="px-4 py-2 text-sm rounded bg-emerald-500 hover:bg-emerald-400 text-white font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
