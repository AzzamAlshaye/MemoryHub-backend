// src/routes/user.routes.ts
import { Router, Request, Response, NextFunction } from "express"
import { UserController } from "../controllers/user.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"

const router = Router()
router.use(authenticate)

// /users/me
router.get("/me", (req, res, next) =>
  UserController.getSelf(req as any, res, next)
)
router.put("/me", (req, res, next) =>
  UserController.updateSelf(req as any, res, next)
)
router.delete("/me", (req, res, next) =>
  UserController.deleteSelf(req as any, res, next)
)
router.patch("/me/avatar", upload.single("avatar"), (req, res, next) =>
  UserController.uploadAvatar(req as any, res, next)
)

// admin-only
router.use(authorize("admin"))

router.get("/", UserController.getAll)
router.get("/:id", UserController.getById)
router.put("/:id", UserController.update)
router.delete("/:id", UserController.delete)
router.patch(
  "/:id/avatar",
  upload.single("avatar"),
  UserController.uploadAvatar
)

export default router
