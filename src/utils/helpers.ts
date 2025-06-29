// Check if we're running in development mode
export const dev = process.env.NODE_ENV === "development"

// Use the PORT environment variable if set, otherwise default to 3000
export const port = process.env.PORT || 3000
