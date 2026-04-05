import { MAP_UNLOCK_HINT_BY_ID } from '../constants/mapConstants'
import { isUnlocked } from '../gameUtils'

export function getUnlockHint(id, done, stars) {
  if (isUnlocked(id, done, stars)) return 'Pronto para jogar'
  return MAP_UNLOCK_HINT_BY_ID[id] ?? 'Bloqueado'
}

export function createEdgePath(from, to, index) {
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  const bend = index % 2 === 0 ? -28 : 28
  return `M ${from.x} ${from.y} Q ${midX} ${midY + bend} ${to.x} ${to.y}`
}
