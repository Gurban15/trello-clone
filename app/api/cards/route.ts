// app/api/cards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Card } from "@/models/Card";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { listId, title, description } = await req.json();

    if (!listId) {
      return new NextResponse("List id is required", { status: 400 });
    }
    if (!title || !title.trim()) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const card = await Card.create({
      listId,
      title: title.trim(),
      description: description ?? "",
    });

    return NextResponse.json(card, { status: 201 });
  } catch (err) {
    console.error("POST /api/cards error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
