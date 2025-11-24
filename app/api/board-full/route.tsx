// app/api/board-full/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Board } from "@/models/Board";
import { List } from "@/models/List";
import { Card } from "@/models/Card";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get("boardId");

  if (!boardId) {
    return new NextResponse("boardId is required", { status: 400 });
  }

  const board = await Board.findById(boardId).lean();
  if (!board) {
    return new NextResponse("Board not found", { status: 404 });
  }

  const lists = await List.find({ boardId })
    .sort({ position: 1, createdAt: 1 })
    .lean();

  const listIds = lists.map((l: any) => l._id);
  const cards = await Card.find({ listId: { $in: listIds } })
    .sort({ position: 1, createdAt: 1 })
    .lean();

  return NextResponse.json({ board, lists, cards });
}
