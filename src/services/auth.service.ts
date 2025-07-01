import jwt from "jsonwebtoken"
import { UserModel, UserDocument } from "../models/user.model"
import { jwtConfig } from "../config/jwt"
import { AppError } from "../utils/error"
import { BAD_REQUEST, UNAUTHORIZED } from "../utils/http-status"
import { tokenBlacklist } from "../config/tokenBlacklist"
import { Types } from "mongoose"

export interface AuthResult {
  token: string
}

export class AuthService {
  static async signup(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResult> {
    if (!email || !password || !name) {
      throw new AppError("Email, password and name are required", BAD_REQUEST)
    }

    const existing = await UserModel.findOne({ email })
    if (existing) {
      throw new AppError("Email already in use", BAD_REQUEST)
    }

    const user = await UserModel.create({ email, password, name })
    const objectId = user._id as unknown as Types.ObjectId

    const token = jwt.sign(
      { sub: objectId.toString() }, 
      jwtConfig.secret,
      jwtConfig.accessToken.options
    )

    return { token }
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      throw new AppError("Email and password are required", BAD_REQUEST)
    }

    const user = (await UserModel.findOne({ email }).select(
      "+password"
    )) as UserDocument | null

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid credentials", UNAUTHORIZED)
    }
    const objectId = user._id as unknown as Types.ObjectId

    const token = jwt.sign(
      { sub: objectId.toString() },
      jwtConfig.secret,
      jwtConfig.accessToken.options
    )

    return { token }
  }

  static logout(authorizationHeader?: string): void {
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", UNAUTHORIZED)
    }
    const token = authorizationHeader.split(" ")[1]
    tokenBlacklist.add(token)
  }
}