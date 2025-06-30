import { Router } from "express"
import { GroupController } from "../controllers/group.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()
router.use(authenticate)
// create group
router.post("/", GroupController.create)
router.get("/", GroupController.getAll)
// show,update,delete
router.get("/:id", GroupController.getById)
router.put("/:id", GroupController.update)
router.delete("/:id", GroupController.delete)

export default router