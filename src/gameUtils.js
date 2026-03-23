import { G } from './gameData'

export function calcStars(hp, totalHp, score, totalQuestions) {
  const hpRatio = hp / totalHp
  const scoreRatio = score / totalQuestions
  const combined = (hpRatio + scoreRatio) / 2
  if (combined >= 0.85) return 3
  if (combined >= 0.55) return 2
  return 1
}

export function isUnlocked(phaseId, done, stars) {
  const rules = {
    forge: () => true,
    usub: () => done.includes('forge'),
    measure: () => done.includes('forge'),
    boss_forge: () => done.includes('forge') && (stars.forge ?? 0) >= 3,
    parts: () => done.includes('boss_forge'),
    connect: () => done.includes('measure') && done.includes('usub'),
    boss_usub_parts: () =>
      done.includes('parts') &&
      done.includes('connect') &&
      (stars.parts ?? 0) >= 3 &&
      (stars.connect ?? 0) >= 3,
    boss_final: () =>
      done.includes('boss_usub_parts') && (stars.boss_usub_parts ?? 0) >= 3,
  }

  return rules[phaseId]?.() ?? false
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
