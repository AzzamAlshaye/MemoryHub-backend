// src/controllers/report.controller.ts
import { Request, Response, NextFunction } from "express"
import { ReportService } from "../services/report.service"

export class ReportController {
  static async create(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) {
    try {
      const rpt = await ReportService.create({
        ...req.body,
        reporter: req.user.id,
      })
      res.status(201).json(rpt)
    } catch (err) {
      next(err)
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const reports = await ReportService.getAll()
      res.json(reports)
    } catch (err) {
      next(err)
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, resolutionReason } = req.body
      const updated = await ReportService.updateStatus(
        req.params.id,
        status,
        resolutionReason
      )
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }
}
