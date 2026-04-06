import { useEffect, useMemo, useState } from 'react'
import {
  G,
  MAP_EDGES,
  MAP_NODES,
  NPC_REPUTATION,
  RPG_CLASSES,
} from '../gameData'
import { MAP_NODE_ICON_BY_ID } from '../constants/mapConstants'
import { isUnlocked } from '../gameUtils'
import {
  buildSessionChecklist,
  getCampaignBeat,
  sortQuestsByStatus,
} from '../utils/homeUtils'
import { createEdgePath, getUnlockHint } from '../utils/mapUtils'
import { HomeOverviewPanels, HomeRpgPanel } from './homePanels'
import { RpgSidebar } from './rpgSidebar'
import { Tag } from './ui'

export function HomeScreen({
  state,
  onStart,
  onOpenMap,
  onOpenShop,
  onOpenGrimoire,
  onResetCampaign,
  lastSavedAt,
  availableTalentPoints,
  quests,
  onChooseClass,
  onSpendTalent,
  onClaimQuest,
}) {
  const completed = state.done.length
  const totalStars = Object.values(state.stars).reduce((sum, s) => sum + s, 0)
  const progressPct = Math.min(100, (completed / MAP_NODES.length) * 100)
  const playerLevel = Math.floor(state.xp / 100) + 1
  const isFirstRun = completed === 0 && state.xp === 0 && state.gold === 0
  const nextPhase =
    MAP_NODES.find(
      (node) =>
        isUnlocked(node.id, state.done, state.stars) &&
        !state.done.includes(node.id),
    ) ?? null
  const saveLabel = lastSavedAt
    ? new Date(lastSavedAt).toLocaleString('pt-BR')
    : 'Ainda não salvo'
  const currentClass = RPG_CLASSES.find(
    (entry) => entry.id === state.playerClass,
  )
  const [rpgTab, setRpgTab] = useState('profile')
  const questsDone = (quests ?? []).filter((quest) => quest.done).length
  const questsClaimable = (quests ?? []).filter(
    (quest) => quest.done && !quest.claimed,
  ).length
  const repValues = NPC_REPUTATION.map((npc) => state.reputation?.[npc.id] ?? 0)
  const repAvg = repValues.length
    ? (
        repValues.reduce((sum, value) => sum + value, 0) / repValues.length
      ).toFixed(1)
    : '0.0'
  const equippedRunes = [state.loadout?.slot1, state.loadout?.slot2].filter(
    Boolean,
  )
  const sortedQuests = sortQuestsByStatus(quests ?? [])
  const beat = getCampaignBeat(state, completed)
  const journeyPreview = MAP_NODES.slice(0, 6)
  const isNewPlayer =
    completed === 0 && state.xp === 0 && state.gold === 0 && !state.playerClass
  const sessionChecklist = buildSessionChecklist(state)

  return (
    <section className="screen home-screen">
      <div className="home-hero">
        <p className="hero-kicker">Campanha de Calculo Integral</p>
        <h1 className="glow-text">∫NTEGRA</h1>
        <p className="hero-sub">
          Restaure a Coroa Arcana dominando tecnicas de integracao, protegendo
          selos e derrotando o Integral Supremo no Santuario final.
        </p>

        <div className="player-level-display">
          <div className="level-badge">
            <span className="level-num">{playerLevel}</span>
            <p>NÍVEL</p>
          </div>
          <div className="xp-segment">
            <p className="segment-label">Experiência até próx. nível</p>
            <div className="xp-progress">
              <div
                className="xp-progress-fill"
                style={{ width: `${((state.xp % 100) / 100) * 100}%` }}
              />
            </div>
            <p className="xp-numbers">{state.xp % 100}/100 XP</p>
          </div>
        </div>

        <div className="hero-actions">
          <button className="btn primary glow-btn" onClick={onStart}>
            {isFirstRun ? 'INICIAR JORNADA' : 'CONTINUAR CAMPANHA'}
          </button>
          <button className="btn secondary-btn" onClick={onOpenMap}>
            ABRIR MAPA
          </button>
        </div>
      </div>

      <div className={`home-panels rpg-tab-${rpgTab}`}>
        <HomeOverviewPanels
          state={state}
          completed={completed}
          totalStars={totalStars}
          progressPct={progressPct}
          beat={beat}
          journeyPreview={journeyPreview}
          nextPhase={nextPhase}
          saveLabel={saveLabel}
          currentClass={currentClass}
          questsDone={questsDone}
          questsLength={(quests ?? []).length}
          availableTalentPoints={availableTalentPoints}
          questsClaimable={questsClaimable}
          onOpenShop={onOpenShop}
          onOpenGrimoire={onOpenGrimoire}
          onResetCampaign={onResetCampaign}
          sessionChecklist={sessionChecklist}
          isNewPlayer={isNewPlayer}
        />

        <HomeRpgPanel
          state={state}
          rpgTab={rpgTab}
          setRpgTab={setRpgTab}
          currentClass={currentClass}
          repAvg={repAvg}
          equippedRunes={equippedRunes}
          questsDone={questsDone}
          questsLength={(quests ?? []).length}
          availableTalentPoints={availableTalentPoints}
          sortedQuests={sortedQuests}
          onChooseClass={onChooseClass}
          onSpendTalent={onSpendTalent}
          onClaimQuest={onClaimQuest}
        />
      </div>
    </section>
  )
}

