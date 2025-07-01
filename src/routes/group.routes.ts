// src/routes/group.routes.ts
import express from "express"
import { GroupController } from "../controllers/group.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = express.Router()

router.use(authenticate)
// group CRUD operations
router.post("/", GroupController.create)
router.get("/", GroupController.getAll)
router.get("/:id", GroupController.getById)
router.put("/:id", GroupController.update)
router.delete("/:id", GroupController.delete)
// invite and join to group
router.post("/:id/invite", GroupController.invite)
router.post("/:id/join", GroupController.join)

//member of group
router.post("/:id/kick/:memberId", GroupController.kickMember)
router.post("/:id/promote/:memberId", GroupController.promoteMember)

export default router