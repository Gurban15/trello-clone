import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Board from "@/models/Board";


export async function GET() {
  try {
    await connectDB();
    const boards = await Board.find().sort({ createdAt: 1 }).lean();
    return NextResponse.json({ boards });
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
    await connectDB();

    const body = await req.json();
    const rawTitle = (body?.title ?? "").toString();
    const title = rawTitle.trim();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const board = await Board.create({ title });

    return NextResponse.json(board, { status: 201 });
  } catch (err) {
    console.error("POST /api/boards error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
