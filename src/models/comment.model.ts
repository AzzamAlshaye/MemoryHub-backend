// src/models/comment.model.ts
import { Schema, model, Document, Types } from "mongoose"

export interface CommentDocument extends Document {
  id: string
  author: Types.ObjectId
  pin: Types.ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<CommentDocument>(
  {
    id: { type: String, default: () => `cmt_${Date.now()}` },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pin: { type: Schema.Types.ObjectId, ref: "Pin", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
)

export const CommentModel = model<CommentDocument>("Comment", commentSchema)
