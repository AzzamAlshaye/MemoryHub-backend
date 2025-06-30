import { Schema, model, Document, Types } from "mongoose"

// create interface
export interface GroupDocument extends Document {
  id: string
  name: string
  description?: string
  members: Types.ObjectId[]
  inviteToken?: string
  createdAt: Date
  updatedAt: Date
}

// create schema
const groupSchema = new Schema<GroupDocument>(
  {
    id: { type: String, default: () => `group_${Date.now()}` },
    name: { type: String, required: true },
    description: String,
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    inviteToken: String,
  },
  { timestamps: true }
)

export const GroupModel = model<GroupDocument>("Group", groupSchema)
