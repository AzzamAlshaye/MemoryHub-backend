// src/routes/pin.routes.ts


import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { optionalAuthenticate } from "../middleware/optionalAuth.middleware"
import { upload } from "../middleware/upload.middleware"
import { PinController } from "../controllers/pin.controller"
import { UserRole } from "../models/user.model"

const router = Router()

// ── LISTING (public, private & group) ─────────────────────────
// optionalAuthenticate will populate req.user if a valid Bearer token is sent,
// but will not reject anonymous requests.
router.get("/me", authenticate, PinController.getMyPins)
router.get("/", optionalAuthenticate, PinController.getAll)
router.get("/:id", optionalAuthenticate, PinController.getById)

// ── PROTECTED MUTATIONS (create, update, delete) ───────────────
// Only authenticated users with role=User may create/update/delete pins.

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


router.delete(
  "/:id",
  authenticate,

  PinController.delete
)


export default router
