// src/routes/like.routes.ts
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { LikeController } from "../controllers/like.controller"

const router = Router()

// ── Public: get like/dislike counts ──────────────────────
router.get("/:targetType/:targetId", LikeController.list)

// ── Protected: like/unlike ───────────────────────────────
router.post("/", authenticate, LikeController.create)
router.delete("/:id", authenticate, LikeController.delete)

export default router
