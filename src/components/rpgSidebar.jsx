export function RpgSidebar({ state, active = 'map', onNavigate }) {
  const sections = [
    {
      title: 'JOGO',
      items: [
        { id: 'map', label: 'MAPA', title: 'Visualizar mapa da campanha' },
        { id: 'shop', label: 'SHOP', title: 'Comprar itens' },
      ],
    },
    {
      title: 'APOIO',
      items: [
        { id: 'grimoire', label: 'GRIMORIO', title: 'Revisar conceitos' },
        { id: 'tutorial', label: 'TUTORIAL', title: 'Guia de jogo' },
      ],
    },
    {
      title: 'NAVEGACAO',
      items: [{ id: 'home', label: 'HOME', title: 'Voltar ao inicio' }],
    },
  ]

  return (
    <aside className="rpg-menu">
      <div className="menu-header">
        <h3>COMANDOS</h3>
      </div>

      <nav className="menu-nav">
        {sections.map((section) => (
          <div key={section.title} className="menu-section">
            <p className="menu-section-title">{section.title}</p>
            {section.items.map((item) => (
              <button
                key={item.id}
                className={`menu-btn ${active === item.id ? 'active' : ''}`}
                title={item.title}
                onClick={() => onNavigate?.(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="menu-stats">
        <div className="stat-item">
          <span className="stat-icon">XP</span>
          <span className="stat-val">{state?.xp ?? 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">OU</span>
          <span className="stat-val">{state?.gold ?? 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">HP</span>
          <span className="stat-val">{state?.hp ?? 0}</span>
        </div>
      </div>
    </aside>
  )
}
