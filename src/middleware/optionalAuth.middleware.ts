// src/middleware/optionalAuth.middleware.ts

import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { Types } from "mongoose"
import { jwtConfig } from "../config/jwt"

// We assume you’ve already augmented Express.Request in auth.middleware,
// so req.user?: { _id: ObjectId; id: string; role: string } exists.

export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]
    try {
      const payload = jwt.verify(token, jwtConfig.secret) as {
        sub: string
        role: string
      }
      req.user = {
        _id: new Types.ObjectId(payload.sub),
        id: payload.sub,
        role: payload.role as any,
      }
    } catch (err) {
      // Invalid or expired token → treat as anonymous
      // You could log if you want: console.warn("optionalAuth failed:", err)
    }
  }
  next()
}
