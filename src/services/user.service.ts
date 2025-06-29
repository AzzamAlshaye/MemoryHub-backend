// src/services/user.service.ts
import { UserDocument, UserModel } from "../models/user.model"

export class UserService {
  static getAll(): Promise<UserDocument[]> {
    return UserModel.find().exec()
  }

  static getById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec()
  }

  static update(
    id: string,
    update: Partial<UserDocument>
  ): Promise<UserDocument | null> {
    // for admin updates (bypasses pre-save hooks)
    return UserModel.findByIdAndUpdate(id, update, { new: true }).exec()
  }

  static async updateSelf(
    id: string,
    update: {
      email?: string
      password?: string
      name?: string
      avatar?: string
    }
  ): Promise<UserDocument | null> {
    const user = await UserModel.findById(id)
    if (!user) return null

    if (update.email !== undefined) user.email = update.email
    if (update.name !== undefined) user.name = update.name
    if (update.avatar !== undefined) user.avatar = update.avatar
    if (update.password !== undefined) {
      user.password = update.password // will be hashed by pre-save
    }

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
