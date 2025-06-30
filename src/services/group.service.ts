import { GroupModel, GroupDocument } from "../models/group.model"

export class GroupService {
    // create group
  static create(data: Partial<GroupDocument>): Promise<GroupDocument> {
    return GroupModel.create(data)
  }
// show all group(get)
  static getAll(): Promise<GroupDocument[]> {
    return GroupModel.find().exec()
  }
// show group bt id (get)
  static getById(id: string): Promise<GroupDocument | null> {
    return GroupModel.findById(id).exec()
  }
// update group 
  static update(
    id: string,
    update: Partial<GroupDocument>
  ): Promise<GroupDocument | null> {
    return GroupModel.findByIdAndUpdate(id, update, { new: true }).exec()
  }
// delete group
  static delete(id: string): Promise<GroupDocument | null> {
    return GroupModel.findByIdAndDelete(id).exec()
  }
}