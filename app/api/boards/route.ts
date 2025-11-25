// app/api/boards/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Board from "@/models/Board";

// GET  /api/boards  → list all boards
export async function GET() {
  await connectDB();

  const boards = await Board.find().sort({ createdAt: 1 }).lean();
  return NextResponse.json(boards);
}

// POST  /api/boards  → create board
export async function POST(req: NextRequest) {
  await connectDB();

  const { title } = await req.json();

  if (!title || !title.trim()) {
    return new NextResponse("Title is required", { status: 400 });
  }

  const board = await Board.create({ title: title.trim() });

  return NextResponse.json(board, { status: 201 });
}
