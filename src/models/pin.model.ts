// src/models/pin.model.ts
import { Schema, model, Document, Types } from "mongoose"

export interface PinDocument extends Document {
  id: string
  title: string
  description?: string
  owner: Types.ObjectId
  location: { lat: number; lng: number }
  privacy: "private" | "group" | "public"
  groupId?: Types.ObjectId
  mediaUrls: string[]
  createdAt: Date
  updatedAt: Date
}

const pinSchema = new Schema<PinDocument>(
  {
    id: { type: String, default: () => `pin_${Date.now()}` },
    title: { type: String, required: true },
    description: String,
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    privacy: {
      type: String,
      enum: ["private", "group", "public"],
      default: "public",
    },
    groupId: {
      // ← only for "group" privacy
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: function () {
        return this.privacy === "group"
      },
    },
    mediaUrls: [String],
  },
  { timestamps: true }
)

export const PinModel = model<PinDocument>("Pin", pinSchema)
