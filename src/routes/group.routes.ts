// src/routes/group.routes.ts
import { Router } from "express"
import { GroupController } from "../controllers/group.controller"
import { authenticate } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"

const router = Router()

// All routes require a valid JWT
router.use(authenticate)

// ─── Group CRUD ──────────────────────────────────────────────────────────
// POST /groups
router.post("/", GroupController.create)

// GET /groups
router.get("/", GroupController.getAll)

// GET /groups/:id
router.get("/:id", GroupController.getById)

// PUT /groups/:id
router.put("/:id", GroupController.update)

// DELETE /groups/:id
router.delete("/:id", GroupController.delete)

// PATCH /groups/:id/avatar
router.patch(
  "/:id/avatar",
  upload.single("groupAvatar"),
  GroupController.uploadAvatar
)

// ─── Invitations & Membership ────────────────────────────────────────────
// POST /groups/:id/invite
router.post("/:id/invite", GroupController.invite)

// POST /groups/:id/join?token=…
router.post("/:id/join", GroupController.join)

// POST /groups/:id/kick/:memberId
router.post("/:id/kick/:memberId", GroupController.kickMember)

// POST /groups/:id/promote/:memberId
router.post("/:id/promote/:memberId", GroupController.promoteMember)

export default router
