import { Router } from "express"
import { body } from "express-validator"
import { signup, signin, signout } from "../controllers/auth.controller"
import { authenticate } from "../middleware/auth.middleware"
const router = Router()
// signUp-router
router.post("/signup",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password ≥8 chars"),
  ],
  signup)
// signIn-router
router.post("/login",
      [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  signin
)
// signOut-router
router.post("/logout", authenticate, signout)

export default router