// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { Types } from "mongoose"
import { UserRole } from "../models/user.model"
import { jwtConfig } from "../config/jwt"
import { AppError } from "../utils/error"
import { UNAUTHORIZED, FORBIDDEN } from "../utils/http-status"

declare global {
  namespace Express {
    interface Request {
      // now has _id:ObjectId, id:string, role:UserRole
      user?: { _id: Types.ObjectId; id: string; role: UserRole }
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("You are not logged in", UNAUTHORIZED))
  }

  const token = authHeader.split(" ")[1]
  let payload: { sub: string; role: UserRole }

  try {
    payload = jwt.verify(token, jwtConfig.secret) as {
      sub: string
      role: UserRole
    }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token has expired", UNAUTHORIZED))
    }
    return next(new AppError("Invalid token", UNAUTHORIZED))
  }

  // build a stub containing both ObjectId and string ID
  req.user = {
    _id: new Types.ObjectId(payload.sub),
    id: payload.sub,
    role: payload.role,
  }
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
