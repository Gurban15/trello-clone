// app/api/cards/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Card } from "@/models/Card";

// PATCH /api/cards/:id  -> update title/description
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    if (!id) {
      return new NextResponse("Card id is required", { status: 400 });
    }

    const { title, description } = await req.json();

    if (!title || !title.trim()) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const updated = await Card.findByIdAndUpdate(
      id,
      { title: title.trim(), description: description ?? "" },
      { new: true }
    ).lean();

    if (!updated) {
      return new NextResponse("Card not found", { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/cards/[id] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/cards/:id  -> delete a card
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    if (!id) {
      return new NextResponse("Card id is required", { status: 400 });
    }

    const deleted = await Card.findByIdAndDelete(id);

    if (!deleted) {
      return new NextResponse("Card not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/cards/[id] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
