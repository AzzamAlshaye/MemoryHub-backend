// logger.js
import winston from "winston"

// Create a logger instance with default settings
const logger = winston.createLogger({
  level: "info", // minimum level to log (info, warn, error, etc.)
  format: winston.format.combine(
    winston.format.timestamp(), // add timestamp to each log entry
    winston.format.json() // output logs in JSON format
  ),
  transports: [
    // Write error-level logs to logs/error.log
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Write all logs (info and above) to logs/combined.log
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
})

// In non-production environments, also log to the console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // add colors for easier reading
        winston.format.simple() // simple text output (not JSON)
      ),
    })
  )
}

export default logger
