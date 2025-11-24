// app/board/[id]/page.tsx
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Board } from "@/models/Board";
import { List } from "@/models/List";
import { Card } from "@/models/Card";
import BoardContent from "./BoardContent";

// In Next.js 16, `params` is a Promise in async route handlers
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { id } = await params; // unwrap the params Promise

  await connectDB();

  try {
    const board = await Board.findById(id).lean();

    if (!board) {
      return (
        <main className="min-h-screen bg-slate-900 text-slate-50">
          <div className="max-w-6xl mx-auto p-6">
            <Link
              href="/"
              className="text-sm text-indigo-300 hover:text-indigo-200 underline mb-4 inline-block"
            >
              ← Back to boards
            </Link>
            <h1 className="text-3xl font-semibold mb-2">Board</h1>
            <p className="text-red-300">Board not found.</p>
          </div>
        </main>
      );
    }

    const lists = await List.find({ boardId: board._id })
      .sort({ position: 1, createdAt: 1 })
      .lean();

    const listIds = lists.map((l: any) => l._id);
    const cards = await Card.find({ listId: { $in: listIds } })
      .sort({ position: 1, createdAt: 1 })
      .lean();

    const safeLists = JSON.parse(JSON.stringify(lists));
    const safeCards = JSON.parse(JSON.stringify(cards));

    return (
      <main className="min-h-screen bg-slate-900 text-slate-50">
        <div className="max-w-6xl mx-auto p-6">
          {/* Back navigation */}
          <Link
            href="/"
            className="text-sm text-indigo-300 hover:text-indigo-200 underline mb-4 inline-block"
          >
            ← Back to boards
          </Link>

          <h1 className="text-3xl font-semibold mb-6">{board.title}</h1>

          <BoardContent
            boardId={board._id.toString()}
            initialLists={safeLists}
            initialCards={safeCards}
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error loading board", error);
    return (
      <main className="min-h-screen bg-slate-900 text-slate-50">
        <div className="max-w-6xl mx-auto p-6">
          <Link
            href="/"
            className="text-sm text-indigo-300 hover:text-indigo-200 underline mb-4 inline-block"
          >
            ← Back to boards
          </Link>
          <h1 className="text-3xl font-semibold mb-2">Board</h1>
          <p className="text-red-300">Error loading board.</p>
        </div>
      </main>
    );
  }
}
