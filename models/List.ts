import { Schema, model, models } from "mongoose";

const ListSchema = new Schema(
  {
    title: { type: String, required: true },
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const List = models.List || model("List", ListSchema);

export default List;
export { List };
