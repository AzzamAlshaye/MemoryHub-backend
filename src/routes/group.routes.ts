import { Router } from "express"
import { GroupController } from "../controllers/group.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()

router.use(authenticate)

router.post("/", GroupController.create)
router.get("/", GroupController.getAll)
router.get("/:id", GroupController.getById)
router.put("/:id", GroupController.update)
router.delete("/:id", GroupController.delete)

router.post("/:id/invite", GroupController.invite)
router.post("/:id/join", GroupController.join)

export default router
