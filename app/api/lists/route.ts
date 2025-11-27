// app/api/lists/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import List from "@/models/List";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const title = (body?.title || "").trim();
  const boardId = body?.boardId as string | undefined;

  if (!title || !boardId) {
    return NextResponse.json(
      { message: "title and boardId are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const list = await List.create({ title, boardId });

  return NextResponse.json(list, { status: 201 });
}
