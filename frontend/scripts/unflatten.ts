/**
 * Convert flat "a.b.c" keys into a nested object.
 * Arrays are kept as arrays when the English value was an array.
 */
export function unflatten(
  flat: Record<string, unknown>,
): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split('.')
    let cur: Record<string, unknown> = root
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i]
      if (!(p in cur) || typeof cur[p] !== 'object' || cur[p] === null || Array.isArray(cur[p])) {
        cur[p] = {}
      }
      cur = cur[p] as Record<string, unknown>
    }
    cur[parts[parts.length - 1]] = value
  }
  return root
}
