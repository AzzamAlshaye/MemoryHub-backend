// src/routes/group.routes.ts
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"
import { GroupController } from "../controllers/group.controller"

const router = Router()

// ── Protected (must be logged in) ──────────────────────────
// List all groups the user belongs to
router.get("/", authenticate, GroupController.getAll)

// Get a single group’s details (still public)
router.get("/:id", GroupController.getById)

// Create, update, delete (protected)
router.post("/", authenticate, GroupController.create)
router.put("/:id", authenticate, GroupController.update)
router.delete("/:id", authenticate, GroupController.delete)

// Upload/change avatar
router.patch(
  "/:id/avatar",
  authenticate,
  upload.single("groupAvatar"),
  GroupController.uploadAvatar
)

// Membership actions (protected)
router.post("/:id/invite", authenticate, GroupController.invite)
router.post("/:id/join", authenticate, GroupController.join)
router.post("/:id/kick/:memberId", authenticate, GroupController.kickMember)
router.post("/:id/leave", authenticate, GroupController.leaveGroup)
router.post(
  "/:id/promote/:memberId",
  authenticate,
  GroupController.promoteMember
)

export default router
