/**
 * Returns a concise, human-friendly location name.
 * Nominatim strings can be very long, e.g.:
 *   "560076, Hulimavu, Bengaluru South City Corporation, Bengaluru, …"
 * This strips postal codes, drops verbose administrative tokens, and
 * returns at most 2 meaningful parts, e.g. "Hulimavu, Bengaluru".
 */
export function shortenPlaceName(name: string | null | undefined): string {
  if (!name) return name ?? ''

  const parts = name
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  // Drop pure numeric tokens (postal codes, house numbers, etc.)
  const withoutNumbers = parts.filter((p) => !/^\d+$/.test(p))

  // Drop overly verbose administrative tokens that contain 3+ words AND
  // at least one bureaucratic keyword. These make names unreadable.
  const bureaucraticKeywords = [
    'corporation', 'district', 'division', 'sub-district', 'taluk',
    'tehsil', 'municipal', 'urban', 'rural', 'south', 'north',
    'east', 'west', 'zone', 'ward',
  ]
  const meaningful = withoutNumbers.filter((p) => {
    const words = p.split(/\s+/)
    if (words.length < 3) return true // short parts are always kept
    const lower = p.toLowerCase()
    return !bureaucraticKeywords.some((kw) => lower.includes(kw))
  })

  const candidates = meaningful.length > 0 ? meaningful : withoutNumbers

  if (candidates.length === 0) return name
  if (candidates.length === 1) return candidates[0]

  // Take the first two candidates. Additionally shorten the second part to
  // its first word if it is a compound like "Bengaluru South" → "Bengaluru".
  const first = candidates[0]
  const secondFull = candidates[1]
  const second = secondFull.split(/\s+/)[0]

  return `${first}, ${second}`
}
