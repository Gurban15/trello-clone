// app/api/boards/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Board from "@/models/Board";

export async function GET(_req: NextRequest) {
  try {
    await connectDB();

    const boards = await Board.find().sort({ createdAt: 1 }).lean();

    const safeBoards = boards.map((b: any) => ({
      _id: b._id.toString(),
      title: b.title,
    }));

    return NextResponse.json(safeBoards, { status: 200 });
  } catch (err) {
    console.error("GET /api/boards error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const board = await Board.create({ title: title.trim() });

    const safeBoard = {
      _id: board._id.toString(),
      title: board.title,
    };

    return NextResponse.json(safeBoard, { status: 201 });
  } catch (err) {
    console.error("POST /api/boards error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
