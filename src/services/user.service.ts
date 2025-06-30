// src/services/user.service.ts

import { UserDocument, UserModel } from "../models/user.model"
import { AppError } from "../utils/error"
import { BAD_REQUEST } from "../utils/http-status"

export class UserService {
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
    // reuse same logic—admin vs self doesn’t change how we persist
    return this.update(id, update)
  }

  /**
   * Shared helper: applies changes to a UserDocument and saves.
   * - Enforces unique email.
   * - Triggers pre-save hook for hashing password.
   */
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
    // 1) Email uniqueness
    if (update.email && update.email !== user.email) {
      const conflict = await UserModel.findOne({ email: update.email }).exec()
      if (conflict && conflict._id.toString() !== user._id.toString()) {
        throw new AppError("Email already in use", BAD_REQUEST)
      }
      user.email = update.email
    }

    // 2) Other fields
    if (update.name !== undefined) {
      user.name = update.name
    }
    if (update.avatar !== undefined) {
      user.avatar = update.avatar
    }
    if (update.role !== undefined) {
      user.role = update.role as any // admin-only; validated by controller
    }

    // 3) Password (hashing via pre-save hook)
    if (update.password !== undefined) {
      user.password = update.password
    }

    // 4) Persist
    return user.save()
  }

  static delete(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndDelete(id).exec()
  }

  static deleteSelf(id: string): Promise<UserDocument | null> {
    return this.delete(id)
  }

  // helper used in auth.middleware
  static getUserById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec()
  }
}
