import { G } from './gameData'
import { PHASE_UNLOCK_RULES } from './constants/phaseUnlockConstants'

export function calcStars(hp, totalHp, score, totalQuestions) {
  const hpRatio = hp / totalHp
  const scoreRatio = score / totalQuestions
  const combined = (hpRatio + scoreRatio) / 2
  if (combined >= 0.85) return 3
  if (combined >= 0.55) return 2
  return 1
}

export function isUnlocked(phaseId, done, stars) {
  return PHASE_UNLOCK_RULES[phaseId]?.(done, stars) ?? false
}

export function phaseColor(phase) {
  if (phase.includes('FORGE')) return G.green
  if (phase.includes('U-SUB')) return G.orange
  if (phase.includes('PARTES')) return G.pink
  if (phase.includes('MEASURE')) return G.blue
  if (phase.includes('CONNECT') || phase.includes('TFC')) return G.accent
  if (phase.includes('BOSS')) return G.red
  return G.borderHi
}

export function addToGrimoire(setState, fase, conceito, integral) {
  setState((s) => ({
    ...s,
    grimoire: [
      ...s.grimoire,
      { fase, conceito, integral, timestamp: Date.now() },
    ],
  }))
}
