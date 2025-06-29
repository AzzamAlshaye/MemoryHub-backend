// src/routes/pin.routes.ts

import { Router } from "express"
import { PinController } from "../controllers/pin.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()

// All pin endpoints require authentication
router.use(authenticate)

router.post("/", PinController.create)
router.get("/", PinController.getAll)
router.get("/:id", PinController.getById)
router.put("/:id", PinController.update)
router.delete("/:id", PinController.delete)

export default router
