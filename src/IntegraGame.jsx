import { useEffect, useState } from 'react'
import {
  BossScreen,
  ConnectScreen,
  ForgeScreen,
  GrimorioScreen,
  HomeScreen,
  MapScreen,
  MeasureScreen,
  PhaseBriefingScreen,
  ShopScreen,
  TutorialScreen,
  WizardScreen,
} from './components/screens'
import { StarScreen, TopBar } from './components/ui'
import {
  BOSS_CONFIG,
  G,
  INITIAL_HP,
  INITIAL_STATE,
  MAP_NODES,
  NPC_REPUTATION,
  PARTS_Q,
  PHASE_BRIEFINGS,
  PHASE_TO_NPC,
  RPG_CLASSES,
  SHOP_ITEMS,
  SIDE_QUESTS,
  TALENT_TREE,
  USUB_Q,
} from './gameData'
import { calcStars, isUnlocked } from './gameUtils'
import { useAmbientMusic } from './utils/useAmbientMusic'
import './styles/game.css'

const SAVE_KEY = 'integra:campaign:v1'
const KNOWN_PHASE_IDS = new Set(MAP_NODES.map((node) => node.id))
const KNOWN_CLASS_IDS = new Set(RPG_CLASSES.map((cls) => cls.id))
const KNOWN_TALENT_IDS = new Set(TALENT_TREE.map((talent) => talent.id))
const KNOWN_QUEST_IDS = new Set(SIDE_QUESTS.map((quest) => quest.id))
const MAX_REPUTATION = 5

function getQuestDone(state, questId) {
  const totalStars = Object.values(state.stars ?? {}).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  )

  if (questId === 'q_guardiao_raizes') return state.done.includes('boss_forge')
  if (questId === 'q_coletor_estrelas') return totalStars >= 12
  if (questId === 'q_grimorio')
    return (state.grimoire?.length ?? 0) >= 8 || state.done.length >= 6
  if (questId === 'q_supremo') return state.done.includes('boss_final')
  return false
}

function getLevelFromXp(xp) {
  return Math.floor((Number(xp) || 0) / 100) + 1
}

function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') return INITIAL_STATE

  const toSafeInt = (value, fallback = 0) => {
    const n = Number(value)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback
  }

  const done = Array.isArray(raw.done)
    ? raw.done.filter(
        (phaseId) =>
          typeof phaseId === 'string' && KNOWN_PHASE_IDS.has(phaseId),
      )
    : []

  const stars =
    raw.stars && typeof raw.stars === 'object'
      ? Object.fromEntries(
          Object.entries(raw.stars)
            .filter(([phaseId]) => KNOWN_PHASE_IDS.has(phaseId))
            .map(([phaseId, value]) => [
              phaseId,
              Math.min(3, toSafeInt(value)),
            ]),
        )
      : {}

  const grimoire = Array.isArray(raw.grimoire)
    ? raw.grimoire.filter(
        (entry) =>
          entry &&
          typeof entry === 'object' &&
          typeof entry.fase === 'string' &&
          typeof entry.conceito === 'string' &&
          typeof entry.integral === 'string' &&
          Number.isFinite(Number(entry.timestamp)),
      )
    : []

  const inventory =
    raw.inventory && typeof raw.inventory === 'object'
      ? Object.fromEntries(
          Object.entries(raw.inventory).map(([itemId, qty]) => [
            itemId,
            toSafeInt(qty),
          ]),
        )
      : {}

  const talents =
    raw.talents && typeof raw.talents === 'object'
      ? Object.fromEntries(
          Object.entries(raw.talents)
            .filter(([talentId]) => KNOWN_TALENT_IDS.has(talentId))
            .map(([talentId, rank]) => [
              talentId,
              Math.max(0, toSafeInt(rank)),
            ]),
        )
      : {}

  const reputation =
    raw.reputation && typeof raw.reputation === 'object'
      ? Object.fromEntries(
          Object.entries(raw.reputation)
            .filter(([npcId]) => NPC_REPUTATION.some((npc) => npc.id === npcId))
            .map(([npcId, value]) => [
              npcId,
              Math.min(MAX_REPUTATION, toSafeInt(value)),
            ]),
        )
      : {}

  const claimedQuests = Array.isArray(raw.claimedQuests)
    ? raw.claimedQuests.filter((questId) => KNOWN_QUEST_IDS.has(questId))
    : []

  const loadout =
    raw.loadout && typeof raw.loadout === 'object'
      ? {
          slot1:
            typeof raw.loadout.slot1 === 'string' ? raw.loadout.slot1 : null,
          slot2:
            typeof raw.loadout.slot2 === 'string' ? raw.loadout.slot2 : null,
        }
      : { slot1: null, slot2: null }

  const level = getLevelFromXp(toSafeInt(raw.xp, INITIAL_STATE.xp))
  const spentTalentPoints = Math.max(0, toSafeInt(raw.spentTalentPoints))
  const maxSpent = Math.max(0, level - 1)

  return {
    xp: toSafeInt(raw.xp, INITIAL_STATE.xp),
    gold: toSafeInt(raw.gold, INITIAL_STATE.gold),
    hp: Math.min(3, toSafeInt(raw.hp, INITIAL_STATE.hp)),
    done,
    stars,
    grimoire,
    inventory,
    playerClass:
      typeof raw.playerClass === 'string' &&
      KNOWN_CLASS_IDS.has(raw.playerClass)
        ? raw.playerClass
        : null,
    talents,
    spentTalentPoints: Math.min(spentTalentPoints, maxSpent),
    loadout,
    reputation,
    claimedQuests,
  }
}

