import { monotonicFactory } from "ulid"

// Create a ULID generator that produces strictly increasing IDs,
// even when called multiple times in the same millisecond
const ulid = monotonicFactory()

/**
 * generateId
 * -------------
 * Returns a new unique identifier string each time it's called.
 * Under the hood, ULID provides:
 *  - lexicographically sortable IDs (good for ordered storage)
 *  - collision resistance across calls
 */
export const generateId = (): string => {
  return ulid() // produce and return the next ULID
}
