import { useEffect, useMemo, useState } from 'react'
import { CONNECT_Q, FORGE_Q, G, MEASURE_Q } from '../gameData'
import { addToGrimoire } from '../gameUtils'
import { PHASE_TARGET_QUESTIONS } from '../constants/learningConstants'
import {
  categoryLabel,
  selectQuestionsForRun,
  shuffleItems,
} from '../utils/questionUtils'
import { CrystalModal, Feedback, HP, ItemBar, LoreCard, Tag } from './ui'
import { usePhaseLife } from './usePhaseLife'

function PhaseDefeatScreen({ onBackMap }) {
  return (
    <section className="screen boss-end lose">
      <h2>DERROTA</h2>
      <p className="muted">Suas vidas acabaram nesta fase.</p>
      <button className="btn primary" onClick={onBackMap}>
        VOLTAR AO MAPA
      </button>
    </section>
  )
}

export function ForgeScreen({
  state,
  setState,
  onComplete,
  itemStatus,
  consumeItem,
  onExit,
  rpgModifiers,
}) {
  const phaseQuestions = useMemo(
    () =>
      selectQuestionsForRun(
        'forge',
        FORGE_Q,
        PHASE_TARGET_QUESTIONS.forge ?? FORGE_Q.length,
      ),
    [],
  )
  const [idx, setIdx] = useState(0)
  const [slots, setSlots] = useState(['', ''])
  const [feedback, setFeedback] = useState(null)
  const [shake, setShake] = useState(false)
  const [freeHintUsed, setFreeHintUsed] = useState(false)
  const [score, setScore] = useState(0)
  const [reviewEntry, setReviewEntry] = useState(null)
  const [pieceOrder, setPieceOrder] = useState([])
  const [isResolving, setIsResolving] = useState(false)
  const [defeated, setDefeated] = useState(false)

  const q = phaseQuestions[idx]
  const { shieldActive, setShieldActive, consumeShield, damage } = usePhaseLife(
    {
      state,
      setState,
      phaseId: 'forge',
      setFeedback,
      onOut: () => {
        setFeedback({ msg: 'Vidas esgotadas.', type: 'err' })
        setIsResolving(false)
        setDefeated(true)
      },
      initialShield: rpgModifiers?.hasStartShield,
    },
  )

  useEffect(() => {
    if (!q) return
    setPieceOrder(shuffleItems(q.pieces))
    setSlots(['', ''])
    setShake(false)
    setIsResolving(false)
    setFreeHintUsed(false)
  }, [idx, q?.display])

  if (!q) {
    return (
      <section className="screen phase-screen">
        <div className="phase-head">
          {onExit && (
            <button className="btn-back phase-exit-btn" onClick={onExit}>
              ← Voltar ao Mapa
            </button>
          )}
        </div>
        <p className="phase-subtitle">Questão indisponível no momento.</p>
      </section>
    )
  }

  if (defeated) {
    return (
      <PhaseDefeatScreen
        onBackMap={() => {
          setState((s) => ({ ...s, hp: 3 }))
          onExit?.()
        }}
      />
    )
  }

  const remainingPieces = (pieceOrder.length ? pieceOrder : q.pieces).filter(
    (p) => !slots.includes(p),
  )

  const verify = () => {
    if (isResolving) return
    setIsResolving(true)

    const ok = slots[0] === q.answer[0] && slots[1] === q.answer[1]
    if (ok) {
      setFeedback({ msg: `✓ ${q.ok} · +${q.xp} XP`, type: 'ok' })
      setState((s) => ({ ...s, xp: s.xp + q.xp }))
      const nextScore = score + 1
      setScore(nextScore)
      setTimeout(() => {
        if (idx + 1 >= phaseQuestions.length) {
          onComplete('forge', nextScore, phaseQuestions.length, state.hp)
        } else {
          setIdx((v) => v + 1)
          setFeedback(null)
        }
        setIsResolving(false)
      }, 1300)
      return
    }

    const category = categoryLabel('FORGE')
    addToGrimoire(setState, 'FORGE', `${category}: ${q.hint}`, q.display)
    if (!consumeShield()) {
      damage()
    }
    setFeedback({ msg: `✗ Incorreto. [${category}] ${q.hint}`, type: 'err' })
    setShake(true)
    setTimeout(() => {
      setShake(false)
      setSlots(['', ''])
      setIsResolving(false)
    }, 900)
  }

  const useItem = (itemId) => {
    const freeHintAvailable =
      itemId === 'potion_hint' && rpgModifiers?.hasFreeHint && !freeHintUsed
    if (!itemStatus(itemId).can && !freeHintAvailable) return
    if (itemId === 'potion_hint') {
      if (!freeHintAvailable) consumeItem(itemId)
      if (freeHintAvailable) setFreeHintUsed(true)
      setFeedback({ msg: `${q.hint}`, type: 'hint' })
    }
    if (itemId === 'shield_life' && !shieldActive) {
      consumeItem(itemId)
      setShieldActive(true)
      setFeedback({ msg: 'Escudo ativado para o proximo erro.', type: 'hint' })
    }
    if (itemId === 'crystal_review') {
      consumeItem(itemId)
      const list = state.grimoire
      setReviewEntry(
        list.length ? list[Math.floor(Math.random() * list.length)] : null,
      )
      if (!list.length)
        setFeedback({ msg: 'Grimório vazio no momento.', type: 'hint' })
    }
  }

  const placePiece = (piece) => {
    const pos = slots.findIndex((s) => !s)
    if (pos === -1 || isResolving) return
    const next = [...slots]
    next[pos] = piece
    setSlots(next)
  }

  return (
    <section className="screen phase-screen">
      <div className="phase-header">
        <div className="phase-info">
          <div className="phase-badge">
            <Tag color={G.green}>{q.biome}</Tag>
            <span className="phase-counter">
              {idx + 1} de {phaseQuestions.length}
            </span>
          </div>
          <div className="phase-stats">
            <HP hp={state.hp} total={3} />
            <div className="score-indicator">
              <span className="score-icon">✓</span>
              <span className="score-text">{score} corretas</span>
            </div>
          </div>
        </div>
        {onExit && (
          <button className="btn-back phase-exit-btn" onClick={onExit}>
            ← Voltar ao Mapa
          </button>
        )}
      </div>

      <p className="phase-subtitle">
        Monte a antiderivada correta combinando as pecas e confirme quando
        estiver seguro.
      </p>

      <div className="phase-content">
        <LoreCard text={q.story} />

        <div className="integral-section">
          <p className="integral-label">Resolva a Integral:</p>
          <div className="integral-display large">{q.display}</div>
        </div>

        <div className="forge-section">
          <p className="forge-label">Monta a Resposta:</p>
          <div className={`forge-slots ${shake ? 'shake' : ''}`}>
            <span className="formula-prefix">F(x) =</span>
            {slots.map((slot, i) => (
              <button
                key={i}
                className={`slot ${slot ? 'filled' : ''}`}
                disabled={isResolving}
                onClick={() =>
                  slot && setSlots((s) => s.map((v, j) => (j === i ? '' : v)))
                }
                title="Clique para remover"
              >
                {slot || '[   ]'}
              </button>
            ))}
          </div>
        </div>

        <div className="pieces-section">
          <p className="pieces-label">Selecione as peças:</p>
          <div className="pieces-row">
            {remainingPieces.map((p) => (
              <button
                key={p}
                className="piece-btn"
                disabled={isResolving}
                onClick={() => placePiece(p)}
                title="Clique para adicionar à resposta"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="action-bar">
          <button
            className="btn primary large-btn"
            disabled={isResolving}
            onClick={verify}
          >
            VERIFICAR RESPOSTA
          </button>
          {shieldActive && <span className="shield-badge">Escudo Ativo</span>}
        </div>

        {feedback && (
          <div className={`feedback ${feedback.type}`}>
            <span className="feedback-icon">
              {feedback.type === 'ok' && '✓'}
              {feedback.type === 'err' && '✗'}
              {feedback.type === 'hint' && 'i'}
            </span>
            <p>{feedback.msg}</p>
          </div>
        )}

        {reviewEntry && (
          <div className="review-modal">
            <div className="review-content">
              <p className="review-label">Revisao do Grimorio:</p>
              <div className="review-entry">
                <strong>{reviewEntry.fase}</strong>
                <p>{reviewEntry.integral}</p>
                <small>{reviewEntry.conceito}</small>
              </div>
              <button className="btn" onClick={() => setReviewEntry(null)}>
                Entendi
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="items-bar">
        {['potion_hint', 'shield_life', 'crystal_review'].map((itemId) => {
          const itmStatus = itemStatus(itemId)
          const labelMap = {
            potion_hint: 'Dica',
            shield_life: 'Escudo',
            crystal_review: 'Revisao',
          }
          return (
            <button
              key={itemId}
              className={`item-btn ${!itmStatus.can ? 'disabled' : ''}`}
              onClick={() => useItem(itemId)}
              title={
                itmStatus.qty > 0
                  ? `${itmStatus.qty} disponível(is)`
                  : 'Sem itens'
              }
            >
              <span className="item-label">{labelMap[itemId]}</span>
              <span className="item-count">x{itmStatus.qty}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function WizardScreen({
  phaseId,
  phaseName,
  color,
  questions,
  state,
  setState,
  onComplete,
  itemStatus,
  consumeItem,
  rpgModifiers,
  onExit,
}) {
  const phaseQuestions = useMemo(() => {
    const target = PHASE_TARGET_QUESTIONS[phaseId] ?? questions.length
    return selectQuestionsForRun(phaseId, questions, target)
  }, [phaseId, questions])
  const [qIdx, setQIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [stepMark, setStepMark] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [eliminated, setEliminated] = useState({})
  const [revealFirst, setRevealFirst] = useState(false)
  const [reviewEntry, setReviewEntry] = useState(null)
  const [isResolving, setIsResolving] = useState(false)
  const [optionOrder, setOptionOrder] = useState([])
  const [defeated, setDefeated] = useState(false)
  const [freeHintUsed, setFreeHintUsed] = useState(false)

  const q = phaseQuestions[qIdx]
  const curr = q?.steps?.[step]

  useEffect(() => {
    if (!curr) {
      setOptionOrder([])
      return
    }
    setOptionOrder(shuffleItems(curr.options))
    setIsResolving(false)
  }, [qIdx, step, curr?.prompt])

  const { shieldActive, setShieldActive, consumeShield, damage } = usePhaseLife(
    {
      state,
      setState,
      phaseId,
      setFeedback,
      onOut: () => {
        setFeedback({ msg: 'Vidas esgotadas.', type: 'err' })
        setIsResolving(false)
        setDefeated(true)
      },
      initialShield: rpgModifiers?.hasStartShield,
    },
  )

  if (!q || !curr) {
    return (
      <section className="screen phase-screen">
        <div className="phase-head">
          <Tag color={color}>{phaseName}</Tag>
          {onExit && (
            <button className="btn-back phase-exit-btn" onClick={onExit}>
              ← Voltar ao Mapa
            </button>
          )}
        </div>
        <p className="phase-subtitle">Questão indisponível no momento.</p>
      </section>
    )
  }

  if (defeated) {
    return (
      <PhaseDefeatScreen
        onBackMap={() => {
          setState((s) => ({ ...s, hp: 3 }))
          onExit?.()
        }}
      />
    )
  }

  const visibleOptions = optionOrder.filter(
    (o) => o !== eliminated[`${qIdx}-${step}`],
  )

  const answer = (opt) => {
    if (isResolving) return
    setIsResolving(true)

    if (opt === curr.correct) {
      const marks = [...stepMark]
      marks[step] = 'ok'
      setStepMark(marks)
      setFeedback({ msg: `✓ ${curr.explain}`, type: 'ok' })
      setTimeout(() => {
        if (step + 1 >= q.steps.length) {
          setState((s) => ({ ...s, xp: s.xp + q.xp }))
          const nextScore = score + 1
          setScore(nextScore)
          setFeedback({ msg: `✓ ${q.ok} · +${q.xp} XP`, type: 'ok' })
          setTimeout(() => {
            if (qIdx + 1 >= phaseQuestions.length) {
              onComplete(phaseId, nextScore, phaseQuestions.length, state.hp)
            } else {
              setQIdx((v) => v + 1)
              setStep(0)
              setStepMark([])
              setEliminated({})
              setRevealFirst(false)
              setFreeHintUsed(false)
              setFeedback(null)
            }
          }, 1300)
        } else {
          setStep((s) => s + 1)
          setIsResolving(false)
        }
      }, 1000)
    } else {
      const marks = [...stepMark]
      marks[step] = 'err'
      setStepMark(marks)
      const category = categoryLabel(phaseName)
      addToGrimoire(
        setState,
        phaseName,
        `${category}: ${curr.explain}`,
        q.display,
      )
      if (!consumeShield()) {
        damage()
      }
      setFeedback({
        msg: `✗ Incorreto. [${category}] ${curr.explain}`,
        type: 'err',
      })
      setTimeout(() => setIsResolving(false), 650)
    }
  }

  const useItem = (itemId) => {
    const freeHintAvailable =
      itemId === 'potion_hint' && rpgModifiers?.hasFreeHint && !freeHintUsed
    if (!itemStatus(itemId).can && !freeHintAvailable) return

    if (itemId === 'potion_hint') {
      if (!freeHintAvailable) consumeItem(itemId)
      if (freeHintAvailable) setFreeHintUsed(true)
      setFeedback({ msg: `${q.hint || curr.explain}`, type: 'hint' })
    }
    if (itemId === 'shield_life' && !shieldActive) {
      consumeItem(itemId)
      setShieldActive(true)
      setFeedback({
        msg: 'Escudo ativado para o proximo erro.',
        type: 'hint',
      })
    }
    if (itemId === 'potion_eliminate') {
      const wrong = curr.options.filter(
        (o) => o !== curr.correct && o !== eliminated[`${qIdx}-${step}`],
      )
      if (wrong.length) {
        consumeItem(itemId)
        setEliminated((e) => ({
          ...e,
          [`${qIdx}-${step}`]: wrong[Math.floor(Math.random() * wrong.length)],
        }))
      }
    }
    if (itemId === 'scroll_mage' && !revealFirst) {
      consumeItem(itemId)
      setRevealFirst(true)
      setFeedback({
        msg: `Primeiro passo: ${q.steps[0].correct}`,
        type: 'hint',
      })
    }
    if (itemId === 'crystal_review') {
      consumeItem(itemId)
      const list = state.grimoire
      setReviewEntry(
        list.length ? list[Math.floor(Math.random() * list.length)] : null,
      )
      if (!list.length)
        setFeedback({ msg: 'Grimório vazio no momento.', type: 'hint' })
    }
  }

  return (
    <section className="screen phase-screen">
      <div className="phase-head">
        <Tag color={color}>{q.biome}</Tag>
        <HP hp={state.hp} total={3} />
        {onExit && (
          <button className="btn-back phase-exit-btn" onClick={onExit}>
            ← Voltar ao Mapa
          </button>
        )}
      </div>
      <p className="phase-subtitle">
        Responda passo a passo. Cada etapa correta destrava a proxima.
      </p>
      <LoreCard text={q.story} />
      <div className="integral-display">{q.display}</div>

      <div className="progress-row">
        {q.steps.map((_, i) => (
          <span
            key={i}
            className={`step-dot ${i === step ? 'current' : ''} ${stepMark[i] || ''}`}
          >
            {i + 1}
          </span>
        ))}
      </div>

      <div className="wizard-card">
        <h3>{curr.prompt}</h3>
        <div className="opts-grid">
          {visibleOptions.map((opt) => (
            <button
              key={opt}
              className="opt"
              disabled={isResolving}
              onClick={() => answer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {phaseId === 'parts' && (
        <div className="formula-ref">∫u dv = uv − ∫v du</div>
      )}
      {revealFirst && (
        <div className="hint-inline">
          Primeiro passo correto: {q.steps[0].correct}
        </div>
      )}
      <Feedback feedback={feedback} />

      <ItemBar
        items={[
          'potion_eliminate',
          'potion_hint',
          'shield_life',
          'scroll_mage',
          'crystal_review',
        ]}
        getStatus={itemStatus}
        onUse={useItem}
      />
      <CrystalModal entry={reviewEntry} onClose={() => setReviewEntry(null)} />
    </section>
  )
}

export function MeasureScreen({
  state,
  setState,
  onComplete,
  itemStatus,
  consumeItem,
  rpgModifiers,
  onExit,
}) {
  const phaseQuestions = useMemo(
    () =>
      selectQuestionsForRun(
        'measure',
        MEASURE_Q,
        PHASE_TARGET_QUESTIONS.measure ?? MEASURE_Q.length,
      ),
    [],
  )
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [reviewEntry, setReviewEntry] = useState(null)
  const [defeated, setDefeated] = useState(false)
  const [freeHintUsed, setFreeHintUsed] = useState(false)

  const q = phaseQuestions[idx]

  const { shieldActive, setShieldActive, consumeShield, damage } = usePhaseLife(
    {
      state,
      setState,
      phaseId: 'measure',
      setFeedback,
      onOut: () => {
        setFeedback({ msg: 'Vidas esgotadas.', type: 'err' })
        setDefeated(true)
      },
      initialShield: rpgModifiers?.hasStartShield,
    },
  )

  const pts = Array.from({ length: 28 }).map((_, i) => {
    const x = q.a + ((q.b - q.a) * i) / 27
    const top = q.topFn(x)
    const bottom = q.bottomFn(x)
    return { x, top, bottom }
  })
  const yMax = Math.max(...pts.map((p) => p.top), 1)
  const yMin = Math.min(...pts.map((p) => p.bottom), 0)
  const ySpan = Math.max(1, yMax - yMin)
  const toY = (v) => 180 - ((v - yMin) / ySpan) * 140

  const topPath = pts
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${40 + ((p.x - q.a) / (q.b - q.a)) * 280} ${toY(p.top)}`,
    )
    .join(' ')

  const bottomPath = pts
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${40 + ((p.x - q.a) / (q.b - q.a)) * 280} ${toY(p.bottom)}`,
    )
    .join(' ')

  const areaPath = `${topPath} ${pts
    .slice()
    .reverse()
    .map((p) => `L ${40 + ((p.x - q.a) / (q.b - q.a)) * 280} ${toY(p.bottom)}`)
    .join(' ')} Z`

  useEffect(() => {
    if (!q) return
    setInput('')
    setFreeHintUsed(false)
  }, [idx])

  if (defeated) {
    return (
      <PhaseDefeatScreen
        onBackMap={() => {
          setState((s) => ({ ...s, hp: 3 }))
          onExit?.()
        }}
      />
    )
  }

  const verify = () => {
    const val = Number(input.replace(',', '.'))
    const ok = Math.abs(val - q.real) <= 0.6
    if (ok) {
      setFeedback({ msg: `✓ ${q.ok} · +${q.xp} XP`, type: 'ok' })
      setState((s) => ({ ...s, xp: s.xp + q.xp }))
      const nextScore = score + 1
      setScore(nextScore)
      setTimeout(() => {
        if (idx + 1 >= phaseQuestions.length) {
          onComplete('measure', nextScore, phaseQuestions.length, state.hp)
        } else {
          const ni = idx + 1
          setIdx(ni)
          setInput('')
          setFeedback(null)
        }
      }, 1300)
    } else {
      const category = categoryLabel('MEASURE')
      addToGrimoire(
        setState,
        'MEASURE',
        `${category}: ${q.hint}`,
        `${q.topLabel} vs ${q.bottomLabel}, [${q.a}, ${q.b}]`,
      )
      if (!consumeShield()) {
        damage()
      }
      setFeedback({ msg: `✗ Incorreto. [${category}] ${q.hint}`, type: 'err' })
      setInput('')
    }
  }

  const useItem = (itemId) => {
    const freeHintAvailable =
      itemId === 'potion_hint' && rpgModifiers?.hasFreeHint && !freeHintUsed
    if (!itemStatus(itemId).can && !freeHintAvailable) return
    if (itemId === 'potion_hint') {
      if (!freeHintAvailable) consumeItem(itemId)
      if (freeHintAvailable) setFreeHintUsed(true)
      setFeedback({ msg: `${q.hint}`, type: 'hint' })
    }
    if (itemId === 'shield_life' && !shieldActive) {
      consumeItem(itemId)
      setShieldActive(true)
      setFeedback({
        msg: 'Escudo ativado para o proximo erro.',
        type: 'hint',
      })
    }
    if (itemId === 'crystal_review') {
      consumeItem(itemId)
      const list = state.grimoire
      setReviewEntry(
        list.length ? list[Math.floor(Math.random() * list.length)] : null,
      )
      if (!list.length)
        setFeedback({ msg: 'Grimório vazio no momento.', type: 'hint' })
    }
  }

  return (
    <section className="screen phase-screen">
      <div className="phase-head">
        <Tag color={G.blue}>{q.biome}</Tag>
        <HP hp={state.hp} total={3} />
        {onExit && (
          <button className="btn-back phase-exit-btn" onClick={onExit}>
            ← Voltar ao Mapa
          </button>
        )}
      </div>
      <p className="phase-subtitle">
        Calcule a area entre as curvas usando: A = ∫[f_cima(x) - f_baixo(x)]dx
      </p>
      <p className="phase-subtitle">
        No intervalo [{q.a}, {q.b}]: {q.topLabel} e {q.bottomLabel}
      </p>
      <LoreCard text={q.story} />

      <div className="integral-display">
        A = ∫{q.a}^{q.b} ({q.topLabel.replace('f_cima(x) = ', '')}) dx − ∫{q.a}^
        {q.b} ({q.bottomLabel.replace('f_baixo(x) = ', '')}) dx
      </div>

      <svg viewBox="0 0 360 220" className="graph">
        <path d={areaPath} fill="#38bdf844" />
        <path d={topPath} fill="none" stroke="#22c55e" strokeWidth="3" />
        <path d={bottomPath} fill="none" stroke="#f97316" strokeWidth="3" />
      </svg>

      <div className="measure-stage">
        <p>{q.topAntideriv}</p>
        <p>{q.bottomAntideriv}</p>
        <input
          className="num-input"
          type="number"
          placeholder="Digite a área final"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn primary" onClick={verify}>
          VERIFICAR
        </button>
      </div>

      <Feedback feedback={feedback} />

      <ItemBar
        items={['potion_hint', 'shield_life', 'crystal_review']}
        getStatus={itemStatus}
        onUse={useItem}
      />
      <CrystalModal entry={reviewEntry} onClose={() => setReviewEntry(null)} />
    </section>
  )
}

export function ConnectScreen({
  state,
  setState,
  onComplete,
  itemStatus,
  consumeItem,
  rpgModifiers,
  onExit,
}) {
  const phaseQuestions = useMemo(
    () =>
      selectQuestionsForRun(
        'connect',
        CONNECT_Q,
        PHASE_TARGET_QUESTIONS.connect ?? CONNECT_Q.length,
      ),
    [],
  )
  const [idx, setIdx] = useState(0)
  const [stage, setStage] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [eliminated, setEliminated] = useState(null)
  const [input, setInput] = useState('')
  const [reviewEntry, setReviewEntry] = useState(null)
  const [isResolving, setIsResolving] = useState(false)
  const [optionOrder, setOptionOrder] = useState([])
  const [defeated, setDefeated] = useState(false)
  const [freeHintUsed, setFreeHintUsed] = useState(false)

  const q = phaseQuestions[idx]

  const { shieldActive, setShieldActive, consumeShield, damage } = usePhaseLife(
    {
      state,
      setState,
      phaseId: 'connect',
      setFeedback,
      onOut: () => {
        setFeedback({ msg: 'Vidas esgotadas.', type: 'err' })
        setIsResolving(false)
        setDefeated(true)
      },
      initialShield: rpgModifiers?.hasStartShield,
    },
  )

  useEffect(() => {
    if (!q) return
    setOptionOrder(shuffleItems(q.options))
    setStage(0)
    setEliminated(null)
    setInput('')
    setIsResolving(false)
    setFreeHintUsed(false)
  }, [idx, q?.integral])

  if (!q) {
    return (
      <section className="screen phase-screen">
        <div className="phase-head">
          <Tag color={G.accent}>CONEXÃO</Tag>
          {onExit && (
            <button className="btn-back phase-exit-btn" onClick={onExit}>
              ← Voltar ao Mapa
            </button>
          )}
        </div>
        <p className="phase-subtitle">Questão indisponível no momento.</p>
      </section>
    )
  }

  if (defeated) {
    return (
      <PhaseDefeatScreen
        onBackMap={() => {
          setState((s) => ({ ...s, hp: 3 }))
          onExit?.()
        }}
      />
    )
  }

  const options = (optionOrder.length ? optionOrder : q.options).filter(
    (o) => o !== eliminated,
  )

  const onWrong = (hintText) => {
    const category = categoryLabel('CONNECT')
    addToGrimoire(setState, 'CONNECT', `${category}: ${hintText}`, q.integral)
    if (!consumeShield()) {
      damage()
    }
    setFeedback({ msg: `✗ Incorreto. [${category}] ${hintText}`, type: 'err' })
  }

  const submitNum = () => {
    if (isResolving) return
    setIsResolving(true)

    const v = Number(input.replace(',', '.'))
    const ok = Math.abs(v - q.realNum) <= 0.6
    if (ok) {
      setFeedback({ msg: `✓ ${q.ok} · +${q.xp} XP`, type: 'ok' })
      setState((s) => ({ ...s, xp: s.xp + q.xp }))
      const nextScore = score + 1
      setScore(nextScore)
      setTimeout(() => {
        if (idx + 1 >= phaseQuestions.length) {
          onComplete('connect', nextScore, phaseQuestions.length, state.hp)
        } else {
          setIdx((v2) => v2 + 1)
          setStage(0)
          setInput('')
          setEliminated(null)
          setFeedback(null)
          setIsResolving(false)
        }
      }, 1300)
    } else {
      onWrong(q.hint)
      setInput('')
      setTimeout(() => setIsResolving(false), 650)
    }
  }

  const useItem = (itemId) => {
    const freeHintAvailable =
      itemId === 'potion_hint' && rpgModifiers?.hasFreeHint && !freeHintUsed
    if (!itemStatus(itemId).can && !freeHintAvailable) return
    if (itemId === 'potion_hint') {
      if (!freeHintAvailable) consumeItem(itemId)
      if (freeHintAvailable) setFreeHintUsed(true)
      setFeedback({ msg: `${q.hint}`, type: 'hint' })
    }
    if (itemId === 'shield_life' && !shieldActive) {
      consumeItem(itemId)
      setShieldActive(true)
      setFeedback({ msg: 'Escudo ativado para o proximo erro.', type: 'hint' })
    }
    if (itemId === 'potion_eliminate' && stage === 0) {
      const wrong = q.options.filter((o) => o !== q.correct && o !== eliminated)
      if (wrong.length) {
        consumeItem(itemId)
        setEliminated(wrong[Math.floor(Math.random() * wrong.length)])
      }
    }
    if (itemId === 'crystal_review') {
      consumeItem(itemId)
      const list = state.grimoire
      setReviewEntry(
        list.length ? list[Math.floor(Math.random() * list.length)] : null,
      )
      if (!list.length)
        setFeedback({ msg: 'Grimório vazio no momento.', type: 'hint' })
    }
  }

  return (
    <section className="screen phase-screen">
      <div className="phase-head">
        <Tag color={G.accent}>{q.biome}</Tag>
        <HP hp={state.hp} total={3} />
        {onExit && (
          <button className="btn-back phase-exit-btn" onClick={onExit}>
            ← Voltar ao Mapa
          </button>
        )}
      </div>
      <p className="phase-subtitle">
        Encontre a antiderivada e finalize com F(b) - F(a).
      </p>
      <LoreCard text={q.story} />
      <div className="integral-display">{q.integral}</div>

      <div className="pipeline">
        <span className={stage === 0 ? 'active' : ''}>① Antiderivada</span>
        <span>→</span>
        <span className={stage === 1 ? 'active' : ''}>
          ② Substituir e subtrair
        </span>
      </div>

      {stage === 0 ? (
        <div className="opts-grid">
          {options.map((opt) => (
            <button
              key={opt}
              className="opt"
              disabled={isResolving}
              onClick={() => {
                if (isResolving) return
                if (opt === q.correct) {
                  setIsResolving(true)
                  setFeedback({ msg: '✓ Antiderivada correta.', type: 'ok' })
                  setTimeout(() => {
                    setFeedback(null)
                    setStage(1)
                    setIsResolving(false)
                  }, 600)
                } else {
                  setIsResolving(true)
                  onWrong(q.hint)
                  setTimeout(() => setIsResolving(false), 650)
                }
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="wizard-card">
          <p>
            F({q.b}) = {q.Fb} · F({q.a}) = {q.Fa}
          </p>
          <input
            className="num-input"
            type="number"
            placeholder="Digite F(b)-F(a)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="btn primary"
            disabled={isResolving}
            onClick={submitNum}
          >
            VERIFICAR
          </button>
        </div>
      )}

      <Feedback feedback={feedback} />

      <ItemBar
        items={[
          'potion_eliminate',
          'potion_hint',
          'shield_life',
          'crystal_review',
        ]}
        getStatus={itemStatus}
        onUse={useItem}
      />
      <CrystalModal entry={reviewEntry} onClose={() => setReviewEntry(null)} />
    </section>
  )
}
