// src/routes/user.routes.ts
import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"
import { UserController } from "../controllers/user.controller"

const router = Router()

// ── Public endpoint ────────────────────────────────────────
// Anyone (no auth) can fetch basic profile: name + avatar
router.get("/:id/public", UserController.getPublicProfile)

// ── Authenticated user endpoints ───────────────────────────
router.get("/me", authenticate, (req, res, next) =>
  UserController.getSelf(req as any, res, next)
)
router.put("/me", authenticate, (req, res, next) =>
  UserController.updateSelf(req as any, res, next)
)
router.delete("/me", authenticate, (req, res, next) =>
  UserController.deleteSelf(req as any, res, next)
)
router.patch(
  "/me/avatar",
  authenticate,
  upload.single("avatar"),
  (req, res, next) => UserController.uploadAvatar(req as any, res, next)
)

// ── Admin-only endpoints ────────────────────────────────────
// Create new user
router.post("/", authenticate, authorize("admin"), UserController.create)

// List, get, update, delete, avatar for any user
router.get("/", authenticate, authorize("admin"), UserController.getAll)
router.get("/:id", authenticate, authorize("admin"), UserController.getById)
router.put("/:id", authenticate, authorize("admin"), UserController.update)
router.patch(
  "/:id/avatar",
  authenticate,
  authorize("admin"),
  upload.single("avatar"),
  UserController.uploadAvatarAdmin
)
router.delete("/:id", authenticate, authorize("admin"), UserController.delete)

export default router
