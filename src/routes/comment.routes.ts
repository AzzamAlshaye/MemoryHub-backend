// src/routes/comment.routes.ts
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { CommentController } from "../controllers/comment.controller"

const router = Router()

// ── Public: list comments for a pin ───────────────────────
router.get("/pin/:pinId", CommentController.listByPin)

// ── Protected: create, update, delete ────────────────────
router.post("/", authenticate, CommentController.create)
router.put("/:id", authenticate, CommentController.update)
router.delete("/:id", authenticate, CommentController.delete)

export default router
