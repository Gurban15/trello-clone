// models/Board.ts
import { Schema, model, models } from "mongoose";

const BoardSchema = new Schema(
  {
    title: { type: String, required: true },
  },
  { timestamps: true }
);

const Board = models.Board || model("Board", BoardSchema);

export default Board;
export { Board };
