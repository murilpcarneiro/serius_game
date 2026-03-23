import { useState } from 'react'
import imgAmpulheta from '../assets/shop-items/Ampulheta.webp'
import imgAmuletoRetorno from '../assets/shop-items/Amuleto_do_Retorno.webp'
import imgCristalRevisao from '../assets/shop-items/Cristal_de_Revisao.webp'
import imgElixirSupremo from '../assets/shop-items/Elixir_Supremo.webp'
import imgEscudoVida from '../assets/shop-items/Escudo_de_Vida.webp'
import imgPergaminhoMago from '../assets/shop-items/Pergaminho_do_mago.webp'
import imgPocaoDica from '../assets/shop-items/Pocao_de_Dica.webp'
import imgPocaoEliminar from '../assets/shop-items/Pocao_de_Eliminar.webp'
import { G, SHOP_ITEMS } from '../gameData'
import { phaseColor } from '../gameUtils'
import { Tag } from './ui'

const SHOP_ITEM_IMAGES = {
  potion_eliminate: imgPocaoEliminar,
  potion_hint: imgPocaoDica,
  shield_life: imgEscudoVida,
  hourglass: imgAmpulheta,
  scroll_mage: imgPergaminhoMago,
  crystal_review: imgCristalRevisao,
  amulet_return: imgAmuletoRetorno,
  elixir_supreme: imgElixirSupremo,
}

export function ShopScreen({ state, setState, inPhase, onBack }) {
  const [tab, setTab] = useState('shop')
  const [query, setQuery] = useState('')
  const [currencyFilter, setCurrencyFilter] = useState('all')
  const [onlyAffordable, setOnlyAffordable] = useState(false)

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

  const filteredShopItems = SHOP_ITEMS.filter((item) => {
    const text =
      `${item.name} ${item.description} ${item.pedagogicNote}`.toLowerCase()
    const passesQuery = text.includes(query.toLowerCase())
    const passesCurrency =
      currencyFilter === 'all' || item.currency === currencyFilter
    const qty = state.inventory[item.id] ?? 0
    const money = item.currency === 'xp' ? state.xp : state.gold
    const affordable = money >= item.cost && qty < item.maxStack
    const passesAfford = onlyAffordable ? affordable : true
    return passesQuery && passesCurrency && passesAfford
  })

  return (
    <section className="screen">
      <div className="shop-top">
        <div className="back-header">
          {onBack && (
            <button className="btn-back" onClick={onBack} title="Voltar">
              ← Voltar
            </button>
          )}
          <h2 className="title">Loja Arcana</h2>
        </div>
        <div className="top-stats">
          <span>XP {state.xp}</span>
          <span>OU {state.gold}</span>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === 'shop' ? 'active' : ''}`}
          onClick={() => setTab('shop')}
        >
          Loja
        </button>
        <button
          className={`tab ${tab === 'inv' ? 'active' : ''}`}
          onClick={() => setTab('inv')}
        >
          Inventário
        </button>
      </div>

      {tab === 'shop' ? (
        <>
          <div className="shop-tools">
            <input
              className="num-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar item..."
            />
            <div className="tool-row">
              <button
                className={`tab ${currencyFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCurrencyFilter('all')}
              >
                Todas
              </button>
              <button
                className={`tab ${currencyFilter === 'xp' ? 'active' : ''}`}
                onClick={() => setCurrencyFilter('xp')}
              >
                XP
              </button>
              <button
                className={`tab ${currencyFilter === 'gold' ? 'active' : ''}`}
                onClick={() => setCurrencyFilter('gold')}
              >
                Ouro
              </button>
              <button
                className={`tab ${onlyAffordable ? 'active' : ''}`}
                onClick={() => setOnlyAffordable((v) => !v)}
              >
                Compráveis
              </button>
            </div>
          </div>

          <div className="shop-grid">
            {filteredShopItems.map((item) => {
              const qty = state.inventory[item.id] ?? 0
              const money = item.currency === 'xp' ? state.xp : state.gold
              const blocked = qty >= item.maxStack || money < item.cost
              return (
                <article key={item.id} className="shop-card">
                  <div className="shop-item-image-wrap">
                    <img
                      src={SHOP_ITEM_IMAGES[item.id]}
                      alt={item.name}
                      className="shop-item-image"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling
                        if (fallback) fallback.style.display = 'grid'
                      }}
                    />
                    <div className="shop-item-image-fallback">{item.icon}</div>
                  </div>

                  <div className="shop-card-top">
                    <div>
                      <strong>{item.name}</strong>
                      <div>
                        <Tag color={item.currency === 'xp' ? G.gold : G.accent}>
                          {item.currency.toUpperCase()}
                        </Tag>
                      </div>
                    </div>
                  </div>
                  <p className="muted">{item.description}</p>
                  <small className="muted">{item.pedagogicNote}</small>
                  <div className="shop-buy-row">
                    <span>
                      {item.cost} {item.currency === 'xp' ? 'XP' : 'OU'}
                    </span>
                    <button
                      className="btn"
                      disabled={blocked}
                      onClick={() => buy(item)}
                    >
                      COMPRAR
                    </button>
                  </div>
                  <small className="muted">
                    Qtd: {qty}/{item.maxStack}
                  </small>
                </article>
              )
            })}
          </div>
          {!filteredShopItems.length && (
            <p className="muted">Nenhum item encontrado com esses filtros.</p>
          )}
        </>
      ) : (
        <div className="inv-list">
          {SHOP_ITEMS.filter((i) => (state.inventory[i.id] ?? 0) > 0).map(
            (item) => (
              <div key={item.id} className="inv-item">
                <span>
                  {item.name} x{state.inventory[item.id]}
                </span>
                <button className="btn" disabled>
                  USAR
                </button>
              </div>
            ),
          )}
          {!SHOP_ITEMS.some((i) => (state.inventory[i.id] ?? 0) > 0) && (
            <p className="muted">Inventário vazio.</p>
          )}
          {!inPhase && (
            <p className="muted">Itens são usados dentro das fases.</p>
          )}
        </div>
      )}
    </section>
  )
}

