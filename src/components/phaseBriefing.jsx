import { useEffect, useState } from 'react'
import { G } from '../gameData'
import { Tag } from './ui'

const defaultBriefing = {
  npcName: 'Guia da Campanha',
  npcRole: 'Vigia do Mapa',
  ambience: 'O ar fica denso enquanto o proximo desafio se aproxima.',
  tips: [
    'Leia o objetivo da fase antes de responder.',
    'Priorize consistencia nos passos do calculo.',
    'Use itens com estrategia para manter suas vidas.',
  ],
}

export function PhaseBriefingScreen({
  phase,
  briefing,
  onContinue,
  onCancel,
}) {
  const data = briefing ?? defaultBriefing
  const isBoss = phase?.type === 'boss'
  const tips = Array.isArray(data.tips) ? data.tips.slice(0, 3) : []
  const [visibleTips, setVisibleTips] = useState(0)

  useEffect(() => {
    setVisibleTips(0)
    if (!tips.length) return undefined

    const timers = tips.map((_, index) =>
      setTimeout(() => {
        setVisibleTips((current) => Math.max(current, index + 1))
      }, 250 + index * 220),
    )

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [phase?.id])

  return (
    <section className="screen npc-briefing-screen">
      <div className="npc-briefing-backdrop" aria-hidden="true" />

      <article className="npc-briefing-card">
        <header className="npc-briefing-head">
          <Tag color={isBoss ? G.red : G.blue}>
            {isBoss ? 'Aviso de Boss' : 'Briefing de Campo'}
          </Tag>
          <p className="npc-briefing-phase">{phase?.name ?? 'Proxima fase'}</p>
        </header>

        <div className="npc-briefing-body">
          <div className="npc-avatar-wrap" aria-hidden="true">
            <div className={`npc-avatar-core ${isBoss ? 'boss' : ''}`}>
              {data.npcName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="npc-avatar-ring" />
          </div>

          <div className="npc-dialogue">
            <p className="npc-name">{data.npcName}</p>
            <p className="npc-role">{data.npcRole}</p>
            <p className="npc-ambience">{data.ambience}</p>

            <ul className="npc-tip-list">
              {tips.map((tip, index) => (
                <li
                  key={tip}
                  className={`npc-tip-item ${visibleTips > index ? 'show' : ''}`}
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="npc-briefing-actions">
          <button className="btn" onClick={onCancel}>
            Voltar ao Mapa
          </button>
          <button className="btn primary" onClick={onContinue}>
            Entrar na Fase
          </button>
        </footer>
      </article>
    </section>
  )
}
