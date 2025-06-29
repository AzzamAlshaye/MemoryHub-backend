// src/models/report.model.ts
import { Schema, model, Document, Types } from "mongoose"

export interface ReportDocument extends Document {
  id: string
  reporter: Types.ObjectId
  targetType: "pin" | "comment"
  targetId: Types.ObjectId
  reason: string
  status: "open" | "resolved"
  resolutionReason?: string // ← admin’s note
  createdAt: Date
  updatedAt: Date
}

const reportSchema = new Schema<ReportDocument>(
  {
    id: { type: String, default: () => `report_${Date.now()}` },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["pin", "comment"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    resolutionReason: String, // ← new
  },
  { timestamps: true }
)

export const ReportModel = model<ReportDocument>("Report", reportSchema)
