import { useState } from 'react'

function usePhaseLife({ state, setState, phaseId, setFeedback, onOut }) {
  const [shieldActive, setShieldActive] = useState(false)

  const consumeShield = () => {
    if (shieldActive) {
      setShieldActive(false)
      setFeedback({ msg: 'Escudo absorveu o dano.', type: 'hint' })
      return true
    }

    return false
  }

  const damage = () => {
    const nextHp = Math.max(0, state.hp - 1)
    setState((s) => ({ ...s, hp: Math.max(0, s.hp - 1) }))
    if (nextHp <= 0) onOut?.(phaseId)
    return nextHp
  }

  return { shieldActive, setShieldActive, consumeShield, damage }
}

export { usePhaseLife }
