import { RequestHandler } from "express"
import { validationResult } from "express-validator"
import { CREATED, OK } from "../utils/http-status"
import { AuthService } from "../services/auth.service"
// handel with signUp function
export const signup: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }
  try {
    const { token } = await AuthService.signup(
      req.body.email,
      req.body.password
    )
    res.status(CREATED).json({ token })
  } catch (err) {
    next(err)
  }
}

// handel with signIn function
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

// handel with signOut function
export const signout: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    AuthService.logout(authHeader)
    res.status(OK).json({ success: true, message: "Signed out successfully" })
  } catch (err) {
    next(err)
}
}