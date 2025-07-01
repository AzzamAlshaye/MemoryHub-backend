// src/routes/report.routes.ts
import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { ReportController } from "../controllers/report.controller"

const router = Router()
router.use(authenticate)

router.post("/", ReportController.create)

// Admin only
router.get("/", authorize("admin"), ReportController.getAll)
router.patch("/:id/status", authorize("admin"), ReportController.updateStatus)

export default router
