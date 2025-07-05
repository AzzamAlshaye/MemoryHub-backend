// src/routes/user.routes.ts
import { Router, Request, Response, NextFunction } from "express"
import { UserController } from "../controllers/user.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"

const router = Router()

// All routes below require a valid JWT
router.use(authenticate)

// ─── “/users/me” endpoints ────────────────────────────────────────────────
// GET /users/me
router.get("/me", (req, res, next) =>
  UserController.getSelf(req as Request & { user: { id: string } }, res, next)
)

// PUT /users/me
router.put("/me", (req, res, next) =>
  UserController.updateSelf(
    req as Request & { user: { id: string } },
    res,
    next
  )
)

// DELETE /users/me
router.delete("/me", (req, res, next) =>
  UserController.deleteSelf(
    req as Request & { user: { id: string } },
    res,
    next
  )
)

// PATCH /users/me/avatar
router.patch("/me/avatar", upload.single("avatar"), (req, res, next) =>
  UserController.uploadAvatar(
    req as Request & { user: { id: string }; file?: Express.Multer.File },
    res,
    next
  )
)

// ─── Admin‐only endpoints ──────────────────────────────────────────────────
router.use(authorize("admin"))

// GET /users
router.get("/", UserController.getAll)

// GET /users/:id
router.get("/:id", UserController.getById)

// PATCH /users/:id
router.put("/:id", UserController.update)

// DELETE /users/:id
router.delete("/:id", UserController.delete)

// PATCH /users/:id/avatar
router.patch(
  "/:id/avatar",
  upload.single("avatar"),
  UserController.uploadAvatar
)

export default router
