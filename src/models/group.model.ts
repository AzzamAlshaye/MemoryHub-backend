import { Schema, model, Document, Types } from "mongoose"

export interface GroupDocument extends Document {
  _id: Types.ObjectId
  name: string
  description?: string
  avatar?: string
  admins: Types.ObjectId[]
  members: Types.ObjectId[]
  inviteToken?: string
  createdAt: Date
  updatedAt: Date
  id: string
}

const groupSchema = new Schema<GroupDocument>(
  {
    name: { type: String, required: true },
    description: String,
    avatar: { type: String, default: "" },
    admins: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    inviteToken: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toHexString()
        delete ret._id
        delete ret.__v
      },
    },
  }
)

groupSchema.virtual("id").get(function (this: GroupDocument) {
  return this._id.toHexString()
})

export const GroupModel = model<GroupDocument>("Group", groupSchema)