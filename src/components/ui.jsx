import { SHOP_ITEMS } from '../gameData'

export function TopBar({
  xp,
  gold,
  hp,
  hasCrown,
  musicEnabled,
  musicVolume,
  onToggleMusic,
  onMusicVolume,
}) {
  const xpProgress = ((xp % 100) / 100) * 100
  return (
    <header className="topbar">
      <div className="logo">∫NTEGRA {hasCrown ? '[COROA]' : ''}</div>
      <div className="top-stats">
        <div className="music-controls" title="Trilha ambiente original">
          <button
            className={`music-btn ${musicEnabled ? 'on' : ''}`}
            onClick={onToggleMusic}
            aria-label={musicEnabled ? 'Desligar música' : 'Ligar música'}
          >
            {musicEnabled ? '♪ ON' : '♪ OFF'}
          </button>
          <input
            className="music-slider"
            type="range"
            min="0"
            max="100"
            value={Math.round((musicVolume ?? 0) * 100)}
            onChange={(e) => onMusicVolume?.(Number(e.target.value) / 100)}
            aria-label="Volume da música"
          />
        </div>
        <div className="xp-mini">
          <span>XP {xp}</span>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        <span>OU {gold}</span>
        <HP hp={hp} total={3} />
      </div>
    </header>
  )
}

export function BottomNav({ active, onNavigate }) {
  const items = [
    ['home', 'INICIO'],
    ['map', 'MAPA'],
    ['forge', 'FORGE'],
    ['usub', 'U-SUB'],
    ['measure', 'MEASURE'],
    ['connect', 'TFC'],
    ['parts', 'PARTES'],
    ['shop', 'LOJA'],
    ['grimoire', 'GRIMORIO'],
    ['tutorial', 'TUTORIAL'],
  ]

  return (
    <nav className="bottom-nav">
      {items.map(([id, label]) => (
        <button
          key={id}
          className={`nav-btn ${active === id ? 'active' : ''}`}
          onClick={() => onNavigate(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}

export function LoreCard({ text }) {
  return <div className="lore-card">{text}</div>
}

export function Feedback({ feedback }) {
  if (!feedback) return null
  return <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>
}

export function HP({ hp, total }) {
  return (
    <div className="hp-row">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`hp-square ${i < hp ? 'on' : 'off'}`} />
      ))}
    </div>
  )
}

export function Timer({ seconds }) {
  return (
    <div className={`timer ${seconds <= 10 ? 'warn' : ''}`}>
      TEMPO {seconds}s
    </div>
  )
}

export function Tag({ color, children }) {
  return (
    <span
      className="tag"
      style={{ borderColor: color, color, background: `${color}22` }}
    >
      {children}
    </span>
  )
}

export function StarScreen({ stars, onClose, title }) {
  return (
    <div className="overlay">
      <div className="star-box">
        <h2>{title}</h2>
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
        <button className="btn primary" onClick={onClose}>
          CONTINUAR
        </button>
      </div>
    </div>
  )
}

export function ItemBar({ items, getStatus, onUse }) {
  return (
    <div className="item-bar">
      {items.map((id) => {
        const st = getStatus(id)
        const item = SHOP_ITEMS.find((i) => i.id === id)
        if (!item) return null
        return (
          <button
            key={id}
            className={`item-btn ${st.can ? '' : 'blocked'}`}
            onClick={() => st.can && onUse(id)}
            title={item.description}
          >
            {item.name.split(' ')[0].toUpperCase()} x{st.qty}
            {!st.can ? ' X' : ''}
          </button>
        )
      })}
    </div>
  )
}

export function CrystalModal({ entry, onClose }) {
  if (!entry) return null
  return (
    <div className="overlay">
      <div className="modal-card">
        <h3>Revisao do Grimorio</h3>
        <p>
          <strong>{entry.fase}</strong>
        </p>
        <p>{entry.integral}</p>
        <p className="muted">{entry.conceito}</p>
        <button className="btn primary" onClick={onClose}>
          FECHAR
        </button>
      </div>
    </div>
  )
}
