import { RequestHandler } from "express"
import { validationResult } from "express-validator"
import { CREATED, OK } from "../utils/http-status"
// handel with signUp function
export const signup: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }

  try {
    const { email, password } = req.body
// create JWT
    const token = "dummy-signup-token" 
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
// check of users
 const token = "dummy-signin-token" 

    res.status(OK).json({ token })
  } catch (err) {
    next(err)
  }
}
// handel with signOut function
export const signout: RequestHandler = (req, res, next) => {
  try {
// if success
    res.status(OK).json({ success: true, message: "Signed out successfully" })
  } catch (err) {
    next(err)
  }
}