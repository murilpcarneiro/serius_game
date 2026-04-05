export const PHASE_UNLOCK_RULES = {
  forge: (done, stars) => true,
  usub: (done, stars) => done.includes('forge'),
  measure: (done, stars) => done.includes('forge'),
  boss_forge: (done, stars) => done.includes('forge') && (stars.forge ?? 0) >= 3,
  parts: (done, stars) => done.includes('boss_forge'),
  connect: (done, stars) => done.includes('measure') && done.includes('usub'),
  boss_usub_parts: (done, stars) =>
    done.includes('parts') &&
    done.includes('connect') &&
    (stars.parts ?? 0) >= 3 &&
    (stars.connect ?? 0) >= 3,
  boss_final: (done, stars) =>
    done.includes('boss_usub_parts') && (stars.boss_usub_parts ?? 0) >= 3,
}
