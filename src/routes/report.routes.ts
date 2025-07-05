// src/routes/report.routes.ts
import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { ReportController } from "../controllers/report.controller"

const router = Router()

// ── Protected: user can report a pin or comment ──────────
router.post("/", authenticate, ReportController.create)

// ── Admin only: view all reports & update their status ────
router.get("/", authenticate, authorize("admin"), ReportController.getAll)
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  ReportController.updateStatus
)

export default router
