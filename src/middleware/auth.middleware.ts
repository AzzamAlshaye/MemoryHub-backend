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
  console.log("→ Auth header:", req.headers.authorization)

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("You are not logged in", UNAUTHORIZED))
  }

  const token = authHeader.split(" ")[1]
// check of token
  let payload: { sub: string }
  try {
    payload = jwt.verify(token, jwtConfig.secret) as { sub: string }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token has expired", UNAUTHORIZED))
    }
    return next(new AppError("Invalid token", UNAUTHORIZED))
  }

  const user = await UserModel.findById(payload.sub)
  if (!user) {
    return next(new AppError("User no longer exists", UNAUTHORIZED))
  }
  req.user = user
  next()
}

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("You are not logged in", UNAUTHORIZED))
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You do not have permission", FORBIDDEN))
    }
    next()
  }
}