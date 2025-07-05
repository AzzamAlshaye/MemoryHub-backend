// src/config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary"
const { CloudinaryStorage } = require("multer-storage-cloudinary")

// configure your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// only typing the bit of `file` we need (its `fieldname`)
type StorageFile = { fieldname: string }

const storage = new CloudinaryStorage({
  cloudinary,
  params: ({ file }: { file: StorageFile }) => {
    if (file.fieldname === "avatar") {
      return { folder: "avatars", resource_type: "image" }
    }
    if (file.fieldname === "groupAvatar") {
      return { folder: "group-avatars", resource_type: "image" }
    }
    if (file.fieldname === "video") {
      return { folder: "pins", resource_type: "video" }
    }
    // default to images
    return { folder: "pins", resource_type: "image" }
  },
})

export { cloudinary, storage }
