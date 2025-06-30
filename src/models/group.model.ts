import { Schema, model, Document, Types } from "mongoose"

// create interface
export interface GroupDocument extends Document {
  id: string
  name: string
  description?: string
  avatar?: string
  members: Types.ObjectId[]
  admins: Types.ObjectId[]
  inviteToken?: string
  createdAt: Date
  updatedAt: Date
}

// create schema
const groupSchema = new Schema<GroupDocument>(
  {
    id: { type: String, default: () => `group_${Date.now()}` },
    name: { type: String, required: true },
    description: { type: String, trim: true },
    avatar: { type: String, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    inviteToken: { type: String, trim: true },
  },
  { timestamps: true }
)

groupSchema.index({ inviteToken: 1 })

export const GroupModel = model<GroupDocument>("Group", groupSchema)