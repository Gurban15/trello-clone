// app/api/lists/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { List } from "@/models/List";
import { Card } from "@/models/Card";

// PATCH /api/lists/:id  -> rename list
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    // extract id from URL: /api/lists/:id
    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    if (!id) {
      return new NextResponse("List id is required", { status: 400 });
    }

    const { title } = await req.json();
    if (!title || !title.trim()) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const updated = await List.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true }
    ).lean();

    if (!updated) {
      return new NextResponse("List not found", { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/lists/[id] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/lists/:id  -> delete list + its cards
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    if (!id) {
      return new NextResponse("List id is required", { status: 400 });
    }

    // delete cards in this list
    await Card.deleteMany({ listId: id });

    // delete the list itself
    const deleted = await List.findByIdAndDelete(id);
    if (!deleted) {
      return new NextResponse("List not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/lists/[id] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
