import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { UserModel, UserDocument, UserRole } from "../models/user.model"
import { jwtConfig } from "../config/jwt"
import { AppError } from "../utils/error"
import { UNAUTHORIZED, FORBIDDEN } from "../utils/http-status"

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // get token from header
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("You are not logged in", UNAUTHORIZED)
    }
    const token = authHeader.split(" ")[1]
    // check of token
    const decoded = jwt.verify(token, jwtConfig.secret) as {
      sub: string
      iat: number
      exp: number
    }
// search of users in model of database
    const user = await UserModel.findOne({ id: decoded.sub })
    if (!user) {
      throw new AppError("User no longer exists", UNAUTHORIZED)
    }
    req.user = user
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new AppError("Token has expired", UNAUTHORIZED))
    } else {
      next(new AppError("Invalid token", UNAUTHORIZED))
    }
  }
}

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user
    // check if user authorize
    if (!user) {
      return next(new AppError("You are not logged in", UNAUTHORIZED))
    }
    if (!allowedRoles.includes(user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          FORBIDDEN
        )
      )
    }
    next()
  }
}