export function GrimorioScreen({ entries, onBack }) {
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp)
  return (
    <section className="screen">
      <div className="back-header">
        {onBack && (
          <button className="btn-back" onClick={onBack} title="Voltar">
            ← Voltar
          </button>
        )}
        <h2 className="title">GRIMORIO ({entries.length})</h2>
      </div>
      {!entries.length && (
        <p className="muted">
          Nenhum erro registrado ainda — continue jogando!
        </p>
      )}
      <div className="grim-list">
        {sorted.map((e, i) => (
          <article
            key={`${e.timestamp}-${i}`}
            className="grim-card"
            style={{ borderLeftColor: phaseColor(e.fase) }}
          >
            <Tag color={phaseColor(e.fase)}>{e.fase}</Tag>
            <p className="grim-int">{e.integral}</p>
            <p className="muted">{e.conceito}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function TutorialScreen({ state, onBack }) {
  const doneCount = state.done.length
  const stars = Object.values(state.stars).reduce((sum, v) => sum + v, 0)

  return (
    <section className="screen tutorial-screen">
      <div className="back-header">
        {onBack && (
          <button className="btn-back" onClick={onBack} title="Voltar">
            ← Voltar
          </button>
        )}
        <h2 className="title">Tutorial da Campanha</h2>
      </div>
      <p className="muted">
        Este guia explica as mecanicas centrais e o fluxo completo da campanha,
        do primeiro bioma ate o boss final.
      </p>

      <div className="assessment-grid">
        <article className="assessment-card">
          <h3>1) Objetivo da Campanha</h3>
          <strong>Concluir o Mapa</strong>
          <p className="muted">
            Termine as fases na ordem de desbloqueio, derrote os bosses e
            finalize O Integral Supremo.
          </p>
        </article>

        <article className="assessment-card">
          <h3>2) Economia e Progresso</h3>
          <strong>XP, Ouro e Estrelas</strong>
          <p className="muted">
            XP e Ouro sao ganhos por desempenho. Estrelas definem desbloqueios
            de bosses e medem consistencia.
          </p>
        </article>

        <article className="assessment-card">
          <h3>3) Estado Atual</h3>
          <strong>
            {doneCount} fases | {stars} estrelas
          </strong>
          <p className="muted">
            Use estes numeros para decidir se vale farmar mais recursos ou
            avancar para desafios maiores.
          </p>
        </article>
      </div>

      <div className="assessment-panel">
        <h3>Fluxo da Partida</h3>
        <div className="grim-list">
          <article className="grim-card" style={{ borderLeftColor: '#8f6630' }}>
            <p>
              1. Inicio: abra o Mapa e selecione uma fase desbloqueada (FORGE,
              U-SUB, MEASURE, PARTES ou TFC).
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#8f6630' }}>
            <p>
              2. Execucao: resolva as questoes da fase para acumular score,
              manter vida e ganhar recompensas no fim.
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#8f6630' }}>
            <p>
              3. Resultado: ao concluir, voce recebe estrelas (1 a 3), XP e
              Ouro. Melhor desempenho gera mais recursos.
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#8f6630' }}>
            <p>
              4. Preparacao: use a Loja para comprar consumiveis antes de fases
              dificeis e bosses.
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#8f6630' }}>
            <p>
              5. Progressao: atinja os requisitos de estrelas para liberar
              bosses, avance no mapa e finalize a campanha.
            </p>
          </article>
        </div>
      </div>

      <div className="assessment-panel">
        <h3>Mecanicas de Cada Tipo de Fase</h3>
        <div className="grim-list">
          <article className="grim-card" style={{ borderLeftColor: '#7a572a' }}>
            <p>
              FORGE: monte a antiderivada com pecas. Erro custa vida e acerto
              aumenta o score da fase.
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#7a572a' }}>
            <p>
              U-SUB e PARTES: fases em passos guiados (wizard). Cada etapa
              correta avanca o processo de resolucao.
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#7a572a' }}>
            <p>
              MEASURE e TFC: combinam intuicao grafica e verificacao numerica. A
              precisao final influencia seu desempenho.
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#7a572a' }}>
            <p>
              BOSSES: punicao alta por erro. Gerencie vida, tempo e itens para
              sobreviver ate a ultima questao.
            </p>
          </article>
        </div>
      </div>

      <div className="assessment-panel">
        <h3>Itens e Decisao Tatica</h3>
        <div className="grim-list">
          <article className="grim-card" style={{ borderLeftColor: '#7a572a' }}>
            <p>
              Escudo de Vida: ignora um erro. Ideal para boss ou questao final.
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#7a572a' }}>
            <p>
              Pocao de Dica: mostra orientacao conceitual sem revelar resposta.
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#7a572a' }}>
            <p>
              Pocao de Eliminar: reduz alternativas erradas em questoes
              objetivas.
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#7a572a' }}>
            <p>Pergaminho do Mago: revela o primeiro passo em fases wizard.</p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#7a572a' }}>
            <p>
              Ampulheta: adiciona tempo em bosses. Use quando o cronometro
              apertar.
            </p>
          </article>
          <article className="grim-card" style={{ borderLeftColor: '#7a572a' }}>
            <p>
              Cristal de Revisao: puxa uma revisao do Grimorio para reforcar
              conceitos.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
