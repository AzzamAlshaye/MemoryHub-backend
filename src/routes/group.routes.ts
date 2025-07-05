// src/routes/group.routes.ts
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"
import { GroupController } from "../controllers/group.controller"

const router = Router()

// ── Public (no auth) ────────────────────────────────────────
// List all groups the user might see (e.g. public groups)
router.get("/", GroupController.getAll)
// Get a single group’s details
router.get("/:id", GroupController.getById)

// ── Protected (must be logged in) ──────────────────────────
// Create a new group
router.post("/", authenticate, GroupController.create)

// Update or delete an existing group
router.put("/:id", authenticate, GroupController.update)
router.delete("/:id", authenticate, GroupController.delete)

// Upload or change the group’s avatar
router.patch(
  "/:id/avatar",
  authenticate,
  upload.single("groupAvatar"),
  GroupController.uploadAvatar
)

// Membership actions
router.post("/:id/invite", authenticate, GroupController.invite)
router.post("/:id/join", authenticate, GroupController.join)
router.post("/:id/kick/:memberId", authenticate, GroupController.kickMember)
router.post(
  "/:id/promote/:memberId",
  authenticate,
  GroupController.promoteMember
)

export default router
