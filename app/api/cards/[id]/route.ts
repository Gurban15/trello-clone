import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";

type RouteContext = {
  params: Promise<{ id: string }>;
};


export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { message: "Card id is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updates: any = {};

    if (body?.title !== undefined) {
      updates.title = body.title.toString();
    }
    if (body?.description !== undefined) {
      updates.description = body.description.toString();
    }

    const updated = await Card.findByIdAndUpdate(id, updates, {
      new: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { message: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/cards/[id] error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { message: "Card id is required" },
        { status: 400 }
      );
    }

    const deleted = await Card.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json(
        { message: "Card not found" },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/cards/[id] error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
