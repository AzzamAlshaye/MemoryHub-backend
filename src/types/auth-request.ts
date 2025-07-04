// src/types/auth-request.ts
import { Request } from "express"
import { Types } from "mongoose"
import { UserRole } from "../models/user.model" // wherever you keep your roles

export interface AuthRequest extends Request {
  user: {
    _id: Types.ObjectId
    id: string
    role: UserRole
  }
}
