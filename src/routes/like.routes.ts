import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { LikeController } from "../controllers/like.controller"

const router = Router()
router.use(authenticate)

router.post("/", LikeController.create)
router.get("/:targetType/:targetId", LikeController.list)
router.delete("/:id", LikeController.delete)

export default router