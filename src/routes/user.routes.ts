// src/routes/user.routes.ts
import { Router, Request, Response, NextFunction } from "express"
import { UserController } from "../controllers/user.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"

const router = Router()

// all routes require authentication
router.use(authenticate)

// admin-only routes to manage other users
router.get("/", authorize("admin"), UserController.getAll)
router.get("/:id", authorize("admin"), UserController.getById)
router.put("/:id", authorize("admin"), UserController.update)
router.delete("/:id", authorize("admin"), UserController.delete)

// user-self endpoints
router.put("/me", (req: Request, res: Response, next: NextFunction) =>
  UserController.updateSelf(
    req as Request & { user: { id: string } },
    res,
    next
  )
)

router.delete("/me", (req: Request, res: Response, next: NextFunction) =>
  UserController.deleteSelf(
    req as Request & { user: { id: string } },
    res,
    next
  )
)

export default router
