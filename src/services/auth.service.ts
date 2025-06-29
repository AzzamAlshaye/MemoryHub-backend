import jwt from "jsonwebtoken"
import { UserModel, UserDocument } from "../models/user.model"
import { jwtConfig } from "../config/jwt"
import { AppError } from "../utils/error"
import { BAD_REQUEST, UNAUTHORIZED } from "../utils/http-status"
import { tokenBlacklist } from "../config/tokenBlacklist"
// create interface
export interface AuthResult {
  token: string
}

export class AuthService {
    // check of signUp
  static async signup(email: string, password: string): Promise<AuthResult> {
// check of email&password
    if (!email || !password) {
      throw new AppError("Email and password are required", BAD_REQUEST)
    }
// user already existing
    const existing = await UserModel.findOne({ email })
    if (existing) {
      throw new AppError("Email already in use", BAD_REQUEST)
    }
// operation to create new user (if user not found & state success)
    const user = await UserModel.create({ email, password })
    const token = jwt.sign(
      { sub: user.id },
      jwtConfig.secret,
      jwtConfig.accessToken.options
    )
return { token }
  }
// check of signIn
  static async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      throw new AppError("Email and password are required", BAD_REQUEST)
    }
// find user by email & password
    const user = (await UserModel.findOne({ email }).select(
      "+password"
    )) as UserDocument | null

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid credentials", UNAUTHORIZED)
    }
    const token = jwt.sign(
      { sub: user.id },
      jwtConfig.secret,
      jwtConfig.accessToken.options
    )
return { token }
  }
// signOut function
  static logout(authorizationHeader?: string): void {
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", UNAUTHORIZED)
}
// get token =>check out user by token
    const token = authorizationHeader.split(" ")[1]
    tokenBlacklist.add(token)
  }
}