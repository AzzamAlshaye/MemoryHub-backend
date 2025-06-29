import mongoose from "mongoose"
import logger from "../utils/logger"

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI?.trim()
    const dbName = process.env.MONGODB_DB?.trim()
    if (!mongoURI || !dbName) {
      logger.error("MONGODB_URI or MONGODB_DB is not defined")
      process.exit(1)
    }
    await mongoose.connect(mongoURI, { dbName })
    logger.info(`MongoDB connected successfully to database “${dbName}”`)
  } catch (error) {
    logger.error("MongoDB connection error:", error)
    process.exit(1)
  }
}
