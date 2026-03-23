import { useMemo } from 'react'
import { G, MAP_EDGES, MAP_NODES } from '../gameData'
import { isUnlocked } from '../gameUtils'
import { Tag } from './ui'

export function HomeScreen({
  state,
  onStart,
  onOpenMap,
  onOpenShop,
  onOpenGrimoire,
}) {
  const completed = state.done.length
  const totalStars = Object.values(state.stars).reduce((sum, s) => sum + s, 0)
  const progressPct = Math.min(100, (completed / MAP_NODES.length) * 100)
  const playerLevel = Math.floor(state.xp / 100) + 1
  const isFirstRun = completed === 0 && state.xp === 0 && state.gold === 0
  const nextPhase =
    state.done.length < MAP_NODES.length ? MAP_NODES[state.done.length] : null

  return (
    <section className="screen home-screen">
      <div className="home-hero">
        <p className="hero-kicker">Campanha de Calculo Integral</p>
        <h1 className="glow-text">∫NTEGRA</h1>
        <p className="hero-sub">
          Explore biomas matemáticos, domine técnicas de integração e enfrente
          chefes lendários.
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

      <div className="home-panels">
        <article className="home-card card-progress">
          <div className="card-header">
            <small>PROGRESSO DA CAMPANHA</small>
            <span className="card-badge">{Math.ceil(progressPct)}%</span>
          </div>
          <strong className="big-stat">
            {completed}/{MAP_NODES.length}
          </strong>
          <p className="card-sub">fases concluídas</p>
          <div className="progress-bars">
            <div className="mini-meter">
              <div
                className="mini-meter-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="phase-dots">
              {MAP_NODES.map((_, i) => (
                <span
                  key={i}
                  className={`dot ${state.done.includes(i) ? 'done' : ''}`}
                  title={`Fase ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </article>

        <article className="home-card card-resources">
          <div className="card-header">
            <small>RECURSOS E PODER</small>
          </div>
          <div className="resource-flex">
            <div className="resource-item">
              <span className="resource-icon">XP</span>
              <div>
                <p className="resource-value">{state.xp}</p>
                <p className="resource-label">XP</p>
              </div>
            </div>
            <div className="resource-item">
              <span className="resource-icon">OU</span>
              <div>
                <p className="resource-value">{state.gold}</p>
                <p className="resource-label">OURO</p>
              </div>
            </div>
            <div className="resource-item">
              <span className="resource-icon">ST</span>
              <div>
                <p className="resource-value">{totalStars}</p>
                <p className="resource-label">ESTRELAS</p>
              </div>
            </div>
          </div>
        </article>

        <article className="home-card card-quick">
          <div className="card-header">
            <small>ACESSO RAPIDO</small>
          </div>
          <div className="quick-buttons">
            <button className="btn small-btn" onClick={onOpenShop}>
              Loja
            </button>
            <button className="btn small-btn" onClick={onOpenGrimoire}>
              Grimorio
            </button>
          </div>
          {nextPhase && (
            <div className="next-challenge">
              <p className="next-label">Próximo Desafio:</p>
              <p className="next-name">{nextPhase.name}</p>
            </div>
          )}
        </article>
      </div>
    </section>
  )
}

export function MapScreen({ state, onOpen }) {
  const map = useMemo(() => new Map(MAP_NODES.map((n) => [n.id, n])), [])
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

  const unlockHint = (id) => {
    if (isUnlocked(id, state.done, state.stars)) return 'Pronto para jogar'
    if (id === 'usub') return 'Conclua FORGE'
    if (id === 'measure') return 'Conclua FORGE'
    if (id === 'boss_forge') return 'FORGE precisa de 3 estrelas'
    if (id === 'parts') return 'Derrote Guardião das Raízes'
    if (id === 'connect') return 'Conclua U-SUB e MEASURE'
    if (id === 'boss_usub_parts') return 'PARTES e CONNECT com 3 estrelas'
    if (id === 'boss_final') return 'Derrote Arquimago com 3 estrelas'
    return 'Bloqueado'
  }

  const nodeIcon = {
    forge: 'F',
    usub: 'U',
    measure: 'A',
    boss_forge: 'G',
    parts: 'P',
    connect: 'T',
    boss_usub_parts: 'M',
    boss_final: 'R',
  }

  const edgePath = (from, to, idx) => {
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2
    const bend = idx % 2 === 0 ? -28 : 28
    return `M ${from.x} ${from.y} Q ${midX} ${midY + bend} ${to.x} ${to.y}`
  }

  return (
    <section className="screen map-screen rpg-layout">
      <div className="map-content-wrapper">
        {/* MENU LATERAL RPG */}
        <aside className="rpg-menu">
          <div className="menu-header">
            <h3>CMDOS</h3>
          </div>
          <nav className="menu-nav">
            <button
              className="menu-btn active"
              title="Visualizar mapa da campanha"
            >
              MAPA
            </button>
            <button
              className="menu-btn"
              onClick={() => onOpen('shop')}
              title="Comprar itens"
            >
              SHOP
            </button>
            <button
              className="menu-btn"
              onClick={() => onOpen('grimoire')}
              title="Revisar conceitos"
            >
              GRIMORIO
            </button>
            <button
              className="menu-btn"
              onClick={() => onOpen('tutorial')}
              title="Guia de jogo"
            >
              TUTORIAL
            </button>
            <button
              className="menu-btn"
              onClick={() => onOpen('home')}
              title="Voltar ao início"
            >
              HOME
            </button>
          </nav>

          <div className="menu-stats">
            <div className="stat-item">
              <span className="stat-icon">XP</span>
              <span className="stat-val">{state.xp}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">OU</span>
              <span className="stat-val">{state.gold}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">HP</span>
              <span className="stat-val">{state.hp}</span>
            </div>
          </div>
        </aside>

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
                    id="old-map-texture"
                    width="420"
                    height="420"
                    patternUnits="userSpaceOnUse"
                  >
                    <image
                      href="https://www.transparenttextures.com/patterns/old-map.png"
                      x="0"
                      y="0"
                      width="420"
                      height="420"
                      opacity="0.65"
                    />
                  </pattern>
                  <clipPath id="map-inner-clip">
                    <rect x="18" y="18" width="1164" height="524" rx="12" />
                  </clipPath>
                  <pattern
                    id="paper-grain"
                    width="320"
                    height="320"
                    patternUnits="userSpaceOnUse"
                  >
                    <image
                      href="https://www.transparenttextures.com/patterns/paper-fibers.png"
                      x="0"
                      y="0"
                      width="320"
                      height="320"
                      opacity="0.3"
                    />
                  </pattern>
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
                  fill="url(#paper-grain)"
                  opacity="0.45"
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
                  fill="url(#old-map-texture)"
                  opacity="0.55"
                />

                <g clipPath="url(#map-inner-clip)">
                  <image
                    href="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Middle-earth_map_from_Tolkien%27s_The_Lord_of_the_Rings.svg/1920px-Middle-earth_map_from_Tolkien%27s_The_Lord_of_the_Rings.svg.png"
                    x="20"
                    y="20"
                    width="1160"
                    height="520"
                    preserveAspectRatio="xMidYMid slice"
                    opacity="0.16"
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
                  d="M 722 88 C 806 124, 842 161, 914 200"
                  fill="none"
                  stroke="rgba(86, 125, 143, 0.65)"
                  strokeWidth="2.1"
                />
                <path
                  d="M 914 200 C 988 233, 1032 288, 1110 323"
                  fill="none"
                  stroke="rgba(86, 125, 143, 0.62)"
                  strokeWidth="2.1"
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
                  x="742"
                  y="83"
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
                  const path = edgePath(n1, n2, i)
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

                  return (
                    <g
                      key={i}
                      transform={`translate(${n.x}, ${n.y})`}
                      className={`map-node-group ${unlocked ? 'unlocked' : 'locked'} ${done ? 'done' : ''} ${isBoss ? 'boss' : ''}`}
                    >
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
                        {done ? 'V' : unlocked ? nodeIcon[n.id] || 'O' : 'L'}
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
                      <small>{unlockHint(n.id)}</small>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
