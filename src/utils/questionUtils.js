import {
  PHASE_ERROR_CATEGORY,
  QUESTION_HISTORY_KEY,
} from '../constants/learningConstants'

export function shuffleItems(items) {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function readHistory() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(QUESTION_HISTORY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeHistory(history) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // Falha de persistência não deve interromper a fase.
  }
}

export function selectQuestionsForRun(phaseId, pool, targetCount) {
  const safePool = Array.isArray(pool) ? pool : []
  if (!safePool.length) return []

  const target = Math.max(1, Math.min(targetCount, safePool.length))
  const history = readHistory()
  const seen = Array.isArray(history[phaseId]) ? history[phaseId] : []

  const indexed = safePool.map((question, index) => ({ question, index }))
  const unseen = indexed.filter((entry) => !seen.includes(entry.index))
  const seenEntries = indexed.filter((entry) => seen.includes(entry.index))

  const ordered = [...shuffleItems(unseen), ...shuffleItems(seenEntries)]
  const selected = ordered.slice(0, target)

  const selectedIndexes = selected.map((entry) => entry.index)
  const dedupSeen = [...new Set([...seen, ...selectedIndexes])]
  const maxHistory = Math.max(1, safePool.length - 1)

  history[phaseId] = dedupSeen.slice(-maxHistory)
  writeHistory(history)

  return selected.map((entry) => entry.question)
}

export function categoryLabel(phaseName) {
  return PHASE_ERROR_CATEGORY[phaseName] ?? 'Conceito de integracao'
}
