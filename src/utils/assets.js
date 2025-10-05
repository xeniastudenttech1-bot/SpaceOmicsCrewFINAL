const assetModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg,svg,webp,mp4,webm}', {
  eager: true,
  import: 'default',
  query: '?url'
})

const normalizedEntries = Object.entries(assetModules).map(([key, url]) => {
  const normalizedKey = normalizePath(key.replace('../assets/', ''))
  const base = normalizedKey.split('/').pop()
  return { key: normalizedKey, base, url }
})

function normalizePath(value = '') {
  return value
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .toLowerCase()
}

function normalizeName(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function resolveAsset(candidate, { fallback } = {}) {
  if (!candidate) return fallback ?? null
  if (/^(data:|https?:|blob:)/i.test(candidate)) return candidate

  const normalizedCandidate = normalizePath(candidate)
  const normalizedFile = normalizedCandidate
    .replace(/^src\//, '')
    .replace(/^assets\//, '')
    .replace(/^images\//, '')
  const byBase = normalizedFile.split('/').pop()

  const match = normalizedEntries.find(entry =>
    entry.key === normalizedFile ||
    entry.key === `images/${normalizedFile}` ||
    entry.base === byBase ||
    entry.base === normalizeName(byBase)
  )

  if (match) return match.url
  return fallback ?? candidate
}

export function resolvePlantAsset(candidateNames = [], { fallback } = {}) {
  const normalizedNames = (Array.isArray(candidateNames) ? candidateNames : [candidateNames])
    .filter(Boolean)
    .map(value => normalizeName(value))

  for (const name of normalizedNames) {
    const match = normalizedEntries.find(entry => {
      if (!entry.base) return false
      const base = entry.base.replace(/\.[^.]+$/, '')
      return base === name || base === name.replace(/\s+/g, '-') || base === name.replace(/\s+/g, '')
    })
    if (match) return match.url
  }

  return fallback ?? resolveAsset('placeholder-plant.svg')
}

export function listAvailableAssets() {
  return normalizedEntries.map(entry => entry.key)
}
