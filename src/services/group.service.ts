import crypto from "crypto"
import { GroupModel, GroupDocument } from "../models/group.model"

export class GroupService {
  // create group
  static create(data: Partial<GroupDocument>): Promise<GroupDocument> {
    return GroupModel.create(data)
  }

  // show all groups
  static getAll(): Promise<GroupDocument[]> {
    return GroupModel.find().exec()
  }

  // get group by id
  static getById(id: string): Promise<GroupDocument | null> {
    return GroupModel.findById(id).exec()
  }

  // update group
  static update(id: string, update: Partial<GroupDocument>): Promise<GroupDocument | null> {
    return GroupModel.findByIdAndUpdate(id, update, { new: true }).exec()
  }

  // delete group
  static delete(id: string): Promise<GroupDocument | null> {
    return GroupModel.findByIdAndDelete(id).exec()
  }

  // generate invite token and save in group
  static async generateInviteToken(id: string): Promise<GroupDocument | null> {
    const token = crypto.randomBytes(16).toString("hex")
    return GroupModel.findByIdAndUpdate(id, { inviteToken: token }, { new: true }).exec()
  }

  // add user to members array if not already
  static async joinGroup(id: string, userId: string): Promise<GroupDocument | null> {
    const group = await GroupModel.findById(id)
    if (!group) return null

    if (!group.members.some(memberId => memberId.toString() === userId)) {
      group.members.push(userId as any)
      await group.save()
    }

    return group
  }
}
