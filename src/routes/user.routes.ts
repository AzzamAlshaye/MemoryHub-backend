// src/routes/user.routes.ts
import { Router, Request, Response, NextFunction } from "express"
import { UserController } from "../controllers/user.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"

const router = Router()

router.use(authenticate)

// ─── GET /users/me ───────────────────────────────────
// We cast `req` only when we call the controller.
router.get("/me", (req, res, next) => {
  return UserController.getSelf(
    req as Request & { user: { id: string } },
    res,
    next
  )
})

router.put("/me", (req, res, next) =>
  UserController.updateSelf(
    req as Request & { user: { id: string } },
    res,
    next
  )
)

router.delete("/me", (req, res, next) =>
  UserController.deleteSelf(
    req as Request & { user: { id: string } },
    res,
    next
  )
)

// ─── Admin‐only ───────────────────────────
router.get("/", authorize("admin"), UserController.getAll)
router.get("/:id", authorize("admin"), UserController.getById)
router.put("/:id", authorize("admin"), UserController.update)
router.delete("/:id", authorize("admin"), UserController.delete)

export default router
