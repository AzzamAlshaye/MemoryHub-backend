// src/routes/comment.routes.ts
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { CommentController } from "../controllers/comment.controller"

const router = Router()
router.use(authenticate)

router.post("/", CommentController.create)
router.get("/pin/:pinId", CommentController.listByPin)
router.put("/:id", CommentController.update)
router.delete("/:id", CommentController.delete)

export default router
