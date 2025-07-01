// src/models/report.model.ts

import { Schema, model, Document, Types } from "mongoose"

export interface ReportDocument extends Document {
  _id: Types.ObjectId // Mongo’s ObjectId
  reporter: Types.ObjectId // who reported
  targetType: "pin" | "comment" // reported entity type
  targetId: Types.ObjectId // id of the pin or comment
  reason: string // user’s reason
  status: "open" | "resolved" // report status
  resolutionReason?: string // admin’s resolution note
  createdAt: Date
  updatedAt: Date
}

const reportSchema = new Schema<ReportDocument>(
  {
    reporter: {
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
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    resolutionReason: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        // expose `id` instead of `_id`
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
      },
    },
  }
)

// Virtual `id` getter for JSON output
reportSchema.virtual("id").get(function (this: ReportDocument) {
  return this._id.toHexString()
})

export const ReportModel = model<ReportDocument>("Report", reportSchema)
