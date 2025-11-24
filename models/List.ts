// models/List.ts
import { Schema, model, models } from "mongoose";

const ListSchema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    title: { type: String, required: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const List = models.List || model("List", ListSchema);