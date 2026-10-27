import { createSeedState } from '../data/demoData'

const STORAGE_KEY = 'karya-demo-state-v1'
const LEGACY_STORAGE_KEY = 'fairshift-demo-state-v1'

export function readDemoState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return createSeedState()

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return createSeedState()

    return { ...createSeedState(), ...parsed, settings: { ...createSeedState().settings, ...(parsed.settings || {}) }, industries: { ...createSeedState().industries, ...(parsed.industries || {}) }, }
  } catch (error) {
    console.warn('Falling back to seed state due to invalid localStorage data.', error)
    return createSeedState()
  }
}

export function writeDemoState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}

export function resetDemoState() {
  const seed = createSeedState()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  localStorage.removeItem(LEGACY_STORAGE_KEY)
  return seed
}
