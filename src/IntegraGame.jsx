import { useState } from 'react'
import {
  BossScreen,
  ConnectScreen,
  ForgeScreen,
  GrimorioScreen,
  HomeScreen,
  MapScreen,
  MeasureScreen,
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
  PARTS_Q,
  SHOP_ITEMS,
  USUB_Q,
} from './gameData'
import { calcStars, isUnlocked } from './gameUtils'
import './styles/game.css'

export default function IntegraGame() {
  const [state, setState] = useState(INITIAL_STATE)
  const [screen, setScreen] = useState('home')
  const [starResult, setStarResult] = useState(null)
  const [hasCrown, setHasCrown] = useState(false)
  const [previousScreen, setPreviousScreen] = useState('map')

  const bossIds = ['boss_forge', 'boss_usub_parts', 'boss_final']

  const openScreen = (id) => {
    const normalizedId = id === 'grimorio' ? 'grimoire' : id
    setPreviousScreen(screen)
    if (
      ['home', 'map', 'shop', 'grimoire', 'tutorial'].includes(normalizedId)
    ) {
      setScreen(normalizedId)
      return
    }

    if (
      ['forge', 'usub', 'measure', 'connect', 'parts', ...bossIds].includes(
        normalizedId,
      )
    ) {
      if (!isUnlocked(normalizedId, state.done, state.stars)) {
        setScreen('map')
        return
      }
      setState((s) => ({ ...s, hp: INITIAL_HP[normalizedId] }))
      setScreen(normalizedId)
    }
  }

  const consumeItem = (itemId) => {
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

    if (boss.specialReward === 'crown') setHasCrown(true)
    setStarResult({ title: `${boss.name} derrotado!`, stars })
  }

  const sharedProps = {
    state,
    setState,
    consumeItem,
    itemStatus,
  }

  return (
    <div className="app" style={{ fontFamily: G.font }}>
      {screen !== 'home' && (
        <TopBar
          xp={state.xp}
          gold={state.gold}
          hp={state.hp}
          hasCrown={hasCrown}
        />
      )}

      <main className="content">
        {screen === 'home' && (
          <HomeScreen
            state={state}
            onStart={() => openScreen('map')}
            onOpenMap={() => openScreen('map')}
            onOpenShop={() => openScreen('shop')}
            onOpenGrimoire={() => openScreen('grimoire')}
          />
        )}

        {screen === 'map' && <MapScreen state={state} onOpen={openScreen} />}

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
            onBack={() => setScreen(previousScreen)}
          />
        )}
        {screen === 'grimoire' && (
          <GrimorioScreen
            entries={state.grimoire}
            onBack={() => setScreen(previousScreen)}
          />
        )}
        {screen === 'tutorial' && (
          <TutorialScreen
            state={state}
            onBack={() => setScreen(previousScreen)}
          />
        )}

        {bossIds.includes(screen) && (
          <BossScreen
            boss={BOSS_CONFIG[screen]}
            state={state}
            setState={setState}
            onFinish={finishBoss}
            itemStatusBase={itemStatus}
            consumeItem={consumeItem}
            onExit={() => setScreen('map')}
          />
        )}
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
