// src/config/tokenBlacklist.ts
/**
 * A simple in-memory store of revoked JWTs.
 * In production you’d use Redis or a DB with expiry instead.
 */
export const tokenBlacklist = new Set<string>()
