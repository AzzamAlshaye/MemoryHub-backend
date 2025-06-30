import { Schema, model, Document, Types } from "mongoose"
// create inerafce type
export interface LikeDocument extends Document {
  id: string
  user: Types.ObjectId
  targetType: "pin" | "comment"
  targetId: Types.ObjectId
  type: "like" | "dislike"
  createdAt: Date
  updatedAt: Date
}
// create schema
const likeSchema = new Schema<LikeDocument>(
  {
    id: { type: String, default: () => `like_${Date.now()}` },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["pin", "comment"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ["like", "dislike"], required: true },
  },
  { timestamps: true }
)

export const LikeModel = model<LikeDocument>("Like", likeSchema)