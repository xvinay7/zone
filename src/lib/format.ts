export function shortenPlaceName(name: string): string {
  if (!name) return name
  const parts = name.split(',').map((p) => p.trim()).filter((p) => p.length > 0)
  const readableParts = parts.filter((p) => !/^\d+$/.test(p)) // Drop postal codes or pure numbers
  if (readableParts.length <= 2) return name // Already short
  return readableParts.slice(0, 2).join(', ')
}
