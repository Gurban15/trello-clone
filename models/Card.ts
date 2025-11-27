import { Schema, model, models } from "mongoose";

const CardSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    listId: { type: Schema.Types.ObjectId, ref: "List", required: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Card = models.Card || model("Card", CardSchema);

export default Card;
export { Card };
