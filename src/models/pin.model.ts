// src/models/pin.model.ts
import { Schema, model, Document, Types } from "mongoose"

export interface PinDocument extends Document {
  title: string
  description?: string
  privacy: "public" | "private" | "group"
  location: {
    lat: number
    lng: number
  }
  owner: Types.ObjectId
  groupId?: Types.ObjectId
  media: {
    images: string[]
    video: string
  }
  createdAt: Date
  updatedAt: Date
}

const pinSchema = new Schema<PinDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    privacy: {
      type: String,
      enum: ["public", "private", "group"],
      required: true,
    },

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: function () {
        // `this` is the document
        return (this as PinDocument).privacy === "group"
      },
    },

    media: {
      images: {
        type: [String],
        default: [
          "https://res.cloudinary.com/dkh3l9gqe/image/upload/v1751740691/assets_task_01jzdy0174fymrtq28cvzg3c14_1751740612_img_0_xofplt.webp",
        ],
      },
      video: { type: String, default: "" },
    },
  },
  { timestamps: true }
)

// optional: custom error message if someone forgets groupId
pinSchema.path("groupId").validate(function (value: Types.ObjectId) {
  if ((this as PinDocument).privacy === "group" && !value) {
    return false
  }
  return true
}, "groupId is required when privacy is 'group'")

export const PinModel = model<PinDocument>("Pin", pinSchema)
