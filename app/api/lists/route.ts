// app/api/lists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { List } from "@/models/List";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { boardId, title } = await req.json();

    if (!boardId) {
      return new NextResponse("Board id is required", { status: 400 });
    }
    if (!title || !title.trim()) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const list = await List.create({
      boardId,
      title: title.trim(),
    });

    return NextResponse.json(list, { status: 201 });
  } catch (err) {
    console.error("POST /api/lists error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
