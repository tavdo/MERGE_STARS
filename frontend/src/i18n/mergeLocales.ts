/** Deep-merge locale modules recursively to preserve nested namespaces. */
export function mergeLocales<T extends Record<string, unknown>>(
  base: T,
  ...parts: Record<string, unknown>[]
): T {
  const res = JSON.parse(JSON.stringify(base))

  for (const part of parts) {
    if (!part) continue
    for (const key of Object.keys(part)) {
      const val = part[key]
      const baseVal = res[key]
      if (
        val &&
        typeof val === 'object' &&
        !Array.isArray(val) &&
        baseVal &&
        typeof baseVal === 'object' &&
        !Array.isArray(baseVal)
      ) {
        res[key] = mergeLocales(baseVal as Record<string, unknown>, val as Record<string, unknown>)
      } else {
        res[key] = val
      }
    }
  }

  return res as T
}

