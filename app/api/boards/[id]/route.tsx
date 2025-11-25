// app/api/boards/[id]/route.tsx
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Board from "@/models/Board";
import List from "@/models/List";
import Card from "@/models/Card";

type RouteParams = {
  id: string;
};

type RouteContext = {
  params: Promise<RouteParams>;
};

// PATCH /api/boards/:id  → rename board
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = await params;

  try {
    await connectDB();

    const { title } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const updated = await Board.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { message: "Board not found" },
        { status: 404 }
      );
    }

    const safeBoard = {
      _id: updated._id.toString(),
      title: updated.title,
    };

    return NextResponse.json(safeBoard, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/boards/[id] error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/:id → delete board + its lists + cards
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = await params;

  try {
    await connectDB();

    const board = await Board.findById(id);
    if (!board) {
      return NextResponse.json(
        { message: "Board not found" },
        { status: 404 }
      );
    }

    // find lists for this board
    const lists = await List.find({ boardId: id }).select("_id").lean();
    const listIds = lists.map((l: any) => l._id);

    if (listIds.length > 0) {
      // delete cards inside those lists
      await Card.deleteMany({ listId: { $in: listIds } });
      // delete the lists
      await List.deleteMany({ _id: { $in: listIds } });
    }

    // finally delete the board itself
    await board.deleteOne();

    // empty 204 response
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/boards/[id] error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
