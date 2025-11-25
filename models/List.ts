// models/List.ts
import { Schema, model, models, Types } from "mongoose";

const ListSchema = new Schema(
  {
    title: { type: String, required: true },
    boardId: { type: Types.ObjectId, ref: "Board", required: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const List = models.List || model("List", ListSchema);

export default List;
export { List };
