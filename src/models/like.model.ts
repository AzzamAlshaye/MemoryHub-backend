// src/models/like.model.ts
import { Schema, model, Document, Types } from "mongoose"

export interface LikeDocument extends Document {
  user: Types.ObjectId
  targetType: "pin" | "comment"
  targetId: Types.ObjectId
  type: "like" | "dislike"
  createdAt: Date
  updatedAt: Date
}

const likeSchema = new Schema<LikeDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["pin", "comment"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
      },
    },
  }
)

// **Key addition**: ensure each user can only react once per target
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true })

export const LikeModel = model<LikeDocument>("Like", likeSchema)
