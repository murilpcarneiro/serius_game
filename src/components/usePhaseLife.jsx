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
    let nextHp = state.hp
    setState((s) => {
      nextHp = Math.max(0, s.hp - 1)
      return { ...s, hp: nextHp }
    })

    if (nextHp <= 0) onOut?.(phaseId)
    return nextHp
  }

  return { shieldActive, setShieldActive, consumeShield, damage }
}

export { usePhaseLife }
