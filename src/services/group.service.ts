// src/services/group.service.ts
import crypto from "crypto"
import { GroupModel, GroupDocument } from "../models/group.model"
import { Types } from "mongoose"

export class GroupService {
  // create group with initial admin/member
  static async create(
    data: Partial<GroupDocument>,
    creatorId: string
  ): Promise<GroupDocument> {
    const group = await GroupModel.create({
      ...data,
      admins: [new Types.ObjectId(creatorId)],
      members: [new Types.ObjectId(creatorId)],
    })
    return group
  }

  static getAll(): Promise<GroupDocument[]> {
    return GroupModel.find().exec()
  }

  static getById(id: string): Promise<GroupDocument | null> {
    return GroupModel.findById(id).exec()
  }

  static update(
    id: string,
    update: Partial<GroupDocument>
  ): Promise<GroupDocument | null> {
    return GroupModel.findByIdAndUpdate(id, update, { new: true }).exec()
  }

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

  static async isAdmin(groupId: string, userId: string): Promise<boolean> {
    const group = await GroupModel.findById(groupId)
    return !!group && group.admins.some((a) => a.toString() === userId)
  }
}