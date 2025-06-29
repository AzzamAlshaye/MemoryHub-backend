import { PinModel, PinDocument } from "../models/pin.model"

export class PinService {
  static create(data: Partial<PinDocument>): Promise<PinDocument> {
    return PinModel.create(data)
  }

  static getAll(): Promise<PinDocument[]> {
    return PinModel.find().exec()
  }

  static getById(id: string): Promise<PinDocument | null> {
    return PinModel.findById(id).exec()
  }

  static update(
    id: string,
    update: Partial<PinDocument>
  ): Promise<PinDocument | null> {
    return PinModel.findByIdAndUpdate(id, update, { new: true }).exec()
  }

  static delete(id: string): Promise<PinDocument | null> {
    return PinModel.findByIdAndDelete(id).exec()
  }
}
