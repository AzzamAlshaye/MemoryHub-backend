// src/routes/pin.routes.ts

import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"
import { PinController } from "../controllers/pin.controller"

const router = Router()

// All pin endpoints require authentication
router.use(authenticate)

// Create a pin: up to 1 video + up to 10 images
router.post(
  "/",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  PinController.create
)

// List visible pins
router.get("/", PinController.getAll)

// Get a single pin
router.get("/:id", PinController.getById)

// Update a pin (media optional)
router.put(
  "/:id",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  PinController.update
)

// Delete a pin
router.delete("/:id", PinController.delete)

export default router
