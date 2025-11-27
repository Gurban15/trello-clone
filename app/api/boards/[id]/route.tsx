import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Board from "@/models/Board";
import List from "@/models/List";
import Card from "@/models/Card";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params; // 👈 params is a Promise in Next 16
    if (!id) {
      return NextResponse.json(
        { message: "Board id is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const title = (body?.title || "").toString().trim();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const updated = await Board.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { message: "Board not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/boards/[id] error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params; // 👈 await params
    if (!id) {
      return NextResponse.json(
        { message: "Board id is required" },
        { status: 400 }
      );
    }

    const board = await Board.findById(id).lean();
    if (!board) {
      return NextResponse.json(
        { message: "Board not found" },
        { status: 404 }
      );
    }

    const lists = await List.find({ boardId: id }).select("_id").lean();
    const listIds = lists.map((l: any) => l._id);

    await List.deleteMany({ boardId: id });

    if (listIds.length > 0) {
      await Card.deleteMany({ listId: { $in: listIds } });
    }


    await Board.findByIdAndDelete(id);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/boards/[id] error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
