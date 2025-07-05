// src/routes/group.routes.ts
import { Router } from "express"
import { GroupController } from "../controllers/group.controller"
import { authenticate } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"

const router = Router()
router.use(authenticate)

// CRUD
router.post("/", GroupController.create)
router.get("/", GroupController.getAll)
router.get("/:id", GroupController.getById)
router.put("/:id", GroupController.update)
router.delete("/:id", GroupController.delete)

// avatar upload (single file “groupAvatar”)
router.patch(
  "/:id/avatar",
  upload.single("groupAvatar"),
  GroupController.uploadAvatar
)

// invitations & membership
router.post("/:id/invite", GroupController.invite)
router.post("/:id/join", GroupController.join)
router.post("/:id/kick/:memberId", GroupController.kickMember)
router.post("/:id/promote/:memberId", GroupController.promoteMember)

export default router
