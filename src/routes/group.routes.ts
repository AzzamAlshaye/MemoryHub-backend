import express from "express"
import { GroupController } from "../controllers/group.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = express.Router()
router.use(authenticate)
// get and update and delete
router.post("/", GroupController.create)
router.get("/", GroupController.getAll)
router.get("/:id", GroupController.getById)
router.put("/:id", GroupController.update)
router.delete("/:id", GroupController.delete)
// invite and join
router.post("/:id/invite", GroupController.invite)
router.post("/:id/join", GroupController.join)

export default router