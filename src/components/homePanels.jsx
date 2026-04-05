import { MAP_NODES, NPC_REPUTATION, RPG_CLASSES, TALENT_TREE } from '../gameData'
import { HOME_GUIDE_STEPS } from '../constants/homeConstants'
import { isUnlocked } from '../gameUtils'

function SessionChecklist({ items }) {
  return (
    <div className="session-checklist">
      <div className="card-header checklist-header">
        <small>PLANO DA SESSAO</small>
        <span className="card-badge">
          {items.filter((item) => item.done).length}/{items.length}
        </span>
      </div>
      <div className="checklist-list">
        {items.map((item) => (
          <div key={item.label} className={`checklist-item ${item.done ? 'done' : ''}`}>
            <span className="checklist-mark">{item.done ? '✓' : '○'}</span>
            <span className="checklist-text">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="muted checklist-note">
        Atualize este plano antes de entrar em um boss para reduzir risco de derrota.
      </p>
    </div>
  )
}

function CampaignProgressCard({ completed, progressPct, state }) {
  return (
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
          <div className="mini-meter-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="phase-dots">
          {MAP_NODES.map((node, i) => (
            <span
              key={i}
              className={`dot ${state.done.includes(node.id) ? 'done' : ''}`}
              title={`Fase ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </article>
  )
}

function StoryCard({ beat, journeyPreview, state }) {
  return (
    <article className="home-card card-story">
      <div className="card-header">
        <small>ARCO NARRATIVO</small>
        <span className="card-badge">{beat.chapter}</span>
      </div>
      <p className="story-tone">{beat.tone}</p>
      <p className="story-next">Proximo passo: {beat.nextAction}</p>
      <div className="journey-line">
        {journeyPreview.map((node) => {
          const done = state.done.includes(node.id)
          const unlocked = isUnlocked(node.id, state.done, state.stars)
          const status = done ? 'done' : unlocked ? 'active' : 'locked'
          return (
            <span key={node.id} className={`journey-step ${status}`}>
              {node.name}
            </span>
          )
        })}
      </div>
    </article>
  )
}

function ResourcesCard({ state, totalStars }) {
  return (
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
  )
}

function QuickCard({
  nextPhase,
  saveLabel,
  currentClass,
  questsDone,
  questsLength,
  availableTalentPoints,
  questsClaimable,
  onOpenShop,
  onOpenGrimoire,
  onResetCampaign,
  sessionChecklist,
  guideSteps,
  isNewPlayer,
}) {
  return (
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
        <button className="btn small-btn" onClick={onResetCampaign}>
          Novo Jogo
        </button>
      </div>
      {nextPhase && (
        <div className="next-challenge">
          <p className="next-label">Próximo Desafio:</p>
          <p className="next-name">{nextPhase.name}</p>
        </div>
      )}
      <p className="muted" style={{ marginTop: 10 }}>
        Último salvamento: {saveLabel}
      </p>
      <p className="muted" style={{ marginTop: 6 }}>
        RPG: {currentClass?.name ?? 'Sem classe'} · {questsDone}/
        {questsLength} contratos concluídos
      </p>
      <p className="muted" style={{ marginTop: 4 }}>
        Talentos: {availableTalentPoints} pts · Resgates pendentes:{' '}
        {questsClaimable}
      </p>

      <SessionChecklist items={sessionChecklist} />
      <QuickGuideStrip steps={guideSteps} isNewPlayer={isNewPlayer} />
    </article>
  )
}

function RpgTabButtons({ rpgTab, setRpgTab }) {
  return (
    <div className="tool-row" style={{ marginBottom: 10 }}>
      <button
        className={`btn small-btn ${rpgTab === 'profile' ? 'primary' : ''}`}
        onClick={() => setRpgTab('profile')}
      >
        Perfil
      </button>
      <button
        className={`btn small-btn ${rpgTab === 'progression' ? 'primary' : ''}`}
        onClick={() => setRpgTab('progression')}
      >
        Progressão
      </button>
      <button
        className={`btn small-btn ${rpgTab === 'contracts' ? 'primary' : ''}`}
        onClick={() => setRpgTab('contracts')}
      >
        Contratos
      </button>
      <button
        className={`btn small-btn ${rpgTab === 'npcs' ? 'primary' : ''}`}
        onClick={() => setRpgTab('npcs')}
      >
        NPCs
      </button>
    </div>
  )
}

function ProfileTab({ currentClass, equippedRunes, repAvg, questsDone, questsLength, state, onChooseClass }) {
  return (
    <div className="profile-tab">
      <p className="muted profile-intro">
        Seu estilo atual de campanha e bônus ativos.
      </p>

      <div className="profile-summary-grid">
        <div className="profile-summary-card accent">
          <span className="profile-summary-label">Classe</span>
          {currentClass ? (
            <>
              <strong>
                {currentClass.icon} {currentClass.name}
              </strong>
              <small>{currentClass.perk}</small>
            </>
          ) : (
            <strong>Sem classe</strong>
          )}
        </div>

        <div className="profile-summary-card">
          <span className="profile-summary-label">Runas</span>
          <strong>{equippedRunes.length ? equippedRunes.join(' · ') : 'nenhuma'}</strong>
          <small>Loadout ativo</small>
        </div>

        <div className="profile-summary-card">
          <span className="profile-summary-label">Reputação</span>
          <strong>{repAvg}/5</strong>
          <small>NPCs aliados</small>
        </div>

        <div className="profile-summary-card">
          <span className="profile-summary-label">Contratos</span>
          <strong>
            {questsDone}/{questsLength}
          </strong>
          <small>Concluídos na campanha</small>
        </div>
      </div>

      <div className="profile-cta-row">
        <p className="muted">Troque a classe quando quiser ajustar o ritmo da campanha.</p>
      </div>

      <div className="class-grid">
        {RPG_CLASSES.map((entry) => (
          <button
            key={entry.id}
            className={`class-pill ${state.playerClass === entry.id ? 'active' : ''}`}
            onClick={() => onChooseClass?.(entry.id)}
          >
            <span className="class-pill-icon">{entry.icon}</span>
            <span className="class-pill-text">
              <strong>{entry.name}</strong>
              <small>{entry.perk}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ProgressionTab({ availableTalentPoints, state, onSpendTalent }) {
  return (
    <div className="grim-list">
      <p className="muted">Pontos disponíveis: {availableTalentPoints}</p>
      {TALENT_TREE.map((talent) => {
        const rank = state.talents?.[talent.id] ?? 0
        const canUpgrade = availableTalentPoints > 0 && rank < talent.maxRank
        return (
          <article key={talent.id} className="grim-card">
            <strong>
              {talent.name} ({rank}/{talent.maxRank})
            </strong>
            <p className="muted">{talent.description}</p>
            <button
              className="btn small-btn"
              disabled={!canUpgrade}
              onClick={() => onSpendTalent?.(talent.id)}
            >
              Evoluir
            </button>
          </article>
        )
      })}
    </div>
  )
}

function ContractsTab({ sortedQuests, onClaimQuest }) {
  return (
    <div className="grim-list">
      {sortedQuests.map((quest) => (
        <article key={quest.id} className="grim-card">
          <strong>{quest.title}</strong>
          <p className="muted">{quest.description}</p>
          <p className="muted">
            Recompensa: +{quest.reward.xp} XP, +{quest.reward.gold} OU
          </p>
          <button
            className="btn small-btn"
            disabled={!quest.done || quest.claimed}
            onClick={() => onClaimQuest?.(quest.id)}
          >
            {quest.claimed ? 'Resgatada' : quest.done ? 'Resgatar' : 'Em progresso'}
          </button>
        </article>
      ))}
    </div>
  )
}

function NpcsTab({ state }) {
  return (
    <div className="grim-list">
      {NPC_REPUTATION.map((npc) => {
        const rep = state.reputation?.[npc.id] ?? 0
        return (
          <article key={npc.id} className="grim-card">
            <strong>{npc.name}</strong>
            <div className="mini-meter" style={{ marginTop: 8 }}>
              <div
                className="mini-meter-fill"
                style={{ width: `${(rep / 5) * 100}%` }}
              />
            </div>
            <p className="muted">Nível {rep}/5</p>
          </article>
        )
      })}
    </div>
  )
}

function QuickGuideStrip({ steps, isNewPlayer }) {
  return (
    <div className="guide-strip">
      <div className="card-header">
        <small>GUIA RÁPIDO</small>
        <span className="card-badge">{isNewPlayer ? 'Novo jogador' : 'Resumo'}</span>
      </div>
      <div className="guide-steps">
        {steps.map((step) => (
          <div key={step.title} className="guide-step">
            <span className="guide-step-icon">{step.icon}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HomeOverviewPanels({
  state,
  completed,
  totalStars,
  progressPct,
  beat,
  journeyPreview,
  nextPhase,
  saveLabel,
  currentClass,
  questsDone,
  questsLength,
  availableTalentPoints,
  questsClaimable,
  onOpenShop,
  onOpenGrimoire,
  onResetCampaign,
  sessionChecklist,
  isNewPlayer,
}) {
  return (
    <>
      <CampaignProgressCard
        completed={completed}
        progressPct={progressPct}
        state={state}
      />
      <StoryCard beat={beat} journeyPreview={journeyPreview} state={state} />
      <ResourcesCard state={state} totalStars={totalStars} />
      <QuickCard
        nextPhase={nextPhase}
        saveLabel={saveLabel}
        currentClass={currentClass}
        questsDone={questsDone}
        questsLength={questsLength}
        availableTalentPoints={availableTalentPoints}
        questsClaimable={questsClaimable}
        onOpenShop={onOpenShop}
        onOpenGrimoire={onOpenGrimoire}
        onResetCampaign={onResetCampaign}
        sessionChecklist={sessionChecklist}
        guideSteps={HOME_GUIDE_STEPS}
        isNewPlayer={isNewPlayer}
      />
    </>
  )
}

export function HomeRpgPanel({
  state,
  rpgTab,
  setRpgTab,
  currentClass,
  repAvg,
  equippedRunes,
  questsDone,
  questsLength,
  availableTalentPoints,
  sortedQuests,
  onChooseClass,
  onSpendTalent,
  onClaimQuest,
}) {
  return (
    <article className="home-card rpg-panel-card">
      <div className="card-header">
        <small>PAINEL RPG</small>
        <span className="card-badge">Avançado</span>
      </div>

      <RpgTabButtons rpgTab={rpgTab} setRpgTab={setRpgTab} />

      <div className="rpg-panel-scroll">
        {rpgTab === 'profile' && (
          <ProfileTab
            currentClass={currentClass}
            equippedRunes={equippedRunes}
            repAvg={repAvg}
            questsDone={questsDone}
            questsLength={questsLength}
            state={state}
            onChooseClass={onChooseClass}
          />
        )}

        {rpgTab === 'progression' && (
          <ProgressionTab
            availableTalentPoints={availableTalentPoints}
            state={state}
            onSpendTalent={onSpendTalent}
          />
        )}

        {rpgTab === 'contracts' && (
          <ContractsTab sortedQuests={sortedQuests} onClaimQuest={onClaimQuest} />
        )}

        {rpgTab === 'npcs' && <NpcsTab state={state} />}
      </div>
    </article>
  )
}
