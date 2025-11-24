// models/Card.ts
import { Schema, model, models } from "mongoose";

const CardSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    listId: { type: Schema.Types.ObjectId, ref: "List", required: true },
  },
  {
    timestamps: true,
  }
);

export const Card = models.Card || model("Card", CardSchema);