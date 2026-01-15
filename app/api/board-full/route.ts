import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Board from "@/models/Board";
import List from "@/models/List";
import Card from "@/models/Card";


export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const boardId =
      url.searchParams.get("boardId") || url.searchParams.get("id");

    if (!boardId) {
      
      return NextResponse.json(
        { message: "boardId is required" },
        { status: 400 }
      );
    }

    const board = await Board.findById(boardId).lean();

    if (!board) {
      return NextResponse.json(
        { message: "Board not found" },
        { status: 404 }
      );
    }

    const lists = await List.find({ boardId })
      .sort({ position: 1, createdAt: 1 })
      .lean();

    const listIds = lists.map((l: any) => l._id);
    const cards = await Card.find({ listId: { $in: listIds } })
      .sort({ position: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ board, lists, cards });
  } catch (err) {
    console.error("GET /api/board-full error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
