import { RequestHandler } from "express"
import { validationResult } from "express-validator"
import { CREATED, OK } from "../utils/http-status"
import { AuthService } from "../services/auth.service"

// handle sign-up
export const signup: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }

  try {
    const { email, password, name } = req.body
    const { token } = await AuthService.signup(email, password, name)
    res.status(CREATED).json({ token })
  } catch (err) {
    next(err)
  }
}

// handle sign-in
export const signin: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }

  try {
    const { email, password } = req.body
    const { token } = await AuthService.login(email, password)
    res.status(OK).json({ token })
  } catch (err) {
    next(err)
  }
}

// handle sign-out
export const signout: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    AuthService.logout(authHeader)
    res.status(OK).json({ success: true, message: "Signed out successfully" })
  } catch (err) {
    next(err)
  }
}