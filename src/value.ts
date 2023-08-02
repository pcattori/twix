export type Value =
  | number
  | string
  | boolean
  | null

export function is_truthy(value: Value): boolean {
  if (value === null) return false
  if (typeof value === "boolean") return value
  return true
}

export function is_equal(a: Value, b: Value): boolean {
  if (a === null && b === null) return true
  if (typeof a === "boolean" && typeof b === "boolean") return a === b
  if (typeof a === "string" && typeof b === "string") return a === b
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < Number.EPSILON
  return false
}
