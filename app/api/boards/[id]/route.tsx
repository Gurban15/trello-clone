// app/api/boards/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Board from "@/models/Board";

type RouteParams = {
  id: string;
};

// PATCH  /api/boards/:id  → rename board
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const { id } = await context.params;

  await connectDB();

  const { title } = await req.json();

  if (!title || !title.trim()) {
    return new NextResponse("Title is required", { status: 400 });
  }

  const board = await Board.findByIdAndUpdate(
    id,
    { title: title.trim() },
    { new: true }
  ).lean();

  if (!board) {
    return new NextResponse("Board not found", { status: 404 });
  }

  return NextResponse.json(board);
}

// DELETE  /api/boards/:id  → delete board
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const { id } = await context.params;

  await connectDB();

  // just delete board; lists/cards deletion you already handle via board-full if needed
  await Board.findByIdAndDelete(id);

  return new NextResponse(null, { status: 204 });
}
