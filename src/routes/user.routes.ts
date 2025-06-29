import { Router, Request, Response, NextFunction } from "express"
import { UserController } from "../controllers/user.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"

const router = Router()

// All /users/* routes require a valid JWT
router.use(authenticate)

// Admin-only routes to manage other users
router.get("/", authorize("admin"), UserController.getAll)
router.get("/:id", authorize("admin"), UserController.getById)
router.put("/:id", authorize("admin"), UserController.update)
router.delete("/:id", authorize("admin"), UserController.delete)

// Allow authenticated users to delete their own account,
// but wrap in a plain RequestHandler so Express’s overload matches
router.delete("/me", (req: Request, res: Response, next: NextFunction) => {
  return UserController.deleteSelf(
    req as Request & { user: { id: string } },
    res,
    next
  )
})

export default router