export function MapScreen({ state, onOpen }) {
  const [showCelebration, setShowCelebration] = useState(false)
  const unlockedNodes = MAP_NODES.filter((n) =>
    isUnlocked(n.id, state.done, state.stars),
  )
  const playableNodes = unlockedNodes.filter((n) => !state.done.includes(n.id))
  const nextObjective = playableNodes[0] ?? null
  const totalStars = Object.values(state.stars).reduce(
    (sum, value) => sum + value,
    0,
  )

  // Criar mapa de lookup para nodes por ID
  const nodeMap = useMemo(() => {
    const map = new Map()
    MAP_NODES.forEach((node) => map.set(node.id, node))
    return map
  }, [])

  useEffect(() => {
    if (nextObjective) {
      setShowCelebration(false)
      return undefined
    }

    const timer = setTimeout(() => setShowCelebration(true), 220)
    return () => clearTimeout(timer)
  }, [nextObjective])

  return (
    <section className="screen map-screen rpg-layout">
      <div className="map-content-wrapper">
        <RpgSidebar state={state} active="map" onNavigate={onOpen} />

        {/* CONTEÚDO PRINCIPAL */}
        <div className="map-main">
          <div className="map-header">
            <div className="map-title-box">
              <h2 className="map-title">MAPA DE BIOMAS</h2>
              <p className="map-subtitle">
                Derrote inimigos, colete estrelas, domine integrais
              </p>
            </div>
            <Tag color={G.accent}>Campanha Ativa</Tag>
          </div>

          <div className="map-quick-guide">
            <div className="map-guide-item">
              <strong>1. Clique em uma fase liberada</strong>
              <p>Os nós coloridos mostram o que já pode ser jogado agora.</p>
            </div>
            <div className="map-guide-item">
              <strong>2. Resolva a fase</strong>
              <p>Cada acerto rende XP, estrelas e abre caminho para bosses.</p>
            </div>
            <div className="map-guide-item">
              <strong>3. Use a loja e o grimório</strong>
              <p>Itens e revisões ajudam antes das fases mais difíceis.</p>
            </div>
          </div>

          {/* DASHBOARD - 3 CARDS PRINCIPAIS */}
          <div className="dashboard-apex">
            {/* CARD 1: PROGRESSO */}
            <article className="dash-card apex-card progress-card">
              <div className="card-glow"></div>
              <div className="card-icon-big">I</div>
              <div className="card-title">Progresso Geral</div>
              <div className="stat-row">
                <div className="stat-value">
                  {state.done.length}/{MAP_NODES.length}
                </div>
                <div className="stat-label">Fases Concluídas</div>
              </div>
              <div className="progress-bar-big">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(state.done.length / MAP_NODES.length) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="progress-text">
                {Math.ceil((state.done.length / MAP_NODES.length) * 100)}%
                Completo
              </div>
            </article>

            {/* CARD 2: PODER */}
            <article className="dash-card apex-card stars-card">
              <div className="card-glow stars-glow"></div>
              <div className="card-icon-big">★</div>
              <div className="card-title">Poder Cósmico</div>
              <div className="stat-row">
                <div className="stat-value">{totalStars}</div>
                <div className="stat-label">Estrelas (★) Acumuladas</div>
              </div>
              <div className="stars-grid">
                {Object.entries(state.stars).map(
                  ([phaseId, count]) =>
                    count > 0 && (
                      <span key={phaseId} className="star-chip">
                        {'★'.repeat(count)}
                      </span>
                    ),
                )}
              </div>
              <div className="star-hint">
                Coleta 3 estrelas para desbloquear Boss
              </div>
            </article>

            {/* CARD 3: OBJETIVO */}
            <article className="dash-card apex-card objective-card">
              <div className="card-glow objective-glow"></div>
              <div className="card-icon-big">V</div>
              <div className="card-title">Próximo Desafio</div>
              {nextObjective ? (
                <>
                  <div className="objective-name">{nextObjective.name}</div>
                  <button
                    className="btn primary large-btn glow-btn"
                    onClick={() => onOpen(nextObjective.id)}
                  >
                    JOGAR AGORA
                  </button>
                </>
              ) : (
                <>
                  <div className="victory-message">Voce venceu!</div>
                  <p className="victory-sub">
                    Todos os desafios foram conquistados
                  </p>
                </>
              )}
            </article>
          </div>

          {/* MAPA SVG - ELEMENTO PRINCIPAL */}
          <div className="map-section">
            <h3 className="map-section-title">EXPLORACAO DA CAMPANHA</h3>
            <div className="map-svg-container">
              <svg
                viewBox="0 0 1200 560"
                className="map-svg lotr-map"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="paper-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#efe1c0" />
                    <stop offset="52%" stopColor="#e8d6b2" />
                    <stop offset="100%" stopColor="#dbc297" />
                  </linearGradient>
                  <pattern
                    id="paper-fiber"
                    width="36"
                    height="36"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M0 8 L36 8"
                      stroke="rgba(70,50,20,0.06)"
                      strokeWidth="0.7"
                    />
                    <path
                      d="M0 24 L36 24"
                      stroke="rgba(70,50,20,0.05)"
                      strokeWidth="0.6"
                    />
                    <circle cx="8" cy="10" r="0.8" fill="rgba(84,58,22,0.16)" />
                    <circle
                      cx="24"
                      cy="27"
                      r="0.7"
                      fill="rgba(84,58,22,0.14)"
                    />
                  </pattern>
                  <pattern
                    id="paper-speckle"
                    width="120"
                    height="120"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="10"
                      cy="12"
                      r="0.9"
                      fill="rgba(72,46,18,0.16)"
                    />
                    <circle
                      cx="42"
                      cy="38"
                      r="0.8"
                      fill="rgba(72,46,18,0.14)"
                    />
                    <circle
                      cx="84"
                      cy="24"
                      r="1.1"
                      fill="rgba(72,46,18,0.12)"
                    />
                    <circle
                      cx="24"
                      cy="86"
                      r="0.9"
                      fill="rgba(72,46,18,0.13)"
                    />
                    <circle cx="96" cy="94" r="1" fill="rgba(72,46,18,0.15)" />
                    <path
                      d="M 0 60 C 20 56, 38 66, 60 60 C 82 54, 102 66, 120 60"
                      stroke="rgba(75,48,20,0.08)"
                      strokeWidth="1"
                      fill="none"
                    />
                  </pattern>
                  <clipPath id="map-inner-clip">
                    <rect x="18" y="18" width="1164" height="524" rx="12" />
                  </clipPath>
                  <filter
                    id="paper-edge"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="6"
                      stdDeviation="7"
                      floodColor="#1a1308"
                      floodOpacity="0.4"
                    />
                  </filter>
                  <filter
                    id="ink-shadow"
                    x="-40%"
                    y="-40%"
                    width="180%"
                    height="180%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="2"
                      floodColor="#2f1e0f"
                      floodOpacity="0.35"
                    />
                  </filter>
                  <linearGradient id="river-ink" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(102, 155, 168, 0.85)" />
                    <stop offset="50%" stopColor="rgba(118, 170, 182, 0.92)" />
                    <stop offset="100%" stopColor="rgba(92, 144, 158, 0.78)" />
                  </linearGradient>
                </defs>

                <rect
                  x="8"
                  y="8"
                  width="1184"
                  height="544"
                  rx="18"
                  fill="url(#paper-grad)"
                  filter="url(#paper-edge)"
                />
                <rect
                  x="8"
                  y="8"
                  width="1184"
                  height="544"
                  rx="18"
                  fill="url(#paper-fiber)"
                />
                <rect
                  x="8"
                  y="8"
                  width="1184"
                  height="544"
                  rx="18"
                  fill="url(#paper-speckle)"
                  opacity="0.55"
                />
                <rect
                  x="14"
                  y="14"
                  width="1172"
                  height="532"
                  rx="14"
                  fill="none"
                  stroke="rgba(94,66,30,0.45)"
                  strokeWidth="2"
                />

                {/* base cartográfica com imagem real */}
                <rect
                  x="18"
                  y="18"
                  width="1164"
                  height="524"
                  fill="url(#paper-speckle)"
                  opacity="0.45"
                />

                <g clipPath="url(#map-inner-clip)">
                  <path
                    d="M 38 108 C 184 74, 312 94, 468 130 C 612 166, 742 164, 912 124 C 1018 98, 1092 88, 1162 112 L 1162 202 C 1098 226, 1028 244, 916 262 C 772 286, 620 282, 456 248 C 316 218, 188 204, 38 224 Z"
                    fill="rgba(120,88,48,0.09)"
                  />
                  <path
                    d="M 36 314 C 194 278, 346 292, 514 330 C 670 366, 814 370, 986 334 C 1062 318, 1118 314, 1160 324 L 1160 426 C 1110 444, 1034 456, 938 468 C 804 486, 652 484, 486 448 C 334 416, 190 400, 36 420 Z"
                    fill="rgba(120,88,48,0.08)"
                  />
                  <path
                    d="M 78 64 C 198 120, 336 154, 514 176 C 708 198, 876 188, 1092 126"
                    stroke="rgba(84,58,22,0.2)"
                    strokeWidth="1.6"
                    strokeDasharray="3,9"
                    fill="none"
                  />
                  <path
                    d="M 72 262 C 236 228, 396 234, 572 268 C 746 302, 900 306, 1096 252"
                    stroke="rgba(84,58,22,0.18)"
                    strokeWidth="1.4"
                    strokeDasharray="2,8"
                    fill="none"
                  />
                  <rect
                    x="18"
                    y="18"
                    width="1164"
                    height="524"
                    fill="rgba(235,220,187,0.46)"
                  />
                </g>

                {/* detalhes cartográficos medievais */}
                <path
                  d="M 88 468 C 212 425, 312 440, 442 468"
                  fill="none"
                  stroke="rgba(90, 63, 31, 0.7)"
                  strokeWidth="3"
                  strokeDasharray="7,7"
                />
                <path
                  d="M 118 74 C 248 124, 372 174, 500 244 C 634 318, 762 389, 892 470 C 950 505, 1010 528, 1082 544"
                  fill="none"
                  stroke="rgba(68, 104, 118, 0.32)"
                  strokeWidth="8.8"
                  strokeLinecap="round"
                />
                <path
                  d="M 118 74 C 248 124, 372 174, 500 244 C 634 318, 762 389, 892 470 C 950 505, 1010 528, 1082 544"
                  fill="none"
                  stroke="url(#river-ink)"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 120 76 C 250 126, 376 179, 504 248 C 638 320, 768 391, 896 471 C 954 505, 1012 527, 1084 543"
                  fill="none"
                  stroke="rgba(220, 236, 241, 0.48)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeDasharray="3,8"
                />
                <text
                  x="110"
                  y="468"
                  fill="rgba(74,49,24,0.86)"
                  fontSize="16"
                  fontStyle="italic"
                >
                  Bosque Antigo
                </text>
                <text
                  x="138"
                  y="68"
                  fill="rgba(74,49,24,0.84)"
                  fontSize="15"
                  fontStyle="italic"
                >
                  Rio Velho
                </text>
                {/* Linhas de conexão */}
                {MAP_EDGES.map((edge, i) => {
                  const n1 = nodeMap.get(edge[0])
                  const n2 = nodeMap.get(edge[1])
                  if (!n1 || !n2) return null
                  const path = createEdgePath(n1, n2, i)
                  return (
                    <g key={`line-${i}`}>
                      <path
                        d={path}
                        stroke="rgba(84, 58, 22, 0.55)"
                        strokeWidth="6"
                        strokeDasharray="8,8"
                        strokeLinecap="round"
                        filter="url(#ink-shadow)"
                        fill="none"
                      />
                      <path
                        d={path}
                        stroke="rgba(148, 107, 56, 0.24)"
                        strokeWidth="14"
                        strokeDasharray="8,8"
                        strokeLinecap="round"
                        opacity="0.75"
                        fill="none"
                      />
                    </g>
                  )
                })}

                {/* Nós do mapa */}
                {MAP_NODES.map((n, i) => {
                  const done = state.done.includes(n.id)
                  const unlocked = isUnlocked(n.id, state.done, state.stars)
                  const stars = state.stars[n.id] ?? 0
                  const isBoss = n.type === 'boss'
                  const isObjective = nextObjective?.id === n.id

                  return (
                    <g
                      key={i}
                      transform={`translate(${n.x}, ${n.y})`}
                      className={`map-node-group ${unlocked ? 'unlocked' : 'locked'} ${done ? 'done' : ''} ${isBoss ? 'boss' : ''} ${isObjective ? 'objective' : ''}`}
                    >
                      {isObjective && unlocked && !done && (
                        <>
                          <circle className="objective-ring" r="51" />
                          <circle className="objective-ring delayed" r="51" />
                          <text
                            y="-48"
                            textAnchor="middle"
                            className="objective-label"
                            style={{ pointerEvents: 'none' }}
                          >
                            ALVO
                          </text>
                        </>
                      )}

                      {/* Base shadow */}
                      <circle
                        r="40"
                        fill={
                          done ? '#496d45' : unlocked ? '#6c4b28' : '#6e5a44'
                        }
                        fillOpacity={done ? 0.28 : unlocked ? 0.25 : 0.22}
                        filter="url(#ink-shadow)"
                      />

                      {/* Node principal */}
                      <circle
                        r="36"
                        fill={
                          done ? '#3f5b38' : unlocked ? '#5a4127' : '#4e3e2f'
                        }
                        stroke={
                          done ? '#8fb880' : unlocked ? '#d9be86' : '#a88a62'
                        }
                        strokeWidth={done ? 4 : unlocked ? 3 : 2}
                        className={`node-circle ${unlocked ? 'unlocked' : 'locked'} ${isBoss ? 'boss-node' : ''}`}
                        style={{ cursor: unlocked ? 'pointer' : 'not-allowed' }}
                        onClick={() => unlocked && onOpen(n.id)}
                      />

                      {/* Inner ring */}
                      {unlocked && (
                        <circle
                          r="34"
                          fill="none"
                          stroke="#f5e4bc"
                          strokeWidth="1"
                          opacity="0.45"
                        />
                      )}

                      {/* Ícone/Status */}
                      <text
                        y="8"
                        textAnchor="middle"
                        fill="#f7ead2"
                        fontSize="18"
                        fontWeight="700"
                        className="node-icon"
                        style={{
                          pointerEvents: 'none',
                          textShadow: '0 1px 0 rgba(0,0,0,0.35)',
                        }}
                      >
                        {done
                          ? 'V'
                          : unlocked
                            ? MAP_NODE_ICON_BY_ID[n.id] || 'O'
                            : 'L'}
                      </text>

                      {/* Nome do bioma */}
                      <rect
                        className="node-label"
                        x="-72"
                        y="58"
                        width="144"
                        height="34"
                        rx="8"
                        fill="rgba(237, 220, 182, 0.88)"
                        stroke="rgba(98, 70, 34, 0.45)"
                        strokeWidth="1"
                      />
                      <text
                        className="node-label-main"
                        y="72"
                        textAnchor="middle"
                        fill="#4e361a"
                        fontSize="11"
                        fontWeight="700"
                        style={{
                          pointerEvents: 'none',
                          letterSpacing: '0.6px',
                        }}
                      >
                        {n.name.split(' ')[0].toUpperCase()}
                      </text>
                      <text
                        className="node-label-sub"
                        y="84"
                        textAnchor="middle"
                        fill="#6a4c24"
                        fontSize="9"
                        fontWeight="500"
                        style={{ pointerEvents: 'none' }}
                      >
                        {n.name.split(' ').slice(1).join(' ')}
                      </text>

                      {/* Estrelas */}
                      {done && (
                        <text
                          y="102"
                          textAnchor="middle"
                          fill="#fde047"
                          fontSize="12"
                          fontWeight="700"
                          style={{
                            pointerEvents: 'none',
                            textShadow: '0 0 6px rgba(253, 224, 71, 0.6)',
                          }}
                        >
                          {'★'.repeat(stars)}
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* HINTS/STATUS CHIPS */}
          <div className="hints-section">
            <p className="hints-title">Status dos Desafios:</p>
            <div className="hints-grid">
              {MAP_NODES.map((n) => {
                const unlocked = isUnlocked(n.id, state.done, state.stars)
                const done = state.done.includes(n.id)

                return (
                  <div
                    key={n.id}
                    className={`hint-chip ${done ? 'completed' : unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <span className="hint-status">
                      {done ? 'V' : unlocked ? '>' : 'L'}
                    </span>
                    <div className="hint-content">
                      <strong>{n.name}</strong>
                      <small>{getUnlockHint(n.id, state.done, state.stars)}</small>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {showCelebration && !nextObjective && (
        <div className="overlay final-celebration-overlay">
          <div className="final-celebration-card">
            <div className="crown-orbit" aria-hidden="true">
              <span>✦</span>
              <span>✧</span>
              <span>✦</span>
              <span>✧</span>
              <span>✦</span>
              <span>✧</span>
            </div>
            <div className="final-celebration-badge">CAMPANHA CONCLUÍDA</div>
            <h2>A Coroa Arcana foi restaurada</h2>
            <p>
              Todas as fases foram vencidas. O conhecimento foi selado, o
              Arquimago caiu e o caminho do Integral Supremo ficou para trás.
            </p>
            <div className="final-celebration-stats">
              <span>{state.done.length}/{MAP_NODES.length} fases</span>
              <span>{Object.values(state.stars).reduce((sum, value) => sum + value, 0)} estrelas</span>
            </div>
            <div className="stars-row final-stars-row" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((value, index) => (
                <span
                  key={value}
                  className="star on final-star"
                  style={{ animationDelay: `${index * 0.14}s` }}
                >
                  ★
                </span>
              ))}
            </div>
            <button className="btn primary glow-btn" onClick={() => onOpen('home')}>
              VOLTAR AO INÍCIO
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
