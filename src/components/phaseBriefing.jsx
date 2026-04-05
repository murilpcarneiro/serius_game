import { useEffect, useMemo, useRef, useState } from 'react'
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
  playerState,
  onContinue,
  onCancel,
}) {
  const data = briefing ?? defaultBriefing
  const isBoss = phase?.type === 'boss'
  const tips = Array.isArray(data.tips) ? data.tips.slice(0, 3) : []
  const donePhases = playerState?.done ?? []
  const isFirstAttempt = phase?.id && !donePhases.includes(phase.id)
  const showGuidedOnboarding =
    isFirstAttempt && ['forge', 'usub'].includes(phase?.id)

  const onboardingTips =
    phase?.id === 'forge'
      ? [
          'Objetivo principal: montar a antiderivada correta e confirmar antes de clicar em verificar.',
          'Nao gaste itens cedo: reserve escudo e dica para a ultima questao da fase.',
          'Busque 3 estrelas: manter vida alta e acertar com consistencia acelera o progresso.',
        ]
      : [
          'No U-SUB, identifique primeiro o termo interno para escolher u corretamente.',
          'Cheque se du realmente aparece no integrando antes de substituir.',
          'Se travar em um passo, use dica para destravar sem comprometer toda a fase.',
        ]

  const speechLines = useMemo(() => {
    const lines = [data.ambience, ...tips.map((tip) => `• ${tip}`)]

    if (showGuidedOnboarding) {
      lines.push('Guia do Novato')
      lines.push(...onboardingTips.map((tip) => `• ${tip}`))
    }

    return lines
  }, [data.ambience, tips, showGuidedOnboarding, onboardingTips])

  const fullSpeech = useMemo(() => speechLines.join('\n'), [speechLines])
  const [typedChars, setTypedChars] = useState(0)
  const [typingDone, setTypingDone] = useState(false)
  const typingTimerRef = useRef(null)

  const stopTypingTimer = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
      typingTimerRef.current = null
    }
  }

  useEffect(() => {
    stopTypingTimer()
    setTypedChars(0)
    setTypingDone(false)

    if (!fullSpeech.length) {
      setTypingDone(true)
      return undefined
    }

    typingTimerRef.current = setInterval(() => {
      setTypedChars((prev) => {
        const next = Math.min(fullSpeech.length, prev + 1)
        if (next >= fullSpeech.length) {
          stopTypingTimer()
          setTypingDone(true)
        }
        return next
      })
    }, 17)

    return () => stopTypingTimer()
  }, [fullSpeech])

  const handleSkipTyping = () => {
    if (typingDone) return
    stopTypingTimer()
    setTypedChars(fullSpeech.length)
    setTypingDone(true)
  }

  const typedSpeech = fullSpeech.slice(0, typedChars)

  return (
    <section className="screen npc-briefing-screen">
      <div className="npc-briefing-backdrop" aria-hidden="true" />

      <article className="npc-briefing-card" onClick={handleSkipTyping}>
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
            <pre className="npc-speech">
              {typedSpeech}
              {!typingDone && <span className="npc-cursor">▌</span>}
            </pre>
            {!typingDone && (
              <p className="npc-skip-hint">Clique no card para mostrar tudo.</p>
            )}
          </div>
        </div>

        <footer className="npc-briefing-actions">
          {!typingDone && (
            <button
              className="btn"
              onClick={(event) => {
                event.stopPropagation()
                handleSkipTyping()
              }}
            >
              Pular Fala
            </button>
          )}
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
