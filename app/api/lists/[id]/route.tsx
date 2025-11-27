import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import List from "@/models/List";
import Card from "@/models/Card";

type RouteContext = {
  params: Promise<{ id: string }>;
};


export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params; // 👈 await params
    if (!id) {
      return NextResponse.json(
        { message: "List id is required" },
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

    const updated = await List.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { message: "List not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/lists/[id] error", err);
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
        { message: "List id is required" },
        { status: 400 }
      );
    }

    const list = await List.findById(id).lean();
    if (!list) {
      return NextResponse.json(
        { message: "List not found" },
        { status: 404 }
      );
    }

    
    await Card.deleteMany({ listId: id });

    
    await List.findByIdAndDelete(id);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/lists/[id] error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
