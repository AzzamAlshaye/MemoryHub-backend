// src/routes/pin.routes.ts
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"
import { PinController } from "../controllers/pin.controller"

const router = Router()
router.use(authenticate)

// Create: up to 1 video + up to 10 images
router.post(
  "/",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  PinController.create
)

router.get("/", PinController.getAll)
router.get("/:id", PinController.getById)

router.put(
  "/:id",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  PinController.update
)

router.delete("/:id", PinController.delete)

export default router
