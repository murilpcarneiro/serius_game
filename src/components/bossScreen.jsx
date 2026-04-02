import { useEffect, useRef, useState } from 'react'
import { G, SHOP_ITEMS } from '../gameData'
import { addToGrimoire, calcStars } from '../gameUtils'
import { Feedback, HP, ItemBar, LoreCard, Tag, Timer } from './ui'

const shuffleItems = (items) => {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function InlineBossShop({ state, setState, secondsLeft }) {
  const list = SHOP_ITEMS.filter((i) => i.id !== 'elixir_supreme')

  const buy = (item) => {
    const qty = state.inventory[item.id] ?? 0
    const money = item.currency === 'xp' ? state.xp : state.gold
    if (money < item.cost || qty >= item.maxStack) return
    setState((s) => ({
      ...s,
      [item.currency]: s[item.currency] - item.cost,
      inventory: { ...s.inventory, [item.id]: qty + 1 },
    }))
  }

  return (
    <div className="inline-shop">
      <h3>Loja Rápida ({secondsLeft}s)</h3>
      <div className="shop-grid compact">
        {list.map((item) => {
          const qty = state.inventory[item.id] ?? 0
          const money = item.currency === 'xp' ? state.xp : state.gold
          return (
            <article key={item.id} className="shop-card">
              <strong>
                {item.icon} {item.name}
              </strong>
              <small className="muted">
                {item.cost} {item.currency}
              </small>
              <button
                className="btn"
                disabled={money < item.cost || qty >= item.maxStack}
                onClick={() => buy(item)}
              >
                COMPRAR
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export function BossScreen({
  boss,
  state,
  setState,
  onFinish,
  itemStatusBase,
  consumeItem,
  onExit,
}) {
  const [mode, setMode] = useState('brief')
  const [showShop, setShowShop] = useState(false)
  const [shopSeconds, setShopSeconds] = useState(30)
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(boss.timePerQuestion)
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [shieldActive, setShieldActive] = useState(false)
  const [extraLife, setExtraLife] = useState(false)
  const [supremeOverride, setSupremeOverride] = useState(false)

  const [forgeSlots, setForgeSlots] = useState(['', ''])
  const [wizStep, setWizStep] = useState(0)
  const [wizElim, setWizElim] = useState(null)
  const [wizReveal, setWizReveal] = useState(false)
  const [connStage, setConnStage] = useState(0)
  const [connElim, setConnElim] = useState(null)
  const [connInput, setConnInput] = useState('')
  const [forgeOrder, setForgeOrder] = useState([])
  const [wizOrder, setWizOrder] = useState([])
  const [connOrder, setConnOrder] = useState([])
  const [isResolving, setIsResolving] = useState(false)

  const reviewBuffer = useRef([])
  const q = boss.questions[qIndex]

  useEffect(() => {
    if (!showShop) return undefined
    const t = setInterval(() => setShopSeconds((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [showShop])

  useEffect(() => {
    if (shopSeconds <= 0) setShowShop(false)
  }, [shopSeconds])

  useEffect(() => {
    if (mode !== 'fight') return undefined
    const timer = setInterval(() => {
      setTimeLeft((s) => s - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [mode, qIndex])

  useEffect(() => {
    if (timeLeft > 0 || mode !== 'fight') return
    lose('Tempo esgotado.')
  }, [timeLeft, mode])

  useEffect(() => {
    setTimeLeft(boss.timePerQuestion)
    setForgeSlots(['', ''])
    setWizStep(0)
    setWizElim(null)
    setWizReveal(false)
    setConnStage(0)
    setConnElim(null)
    setConnInput('')
    setIsResolving(false)
  }, [qIndex, boss.timePerQuestion])

  useEffect(() => {
    if (!q) return
    if (q.kind === 'forge') setForgeOrder(shuffleItems(q.pieces))
    if (q.kind === 'wizard') setWizOrder(shuffleItems(q.steps[0].options))
    if (q.kind === 'connect') setConnOrder(shuffleItems(q.options))
  }, [qIndex])

  const effectiveBossLock =
    boss.blockedItems.includes('ALL') && !supremeOverride ? 'ALL' : boss.id

  const itemStatus = (itemId) => {
    if (itemId === 'elixir_supreme' && boss.id === 'boss_final') {
      return {
        can: (state.inventory[itemId] ?? 0) > 0 && !supremeOverride,
        qty: state.inventory[itemId] ?? 0,
      }
    }
    if (itemId === 'elixir_supreme' && boss.id !== 'boss_final') {
      return { can: false, qty: state.inventory[itemId] ?? 0 }
    }
    return itemStatusBase(itemId, effectiveBossLock)
  }

  const lose = (msg) => {
    if (extraLife) {
      setExtraLife(false)
      setState((s) => ({ ...s, hp: 1 }))
      setFeedback({
        msg: `${msg} O Amuleto de Retorno concedeu nova chance!`,
        type: 'hint',
      })
      return
    }
    setMode('defeat')
    setFeedback({ msg: `DERROTA: ${msg}`, type: 'err' })
  }

  const damage = (hint, integralLabel) => {
    addToGrimoire(setState, 'BOSS', hint, integralLabel)
    reviewBuffer.current.push({
      fase: 'BOSS',
      conceito: hint,
      integral: integralLabel,
      timestamp: Date.now(),
    })

    if (shieldActive) {
      setShieldActive(false)
      setFeedback({ msg: 'Escudo absorveu o erro desta vez.', type: 'hint' })
      return
    }

    setState((s) => ({ ...s, hp: 0 }))
    lose('Um erro foi fatal neste confronto.')
  }

  const nextQuestionOrWin = () => {
    if (qIndex + 1 >= boss.questions.length) {
      setMode('victory')
      return
    }
    setQIndex((v) => v + 1)
  }

  const useItem = (id) => {
    if (!itemStatus(id).can) return

    if (id === 'shield_life' && !shieldActive) {
      consumeItem(id)
      setShieldActive(true)
      setFeedback({ msg: 'Escudo ativado.', type: 'hint' })
    }
    if (id === 'hourglass') {
      consumeItem(id)
      setTimeLeft((t) => t + 30)
      setFeedback({ msg: '+30 segundos adicionados.', type: 'hint' })
    }
    if (id === 'amulet_return' && !extraLife) {
      consumeItem(id)
      setExtraLife(true)
      setFeedback({
        msg: 'Segunda tentativa no boss ativada.',
        type: 'hint',
      })
    }
    if (id === 'potion_hint') {
      consumeItem(id)
      setFeedback({
        msg: `${q.hint || 'Observe a estrutura da integral e os termos internos.'}`,
        type: 'hint',
      })
    }
    if (id === 'potion_eliminate') {
      if (q.kind === 'wizard') {
        const curr = q.steps[wizStep]
        const wrong = curr.options.filter(
          (o) => o !== curr.correct && o !== wizElim,
        )
        if (wrong.length) {
          consumeItem(id)
          setWizElim(wrong[Math.floor(Math.random() * wrong.length)])
        }
      }
      if (q.kind === 'connect' && connStage === 0) {
        const wrong = q.options.filter((o) => o !== q.correct && o !== connElim)
        if (wrong.length) {
          consumeItem(id)
          setConnElim(wrong[Math.floor(Math.random() * wrong.length)])
        }
      }
    }
    if (id === 'scroll_mage' && q.kind === 'wizard' && !wizReveal) {
      consumeItem(id)
      setWizReveal(true)
      setFeedback({
        msg: `Primeiro passo: ${q.steps[0].correct}`,
        type: 'hint',
      })
    }
    if (id === 'crystal_review') {
      consumeItem(id)
      const e = state.grimoire.length
        ? state.grimoire[Math.floor(Math.random() * state.grimoire.length)]
        : null
      if (e)
        setFeedback({
          msg: `Revisao: ${e.integral} — ${e.conceito}`,
          type: 'hint',
        })
      else setFeedback({ msg: 'Grimório ainda vazio.', type: 'hint' })
    }
    if (
      id === 'elixir_supreme' &&
      boss.id === 'boss_final' &&
      !supremeOverride
    ) {
      consumeItem(id)
      setSupremeOverride(true)
      setFeedback({
        msg: 'Elixir Supremo: dicas liberadas no Boss Final!',
        type: 'hint',
      })
    }
  }

  const renderQuestion = () => {
    if (q.kind === 'forge') {
      const pieces = (forgeOrder.length ? forgeOrder : q.pieces).filter(
        (p) => !forgeSlots.includes(p),
      )
      return (
        <div>
          <LoreCard text={q.story} />
          <div className="integral-display">{q.display}</div>
          <div className="forge-slots">
            <span>F(x)=</span>
            {forgeSlots.map((slot, i) => (
              <button
                key={i}
                className="slot"
                onClick={() =>
                  slot &&
                  setForgeSlots((s) => s.map((v, j) => (j === i ? '' : v)))
                }
              >
                {slot || '[   ]'}
              </button>
            ))}
          </div>
          <div className="pieces-row">
            {pieces.map((p) => (
              <button
                key={p}
                className="piece"
                onClick={() => {
                  const pos = forgeSlots.findIndex((s) => !s)
                  if (pos === -1) return
                  const next = [...forgeSlots]
                  next[pos] = p
                  setForgeSlots(next)
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="btn primary"
            disabled={isResolving}
            onClick={() => {
              if (isResolving) return
              setIsResolving(true)
              if (
                forgeSlots[0] === q.answer[0] &&
                forgeSlots[1] === q.answer[1]
              ) {
                setFeedback({ msg: 'Correto.', type: 'ok' })
                setScore((s) => s + 1)
                setTimeout(nextQuestionOrWin, 700)
              } else {
                damage(q.hint, q.display)
                setForgeSlots(['', ''])
                setTimeout(() => setIsResolving(false), 750)
              }
            }}
          >
            VERIFICAR
          </button>
        </div>
      )
    }

    if (q.kind === 'wizard') {
      const curr = q.steps[wizStep]
      const opts = (wizOrder.length ? wizOrder : curr.options).filter(
        (o) => o !== wizElim,
      )
      return (
        <div>
          <LoreCard text={q.story} />
          <div className="integral-display">{q.display}</div>
          <div className="progress-row">
            {q.steps.map((_, i) => (
              <span
                key={i}
                className={`step-dot ${i === wizStep ? 'current' : ''}`}
              >
                {i + 1}
              </span>
            ))}
          </div>
          {wizReveal && (
            <div className="hint-inline">Passo 1: {q.steps[0].correct}</div>
          )}
          <div className="wizard-card">
            <h3>{curr.prompt}</h3>
            <div className="opts-grid">
              {opts.map((o) => (
                <button
                  key={o}
                  className="opt"
                  disabled={isResolving}
                  onClick={() => {
                    if (isResolving) return
                    setIsResolving(true)
                    if (o === curr.correct) {
                      setFeedback({ msg: 'Correto.', type: 'ok' })
                      if (wizStep + 1 >= q.steps.length) {
                        setScore((s) => s + 1)
                        setTimeout(nextQuestionOrWin, 700)
                      } else {
                        setTimeout(() => {
                          setWizStep((v) => v + 1)
                          setWizElim(null)
                          setIsResolving(false)
                        }, 500)
                      }
                    } else {
                      damage(curr.explain, q.display)
                      setTimeout(() => setIsResolving(false), 750)
                    }
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (q.kind === 'connect') {
      const opts = (connOrder.length ? connOrder : q.options).filter(
        (o) => o !== connElim,
      )
      return (
        <div>
          <LoreCard text={q.story} />
          <div className="integral-display">{q.integral}</div>
          <div className="pipeline">
            <span className={connStage === 0 ? 'active' : ''}>
              ① Antiderivada
            </span>
            <span>&gt;</span>
            <span className={connStage === 1 ? 'active' : ''}>② F(b)-F(a)</span>
          </div>

          {connStage === 0 ? (
            <div className="opts-grid">
              {opts.map((o) => (
                <button
                  key={o}
                  className="opt"
                  disabled={isResolving}
                  onClick={() => {
                    if (isResolving) return
                    if (o === q.correct) {
                      setIsResolving(true)
                      setConnStage(1)
                      setFeedback({
                        msg: 'Antiderivada correta.',
                        type: 'ok',
                      })
                      setTimeout(() => setIsResolving(false), 500)
                    } else {
                      setIsResolving(true)
                      damage(q.hint, q.integral)
                      setTimeout(() => setIsResolving(false), 750)
                    }
                  }}
                >
                  {o}
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
                value={connInput}
                onChange={(e) => setConnInput(e.target.value)}
                placeholder="Digite F(b)-F(a)"
              />
              <button
                className="btn primary"
                disabled={isResolving}
                onClick={() => {
                  if (isResolving) return
                  setIsResolving(true)
                  const n = Number(connInput.replace(',', '.'))
                  if (Math.abs(n - q.realNum) <= 0.6) {
                    setFeedback({ msg: 'Correto.', type: 'ok' })
                    setScore((s) => s + 1)
                    setTimeout(nextQuestionOrWin, 700)
                  } else {
                    damage(q.hint, q.integral)
                    setTimeout(() => setIsResolving(false), 750)
                  }
                }}
              >
                VERIFICAR
              </button>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  if (mode === 'brief') {
    return (
      <section className="screen">
        <h2 className="title">{boss.name}</h2>
        <LoreCard text={boss.story} />
        <div className="rules-box">
          <p>Vida: 1</p>
          <p>Tempo por questao: {boss.timePerQuestion}s</p>
          <p>Itens bloqueados: {boss.blockedItems.join(', ')}</p>
        </div>

        <div className="row gap">
          {onExit && (
            <button className="btn-back" onClick={onExit}>
              ← Voltar ao Mapa
            </button>
          )}
          <button
            className="btn"
            onClick={() => {
              setShowShop(true)
              setShopSeconds(30)
            }}
          >
            ABRIR LOJA
          </button>
          <button
            className="btn primary"
            onClick={() => {
              setState((s) => ({ ...s, hp: 1 }))
              setMode('fight')
            }}
          >
            ENTRAR NA LUTA
          </button>
        </div>

        {showShop && (
          <InlineBossShop
            state={state}
            setState={setState}
            secondsLeft={shopSeconds}
          />
        )}
      </section>
    )
  }

  if (mode === 'defeat') {
    return (
      <section className="screen boss-end lose">
        <h2>DERROTA</h2>
        <p className="muted">Conceitos críticos:</p>
        <div className="grim-list">
          {reviewBuffer.current.slice(-4).map((e, i) => (
            <div
              key={i}
              className="grim-card"
              style={{ borderLeftColor: G.red }}
            >
              <p>{e.integral}</p>
              <p className="muted">{e.conceito}</p>
            </div>
          ))}
        </div>
        <button
          className="btn primary"
          onClick={() => onFinish(false, 0, boss.questions.length, 0, boss)}
        >
          VOLTAR AO MAPA
        </button>
      </section>
    )
  }

  if (mode === 'victory') {
    const stars = calcStars(state.hp, 1, score, boss.questions.length)
    return (
      <section className="screen boss-end win">
        <h2>VITÓRIA</h2>
        <div className="stars-row">
          {[1, 2, 3].map((v, i) => (
            <span
              key={v}
              className={`star ${stars >= v ? 'on' : 'off'}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              ★
            </span>
          ))}
        </div>
        <p>
          Recompensas: +{boss.rewardXp} XP · +{boss.rewardGold} Ouro
        </p>
        <button
          className="btn primary"
          onClick={() =>
            onFinish(true, score, boss.questions.length, state.hp, boss)
          }
        >
          CONTINUAR
        </button>
      </section>
    )
  }

  return (
    <section className="screen boss-screen">
      <div className="phase-head">
        <Tag color={G.red}>{boss.biome}</Tag>
        <Timer seconds={timeLeft} />
        {onExit && (
          <button className="btn-back phase-exit-btn" onClick={onExit}>
            ← Voltar ao Mapa
          </button>
        )}
      </div>
      <div className="phase-head">
        <HP hp={state.hp} total={1} />
        <p className="muted">
          Questão {qIndex + 1}/{boss.questions.length}
        </p>
      </div>

      {renderQuestion()}
      <Feedback feedback={feedback} />

      <ItemBar
        items={[
          'potion_eliminate',
          'potion_hint',
          'shield_life',
          'hourglass',
          'scroll_mage',
          'crystal_review',
          'amulet_return',
          'elixir_supreme',
        ]}
        getStatus={itemStatus}
        onUse={useItem}
      />
    </section>
  )
}
