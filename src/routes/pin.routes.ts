// src/routes/pin.routes.ts
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { optionalAuthenticate } from "../middleware/optionalAuth.middleware"
import { upload } from "../middleware/upload.middleware"
import { PinController } from "../controllers/pin.controller"

const router = Router()

// Public & filtered listing
router.get("/me", authenticate, PinController.getMyPins)
router.get("/", optionalAuthenticate, PinController.getAll)
router.get("/:id", optionalAuthenticate, PinController.getById)

// Create
router.post(
  "/",
  authenticate,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  PinController.create
)

// Update (edit)
router.put(
  "/:id",
  authenticate,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  PinController.update
)

// Delete
router.delete("/:id", authenticate, PinController.delete)

export default router
