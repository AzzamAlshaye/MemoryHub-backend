import { Schema, model, Document, Types } from "mongoose"
// create interface
export interface LikeDocument extends Document {
  _id: Types.ObjectId 
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
      transform(doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
      },
    },
  }
)
// get by id
likeSchema.virtual("id").get(function (this: LikeDocument) {
  return this._id.toHexString()
})

export const LikeModel = model<LikeDocument>("Like", likeSchema)