// src/services/report.service.ts
import { ReportModel, ReportDocument } from "../models/report.model"

export class ReportService {
  static create(data: Partial<ReportDocument>) {
    return ReportModel.create(data)
  }
  static getAll() {
    return ReportModel.find().exec()
  }
  static updateStatus(id: string, status: string, resolutionReason?: string) {
    return ReportModel.findByIdAndUpdate(
      id,
      { status, resolutionReason },
      { new: true }
    ).exec()
  }
}
