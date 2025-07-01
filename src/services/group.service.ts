import crypto from "crypto"
import { GroupModel, GroupDocument } from "../models/group.model"
import { Types } from "mongoose"

export class GroupService {
  static async create(
    data: Partial<GroupDocument>,
    creatorId: string
  ): Promise<GroupDocument> {
    const objId = new Types.ObjectId(creatorId)
    return GroupModel.create({
      ...data,
      admins: [objId],
      members: [objId],
    })
  }

  static getForUser(userId: string): Promise<GroupDocument[]> {
    return GroupModel.find({ members: userId }).exec()
  }
 static getById(id: string): Promise<GroupDocument | null> {
    return GroupModel.findById(id).exec()
  }
// member of group they can update 
  static update(
    id: string,
    update: Partial<GroupDocument>
  ): Promise<GroupDocument | null> {
    return GroupModel.findByIdAndUpdate(id, update, { new: true }).exec()
  }
// delete by id 
  static delete(id: string): Promise<GroupDocument | null> {
    return GroupModel.findByIdAndDelete(id).exec()
  }

  static async generateInviteToken(id: string): Promise<GroupDocument | null> {
    const token = crypto.randomBytes(16).toString("hex")
    return GroupModel.findByIdAndUpdate(
      id,
      { inviteToken: token },
      { new: true }
    ).exec()
  }
// join to group
  static async joinGroup(
    id: string,
    userId: string
  ): Promise<GroupDocument | null> {
    const group = await GroupModel.findById(id)
    if (!group) return null
    if (!group.members.some((m) => m.toString() === userId)) {
      group.members.push(new Types.ObjectId(userId))
      await group.save()
    }
    return group
  }

  static async kickMember(
    groupId: string,
    memberId: string
  ): Promise<GroupDocument | null> {
    const group = await GroupModel.findById(groupId)
    if (!group) return null
    group.members = group.members.filter((m) => m.toString() !== memberId)
    group.admins = group.admins.filter((a) => a.toString() !== memberId)
    await group.save()
    return group
  }

  static async promoteMember(
    groupId: string,
    memberId: string
  ): Promise<GroupDocument | null> {
    const group = await GroupModel.findById(groupId)
    if (!group) return null
    if (!group.members.some((m) => m.toString() === memberId)) return null
    if (!group.admins.some((a) => a.toString() === memberId)) {
      group.admins.push(new Types.ObjectId(memberId))
      await group.save()
    }
    return group
  }

  static async isAdmin(groupId: string, userId: string): Promise<boolean> {
    const group = await GroupModel.findById(groupId)
    return !!group && group.admins.some((a) => a.toString() === userId)
  }

  static async isMember(groupId: string, userId: string): Promise<boolean> {
    const group = await GroupModel.findById(groupId)
    return !!group && group.members.some((m) => m.toString() === userId)
  }
}