// src/routes/pin.routes.ts
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"
import { PinController } from "../controllers/pin.controller"

const router = Router()

// ── PUBLIC ────────────────────────────────────────────────
// list all (public) pins, or filter by type
router.get("/", PinController.getAll)
router.get("/:id", PinController.getById)

// ── PROTECTED ────────────────────────────────────────────
// now only these require a valid token

// Create: up to 1 video + up to 10 images
router.post(
  "/",
  authenticate,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  PinController.create
)

router.put(
  "/:id",
  authenticate,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  PinController.update
)

router.delete("/:id", authenticate, PinController.delete)

export default router
