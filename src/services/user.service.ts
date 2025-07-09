// src/services/user.service.ts
import { UserDocument, UserModel } from "../models/user.model"
import { AppError } from "../utils/error"
import { BAD_REQUEST } from "../utils/http-status"

export class UserService {
  // Admin create
  static async create(data: {
    email: string
    password: string
    name: string
    role?: string
    avatar?: string
  }): Promise<UserDocument> {
    // 1) ensure email unique
    const conflict = await UserModel.findOne({ email: data.email }).exec()
    if (conflict) {
      throw new AppError("Email already in use", BAD_REQUEST)
    }

    // 2) instantiate & save (pre-save hooks handle password hashing)
    const user = new UserModel({
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
    })
    return user.save()
  }

  static getAll(): Promise<UserDocument[]> {
    return UserModel.find().exec()
  }

  static getById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec()
  }

  /**
   * Admin update: can change any field, including password—will be hashed.
   */
  static async update(
    id: string,
    update: {
      email?: string
      password?: string
      name?: string
      avatar?: string
      role?: string
    }
  ): Promise<UserDocument | null> {
    const user = await UserModel.findById(id).select("+password")
    if (!user) return null
    return this.applyUpdates(user, update)
  }

  /**
   * User-self update: same logic as admin, just scoped to current user.
   */
  static async updateSelf(
    id: string,
    update: {
      email?: string
      password?: string
      name?: string
      avatar?: string
    }
  ): Promise<UserDocument | null> {
    return this.update(id, update)
  }

  private static async applyUpdates(
    user: UserDocument,
    update: {
      email?: string
      password?: string
      name?: string
      avatar?: string
      role?: string
    }
  ): Promise<UserDocument> {
    if (update.email && update.email !== user.email) {
      const conflict = await UserModel.findOne({ email: update.email }).exec()
      if (conflict && conflict._id.toString() !== user._id.toString()) {
        throw new AppError("Email already in use", BAD_REQUEST)
      }
      user.email = update.email
    }
    if (update.name !== undefined) user.name = update.name
    if (update.avatar !== undefined) user.avatar = update.avatar
    if (update.role !== undefined) user.role = update.role as any
    if (update.password !== undefined) user.password = update.password
    return user.save()
  }

  static delete(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndDelete(id).exec()
  }

  static deleteSelf(id: string): Promise<UserDocument | null> {
    return this.delete(id)
  }

  // for auth.middleware
  static getUserById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec()
  }
}
