import { useState } from 'react'
import { CONNECT_Q, FORGE_Q, G, INITIAL_HP, MEASURE_Q } from '../gameData'
import { addToGrimoire } from '../gameUtils'
import { CrystalModal, Feedback, HP, ItemBar, LoreCard, Tag } from './ui'
import { usePhaseLife } from './usePhaseLife'

export function ForgeScreen({
  state,
  setState,
  onComplete,
  itemStatus,
  consumeItem,
  onExit,
}) {
  const [idx, setIdx] = useState(0)
  const [slots, setSlots] = useState(['', ''])
  const [feedback, setFeedback] = useState(null)
  const [shake, setShake] = useState(false)
  const [score, setScore] = useState(0)
  const [reviewEntry, setReviewEntry] = useState(null)

  const q = FORGE_Q[idx]
  const { shieldActive, setShieldActive, consumeShield, damage } = usePhaseLife(
    {
      state,
      setState,
      phaseId: 'forge',
      setFeedback,
      onOut: () => {
        setFeedback({
          msg: 'Você perdeu todas as vidas. Reiniciando questão com dica ativa.',
          type: 'err',
        })
        setState((s) => ({ ...s, hp: INITIAL_HP.forge }))
        setSlots(['', ''])
      },
    },
  )

  const remainingPieces = q.pieces.filter((p) => !slots.includes(p))

  const verify = () => {
    const ok = slots[0] === q.answer[0] && slots[1] === q.answer[1]
    if (ok) {
      setFeedback({ msg: `✓ ${q.ok} · +${q.xp} XP`, type: 'ok' })
      setState((s) => ({ ...s, xp: s.xp + q.xp }))
      const nextScore = score + 1
      setScore(nextScore)
      setTimeout(() => {
        if (idx + 1 >= FORGE_Q.length) {
          onComplete('forge', nextScore, FORGE_Q.length, state.hp)
        } else {
          setIdx((v) => v + 1)
          setSlots(['', ''])
          setFeedback(null)
        }
      }, 1300)
      return
    }

    addToGrimoire(setState, 'FORGE', q.hint, q.display)
    if (!consumeShield()) {
      const nextHp = damage()
      if (nextHp <= 0) {
        setTimeout(() => setState((s) => ({ ...s, hp: INITIAL_HP.forge })), 900)
      }
    }
    setFeedback({ msg: `✗ Incorreto. ${q.hint}`, type: 'err' })
    setShake(true)
    setTimeout(() => {
      setShake(false)
      setSlots(['', ''])
    }, 900)
  }

  const useItem = (itemId) => {
    if (!itemStatus(itemId).can) return
    if (itemId === 'potion_hint') {
      consumeItem(itemId)
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

  const placePiece = (piece) => {
    const pos = slots.findIndex((s) => !s)
    if (pos === -1) return
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
              {idx + 1} de {FORGE_Q.length}
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
                onClick={() => placePiece(p)}
                title="Clique para adicionar à resposta"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="action-bar">
          <button className="btn primary large-btn" onClick={verify}>
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
                <strong>{reviewEntry.phaseTag}</strong>
                <p>{reviewEntry.concept}</p>
                <small>{reviewEntry.hint}</small>
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
                itmStatus.count > 0
                  ? `${itmStatus.count} disponível(is)`
                  : 'Sem itens'
              }
            >
              <span className="item-label">{labelMap[itemId]}</span>
              <span className="item-count">x{itmStatus.count}</span>
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
  onExit,
}) {
  const [qIdx, setQIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [stepMark, setStepMark] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [eliminated, setEliminated] = useState({})
  const [revealFirst, setRevealFirst] = useState(false)
  const [reviewEntry, setReviewEntry] = useState(null)

  const q = questions[qIdx]
  const curr = q.steps[step]

  const { shieldActive, setShieldActive, consumeShield, damage } = usePhaseLife(
    {
      state,
      setState,
      phaseId,
      setFeedback,
      onOut: () => {
        setFeedback({
          msg: 'Vidas esgotadas. Reiniciando com dica ativa.',
          type: 'err',
        })
        setStep(0)
        setStepMark([])
        setState((s) => ({ ...s, hp: INITIAL_HP[phaseId] }))
      },
    },
  )

  const visibleOptions = curr.options.filter(
    (o) => o !== eliminated[`${qIdx}-${step}`],
  )

  const answer = (opt) => {
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
            if (qIdx + 1 >= questions.length) {
              onComplete(phaseId, nextScore, questions.length, state.hp)
            } else {
              setQIdx((v) => v + 1)
              setStep(0)
              setStepMark([])
              setEliminated({})
              setRevealFirst(false)
              setFeedback(null)
            }
          }, 1300)
        } else {
          setStep((s) => s + 1)
        }
      }, 1000)
    } else {
      const marks = [...stepMark]
      marks[step] = 'err'
      setStepMark(marks)
      addToGrimoire(setState, phaseName, curr.explain, q.display)
      if (!consumeShield()) {
        const nextHp = damage()
        if (nextHp <= 0) {
          setTimeout(
            () => setState((s) => ({ ...s, hp: INITIAL_HP[phaseId] })),
            900,
          )
        }
      }
      setFeedback({ msg: `✗ Incorreto. ${curr.explain}`, type: 'err' })
    }
  }

  const useItem = (itemId) => {
    if (!itemStatus(itemId).can) return

    if (itemId === 'potion_hint') {
      consumeItem(itemId)
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
            <button key={opt} className="opt" onClick={() => answer(opt)}>
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
  onExit,
}) {
  const [idx, setIdx] = useState(0)
  const [stage, setStage] = useState(1)
  const [estimate, setEstimate] = useState(MEASURE_Q[0].real)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [reviewEntry, setReviewEntry] = useState(null)

  const q = MEASURE_Q[idx]
  const maxSlider = Math.max(1, Math.round(q.real * 2.5))
  const precision = Math.max(
    0,
    100 - (Math.abs(estimate - q.real) / q.real) * 100,
  )

  const { shieldActive, setShieldActive, consumeShield, damage } = usePhaseLife(
    {
      state,
      setState,
      phaseId: 'measure',
      setFeedback,
      onOut: () => {
        setFeedback({
          msg: 'Vidas esgotadas. Recomece esta questão.',
          type: 'err',
        })
        setState((s) => ({ ...s, hp: INITIAL_HP.measure }))
        setStage(1)
        setInput('')
      },
    },
  )

  const pts = Array.from({ length: 28 }).map((_, i) => {
    const x = q.a + ((q.b - q.a) * i) / 27
    const y = q.fn(x)
    return { x, y }
  })
  const yMax = Math.max(...pts.map((p) => p.y), 1)

  const path = pts
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${40 + ((p.x - q.a) / (q.b - q.a)) * 280} ${180 - (p.y / yMax) * 140}`,
    )
    .join(' ')

  const areaPath = `${path} L 320 180 L 40 180 Z`

  const verify = () => {
    const val = Number(input.replace(',', '.'))
    const ok = Math.abs(val - q.real) <= 0.6
    if (ok) {
      setFeedback({ msg: `✓ ${q.ok} · +${q.xp} XP`, type: 'ok' })
      setState((s) => ({ ...s, xp: s.xp + q.xp }))
      const nextScore = score + 1
      setScore(nextScore)
      setTimeout(() => {
        if (idx + 1 >= MEASURE_Q.length) {
          onComplete('measure', nextScore, MEASURE_Q.length, state.hp)
        } else {
          const ni = idx + 1
          setIdx(ni)
          setEstimate(MEASURE_Q[ni].real)
          setInput('')
          setStage(1)
          setFeedback(null)
        }
      }, 1300)
    } else {
      addToGrimoire(setState, 'MEASURE', q.hint, `${q.label}, [${q.a}, ${q.b}]`)
      if (!consumeShield()) {
        const nextHp = damage()
        if (nextHp <= 0) {
          setTimeout(
            () => setState((s) => ({ ...s, hp: INITIAL_HP.measure })),
            900,
          )
        }
      }
      setFeedback({ msg: `✗ Incorreto. ${q.hint}`, type: 'err' })
      setInput('')
    }
  }

  const useItem = (itemId) => {
    if (!itemStatus(itemId).can) return
    if (itemId === 'potion_hint') {
      consumeItem(itemId)
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
        Estime visualmente a area e depois confirme numericamente o resultado.
      </p>
      <LoreCard text={q.story} />

      <div className="integral-display">
        ∫{q.a}^{q.b} {q.label.replace('f(x) = ', '')} dx
      </div>

      <svg viewBox="0 0 360 220" className="graph">
        <path d={areaPath} fill="#38bdf844" />
        <path d={path} fill="none" stroke="#38bdf8" strokeWidth="3" />
      </svg>

      {stage === 1 ? (
        <div className="measure-stage">
          <label>Estimativa visual: {estimate.toFixed(2)}</label>
          <input
            type="range"
            min={0}
            max={maxSlider}
            step="0.1"
            value={estimate}
            onChange={(e) => setEstimate(Number(e.target.value))}
          />
          <div className="precision">
            <div
              className="precision-fill"
              style={{ width: `${precision}%` }}
            />
          </div>
          <button className="btn" onClick={() => setStage(2)}>
            CONFIRMAR
          </button>
        </div>
      ) : (
        <div className="measure-stage">
          <p>{q.antideriv}</p>
          <input
            className="num-input"
            type="number"
            placeholder="Digite F(b)-F(a)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn primary" onClick={verify}>
            VERIFICAR
          </button>
        </div>
      )}

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
  onExit,
}) {
  const [idx, setIdx] = useState(0)
  const [stage, setStage] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [eliminated, setEliminated] = useState(null)
  const [input, setInput] = useState('')
  const [reviewEntry, setReviewEntry] = useState(null)

  const q = CONNECT_Q[idx]

  const { shieldActive, setShieldActive, consumeShield, damage } = usePhaseLife(
    {
      state,
      setState,
      phaseId: 'connect',
      setFeedback,
      onOut: () => {
        setFeedback({
          msg: 'Vidas esgotadas. Reiniciando esta questão.',
          type: 'err',
        })
        setState((s) => ({ ...s, hp: INITIAL_HP.connect }))
        setStage(0)
        setInput('')
        setEliminated(null)
      },
    },
  )

  const options = q.options.filter((o) => o !== eliminated)

  const onWrong = (hintText) => {
    addToGrimoire(setState, 'CONNECT', hintText, q.integral)
    if (!consumeShield()) {
      const nextHp = damage()
      if (nextHp <= 0) {
        setTimeout(
          () => setState((s) => ({ ...s, hp: INITIAL_HP.connect })),
          900,
        )
      }
    }
    setFeedback({ msg: `✗ Incorreto. ${hintText}`, type: 'err' })
  }

  const submitNum = () => {
    const v = Number(input.replace(',', '.'))
    const ok = Math.abs(v - q.realNum) <= 0.6
    if (ok) {
      setFeedback({ msg: `✓ ${q.ok} · +${q.xp} XP`, type: 'ok' })
      setState((s) => ({ ...s, xp: s.xp + q.xp }))
      const nextScore = score + 1
      setScore(nextScore)
      setTimeout(() => {
        if (idx + 1 >= CONNECT_Q.length) {
          onComplete('connect', nextScore, CONNECT_Q.length, state.hp)
        } else {
          setIdx((v2) => v2 + 1)
          setStage(0)
          setInput('')
          setEliminated(null)
          setFeedback(null)
        }
      }, 1300)
    } else {
      onWrong(q.hint)
      setInput('')
    }
  }

  const useItem = (itemId) => {
    if (!itemStatus(itemId).can) return
    if (itemId === 'potion_hint') {
      consumeItem(itemId)
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
              onClick={() => {
                if (opt === q.correct) {
                  setFeedback({ msg: '✓ Antiderivada correta.', type: 'ok' })
                  setTimeout(() => {
                    setFeedback(null)
                    setStage(1)
                  }, 600)
                } else {
                  onWrong(q.hint)
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
          <button className="btn primary" onClick={submitNum}>
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