function loadCampaign() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    return {
      state: normalizeState(parsed.state),
      hasCrown: Boolean(parsed.hasCrown),
      updatedAt: Number.isFinite(Number(parsed.updatedAt))
        ? Number(parsed.updatedAt)
        : null,
    }
  } catch {
    return null
  }
}

export default function IntegraGame() {
  const initialSave = loadCampaign()
  const [state, setState] = useState(initialSave?.state ?? INITIAL_STATE)
  const [screen, setScreen] = useState('home')
  const [starResult, setStarResult] = useState(null)
  const [hasCrown, setHasCrown] = useState(initialSave?.hasCrown ?? false)
  const [lastSavedAt, setLastSavedAt] = useState(initialSave?.updatedAt ?? null)
  const [previousScreen, setPreviousScreen] = useState('map')
  const [pendingPhaseId, setPendingPhaseId] = useState(null)
  const { musicEnabled, musicVolume, toggleMusic, setMusicVolume } =
    useAmbientMusic()

  const bossIds = ['boss_forge', 'boss_usub_parts', 'boss_final']
  const phaseIds = ['forge', 'usub', 'measure', 'connect', 'parts', ...bossIds]
  const playerLevel = getLevelFromXp(state.xp)
  const availableTalentPoints = Math.max(
    0,
    playerLevel - 1 - state.spentTalentPoints,
  )

  const loadoutRunes = [state.loadout?.slot1, state.loadout?.slot2].filter(
    Boolean,
  )
  const hasRuneFocus = loadoutRunes.includes('rune_focus')
  const hasRuneWard = loadoutRunes.includes('rune_ward')
  const hasRuneTrade = loadoutRunes.includes('rune_trade')

  const rpgModifiers = {
    hasStartShield:
      state.playerClass === 'guardiao' ||
      (state.talents.escudo_inicial ?? 0) > 0 ||
      hasRuneWard,
    hasFreeHint:
      state.playerClass === 'arcanista' ||
      (state.talents.mente_analitica ?? 0) > 0 ||
      hasRuneFocus,
    shopDiscountPct: Math.min(
      0.6,
      (state.talents.barganha ?? 0) * 0.1 + (hasRuneTrade ? 0.15 : 0),
    ),
    itemSaveChance: state.playerClass === 'alquimista' ? 0.25 : 0,
  }

  const questsWithProgress = SIDE_QUESTS.map((quest) => ({
    ...quest,
    done: getQuestDone(state, quest.id),
    claimed: state.claimedQuests.includes(quest.id),
  }))

  const addInventoryItem = (inventory, itemId, qty) => {
    if (!itemId || !qty) return inventory
    const item = SHOP_ITEMS.find((entry) => entry.id === itemId)
    if (!item) return inventory

    const current = inventory[itemId] ?? 0
    return {
      ...inventory,
      [itemId]: Math.min(item.maxStack, current + qty),
    }
  }

  useEffect(() => {
    try {
      const now = Date.now()
      window.localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          state,
          hasCrown,
          updatedAt: now,
        }),
      )
      setLastSavedAt(now)
    } catch {
      // Persistencia falhou (quota/permissoes); o jogo segue sem bloquear a sessao.
    }
  }, [state, hasCrown])

  const resetCampaign = () => {
    const canReset =
      typeof window === 'undefined' ||
      window.confirm(
        'Deseja apagar todo o progresso e iniciar uma nova campanha?',
      )
    if (!canReset) return

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(SAVE_KEY)
      }
    } catch {
      // Se remover o save falhar, seguimos com reset em memoria.
    }

    setState(INITIAL_STATE)
    setHasCrown(false)
    setScreen('home')
    setStarResult(null)
    setPendingPhaseId(null)
    setPreviousScreen('map')
    setLastSavedAt(null)
  }

  const startPhaseBriefing = (phaseId) => {
    setState((s) => ({ ...s, hp: INITIAL_HP[phaseId] }))
    setPendingPhaseId(phaseId)
    setScreen('phase_briefing')
  }

  const openScreen = (id) => {
    const normalizedId = id === 'grimorio' ? 'grimoire' : id
    setPreviousScreen(screen)
    if (
      ['home', 'map', 'shop', 'grimoire', 'tutorial'].includes(normalizedId)
    ) {
      setPendingPhaseId(null)
      setScreen(normalizedId)
      return
    }

    if (phaseIds.includes(normalizedId)) {
      if (!isUnlocked(normalizedId, state.done, state.stars)) {
        setScreen('map')
        return
      }
      startPhaseBriefing(normalizedId)
    }
  }

  const consumeItem = (itemId) => {
    const shouldPreserve = Math.random() < rpgModifiers.itemSaveChance
    if (shouldPreserve) return

    setState((s) => ({
      ...s,
      inventory: {
        ...s.inventory,
        [itemId]: Math.max(0, (s.inventory[itemId] ?? 0) - 1),
      },
    }))
  }

  const itemStatus = (itemId, currentBossId = null) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId)
    if (!item) return { can: false, qty: 0 }
    const qty = state.inventory[itemId] ?? 0

    let can = qty > 0
    if (item.availableOnlyIn && !item.availableOnlyIn.includes(currentBossId))
      can = false
    if (currentBossId && item.blockedInBosses.includes(currentBossId))
      can = false
    if (currentBossId === 'ALL') can = false

    return { can, qty }
  }

  const chooseClass = (classId) => {
    if (!KNOWN_CLASS_IDS.has(classId)) return
    setState((s) => ({ ...s, playerClass: classId }))
  }

  const spendTalentPoint = (talentId) => {
    const talent = TALENT_TREE.find((entry) => entry.id === talentId)
    if (!talent) return
    if (availableTalentPoints <= 0) return

    const currentRank = state.talents[talentId] ?? 0
    if (currentRank >= talent.maxRank) return

    setState((s) => ({
      ...s,
      talents: {
        ...s.talents,
        [talentId]: (s.talents[talentId] ?? 0) + 1,
      },
      spentTalentPoints: s.spentTalentPoints + 1,
    }))
  }

  const setLoadoutRune = (slotKey, runeId) => {
    if (!['slot1', 'slot2'].includes(slotKey)) return
    setState((s) => {
      const next = { ...(s.loadout ?? { slot1: null, slot2: null }) }
      const current = next[slotKey]
      if (current === runeId) {
        next[slotKey] = null
        return { ...s, loadout: next }
      }

      const otherSlot = slotKey === 'slot1' ? 'slot2' : 'slot1'
      if (next[otherSlot] === runeId) {
        next[otherSlot] = null
      }
      next[slotKey] = runeId
      return { ...s, loadout: next }
    })
  }

  const claimQuestReward = (questId) => {
    const quest = SIDE_QUESTS.find((entry) => entry.id === questId)
    if (!quest) return
    if (state.claimedQuests.includes(questId)) return
    if (!getQuestDone(state, questId)) return

    setState((s) => ({
      ...s,
      xp: s.xp + (quest.reward.xp ?? 0),
      gold: s.gold + (quest.reward.gold ?? 0),
      inventory: addInventoryItem(
        s.inventory,
        quest.reward.itemId,
        quest.reward.itemQty ?? 0,
      ),
      claimedQuests: [...s.claimedQuests, questId],
    }))
  }

  const gainReputation = (phaseId, amount) => {
    const npcId = PHASE_TO_NPC[phaseId]
    if (!npcId) return

    setState((s) => ({
      ...s,
      reputation: {
        ...(s.reputation ?? {}),
        [npcId]: Math.min(
          MAX_REPUTATION,
          (s.reputation?.[npcId] ?? 0) + amount,
        ),
      },
    }))
  }

  const finishNormalPhase = (phaseId, score, totalQuestions, hp) => {
    const stars = calcStars(hp, INITIAL_HP[phaseId], score, totalQuestions)
    setState((s) => ({
      ...s,
      done: s.done.includes(phaseId) ? s.done : [...s.done, phaseId],
      stars: {
        ...s.stars,
        [phaseId]: Math.max(stars, s.stars[phaseId] ?? 0),
      },
    }))
    gainReputation(phaseId, 1)
    setStarResult({ title: `${phaseId.toUpperCase()} concluída!`, stars })
  }

  const finishBoss = (win, score, totalQuestions, hp, boss) => {
    if (!win) {
      setScreen('map')
      setState((s) => ({ ...s, hp: 3 }))
      return
    }

    const stars = calcStars(hp, INITIAL_HP[boss.id], score, totalQuestions)
    setState((s) => ({
      ...s,
      xp: s.xp + boss.rewardXp,
      gold: s.gold + boss.rewardGold,
      done: s.done.includes(boss.id) ? s.done : [...s.done, boss.id],
      stars: { ...s.stars, [boss.id]: Math.max(stars, s.stars[boss.id] ?? 0) },
    }))

    gainReputation(boss.id, 2)

    if (boss.specialReward === 'crown') setHasCrown(true)
    setStarResult({ title: `${boss.name} derrotado!`, stars })
  }

  const sharedProps = {
    state,
    setState,
    consumeItem,
    itemStatus,
    rpgModifiers,
  }

  return (
    <div className="app" style={{ fontFamily: G.font }}>
      {screen !== 'home' && (
        <TopBar
          xp={state.xp}
          gold={state.gold}
          hp={state.hp}
          hasCrown={hasCrown}
          musicEnabled={musicEnabled}
          musicVolume={musicVolume}
          onToggleMusic={toggleMusic}
          onMusicVolume={setMusicVolume}
        />
      )}

      <main className={`content route-${screen}`}>
        <div key={screen} className="screen-transition">
          {screen === 'home' && (
            <HomeScreen
              state={state}
              quests={questsWithProgress}
              availableTalentPoints={availableTalentPoints}
              onChooseClass={chooseClass}
              onSpendTalent={spendTalentPoint}
              onClaimQuest={claimQuestReward}
              onStart={() => openScreen('map')}
              onOpenMap={() => openScreen('map')}
              onOpenShop={() => openScreen('shop')}
              onOpenGrimoire={() => openScreen('grimoire')}
              onResetCampaign={resetCampaign}
              lastSavedAt={lastSavedAt}
            />
          )}

          {screen === 'map' && <MapScreen state={state} onOpen={openScreen} />}

          {screen === 'phase_briefing' && pendingPhaseId && (
            <PhaseBriefingScreen
              phase={MAP_NODES.find((node) => node.id === pendingPhaseId)}
              briefing={PHASE_BRIEFINGS[pendingPhaseId]}
              playerState={state}
              onContinue={() => {
                const targetPhase = pendingPhaseId
                setPendingPhaseId(null)
                setScreen(targetPhase)
              }}
              onCancel={() => {
                setPendingPhaseId(null)
                setScreen('map')
              }}
            />
          )}

          {screen === 'forge' && (
            <ForgeScreen
              {...sharedProps}
              onComplete={finishNormalPhase}
              itemStatus={(id) => itemStatus(id)}
              onExit={() => setScreen('map')}
            />
          )}

          {screen === 'usub' && (
            <WizardScreen
              {...sharedProps}
              phaseId="usub"
              phaseName="U-SUB"
              color={G.orange}
              questions={USUB_Q}
              onComplete={finishNormalPhase}
              itemStatus={(id) => itemStatus(id)}
              onExit={() => setScreen('map')}
            />
          )}

          {screen === 'parts' && (
            <WizardScreen
              {...sharedProps}
              phaseId="parts"
              phaseName="PARTES"
              color={G.pink}
              questions={PARTS_Q}
              onComplete={finishNormalPhase}
              itemStatus={(id) => itemStatus(id)}
              onExit={() => setScreen('map')}
            />
          )}

          {screen === 'measure' && (
            <MeasureScreen
              {...sharedProps}
              onComplete={finishNormalPhase}
              itemStatus={(id) => itemStatus(id)}
              onExit={() => setScreen('map')}
            />
          )}

          {screen === 'connect' && (
            <ConnectScreen
              {...sharedProps}
              onComplete={finishNormalPhase}
              itemStatus={(id) => itemStatus(id)}
              onExit={() => setScreen('map')}
            />
          )}

          {screen === 'shop' && (
            <ShopScreen
              state={state}
              setState={setState}
              inPhase={false}
              onNavigate={openScreen}
              rpgModifiers={rpgModifiers}
              onSetLoadoutRune={setLoadoutRune}
            />
          )}
          {screen === 'grimoire' && (
            <GrimorioScreen
              state={state}
              entries={state.grimoire}
              onNavigate={openScreen}
            />
          )}
          {screen === 'tutorial' && (
            <TutorialScreen state={state} onNavigate={openScreen} />
          )}

          {bossIds.includes(screen) && (
            <BossScreen
              boss={BOSS_CONFIG[screen]}
              state={state}
              setState={setState}
              onFinish={finishBoss}
              itemStatusBase={itemStatus}
              consumeItem={consumeItem}
              rpgModifiers={rpgModifiers}
              onExit={() => setScreen('map')}
            />
          )}
        </div>
      </main>

      {starResult && (
        <StarScreen
          stars={starResult.stars}
          title={starResult.title}
          onClose={() => {
            setStarResult(null)
            setScreen('map')
            setState((s) => ({ ...s, hp: 3 }))
          }}
        />
      )}
    </div>
  )
}
