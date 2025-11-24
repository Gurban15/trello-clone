// models/Board.ts
import { Schema, model, models } from "mongoose";

const BoardSchema = new Schema(
  {
    title: { type: String, required: true },
  },
  { timestamps: true }
);

export const Board = models.Board || model("Board", BoardSchema);
