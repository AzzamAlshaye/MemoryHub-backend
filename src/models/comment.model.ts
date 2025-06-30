// src/models/comment.model.ts

import { Schema, model, Document, Types } from "mongoose"

export interface CommentDocument extends Document {
  _id: Types.ObjectId // now strongly typed
  author: Types.ObjectId
  pin: Types.ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<CommentDocument>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pin: {
      type: Schema.Types.ObjectId,
      ref: "Pin",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString() // expose `id` as string
        delete ret._id // hide `_id`
        delete ret.__v // hide version key
      },
    },
  }
)

// Virtual `id` getter (optional if you do it in transform)
commentSchema.virtual("id").get(function (this: CommentDocument) {
  return this._id.toHexString()
})

export const CommentModel = model<CommentDocument>("Comment", commentSchema)
