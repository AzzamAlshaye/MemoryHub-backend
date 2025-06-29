import { UserModel, UserDocument } from "../models/user.model"

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
    return UserModel.findByIdAndUpdate(id, update, { new: true }).exec()
  }

  static delete(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndDelete(id).exec()
  }

  // For deleting the current user
  static deleteSelf(id: string): Promise<UserDocument | null> {
    return this.delete(id)
  }

  // helper used in auth.middleware
  static getUserById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec()
  }
}
