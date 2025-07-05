// src/routes/user.routes.ts
import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"
import { UserController } from "../controllers/user.controller"

const router = Router()

// ── Authenticated user endpoints ──────────────────────────
// Everyone who’s logged in can manage their own account:
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

// ── Admin-only endpoints ──────────────────────────────────
// Only admins can list or manage other users:
router.get("/", authenticate, authorize("admin"), UserController.getAll)
router.get("/:id", authenticate, authorize("admin"), UserController.getById)
router.put("/:id", authenticate, authorize("admin"), UserController.update)
router.delete("/:id", authenticate, authorize("admin"), UserController.delete)
router.patch(
  "/:id/avatar",
  authenticate,
  authorize("admin"),
  upload.single("avatar"),
  UserController.uploadAvatar
)

export default router
