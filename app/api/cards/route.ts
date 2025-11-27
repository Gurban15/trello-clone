import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const title = (body?.title || "").trim();
  const listId = body?.listId as string | undefined;

  if (!title || !listId) {
    return NextResponse.json(
      { message: "title and listId are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const card = await Card.create({ title, listId });

  return NextResponse.json(card, { status: 201 });
}
