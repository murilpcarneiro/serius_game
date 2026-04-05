import { isUnlocked } from '../gameUtils'

export function getCampaignBeat(state, completedCount) {
  const done = state.done ?? []
  if (done.includes('boss_final')) {
    return {
      chapter: 'Capitulo Final Conquistado',
      tone: 'A Coroa Arcana foi restaurada, os tres selos foram protegidos e a Ordem da Integral voltou ao equilibrio.',
      nextAction:
        'Aprimore estrelas e contratos para completar a campanha em 100%.',
    }
  }

  if (completedCount === 0) {
    return {
      chapter: 'Prologo: O Chamado do Calculo',
      tone: 'Seu objetivo e recuperar a Coroa Arcana antes que o Integral Supremo quebre seus selos.',
      nextAction:
        'Inicie no mapa, conclua FORGE e marche rumo ao Primeiro Selo.',
    }
  }

  if (completedCount <= 2) {
    return {
      chapter: 'Ato I: Trilhas da Fundicao',
      tone: 'Os fundamentos foram despertos: agora voce precisa consolidar tecnica para derrubar o Guardiao das Raizes.',
      nextAction:
        'Busque 3 estrelas nas fases iniciais e prepare-se para o Primeiro Selo.',
    }
  }

  if (completedCount <= 5) {
    return {
      chapter: 'Ato II: Ruptura dos Guardioes',
      tone: 'Com o primeiro selo rompido, a campanha entra em risco e cada bioma alimenta sua chance contra o Segundo Selo.',
      nextAction:
        'Combine talentos, runas e contratos para vencer o Arquimago da Caverna.',
    }
  }

  return {
    chapter: 'Ato III: Ascensao Arcana',
    tone: 'Os dois primeiros selos foram garantidos; resta impedir que o Integral Supremo destrua o Ultimo Selo.',
    nextAction: 'Finalize os ultimos bosses e entre no Santuario do Limite.',
  }
}

export function sortQuestsByStatus(quests = []) {
  return [...quests].sort((a, b) => {
    const score = (quest) => (quest.claimed ? 2 : quest.done ? 0 : 1)
    return score(a) - score(b)
  })
}

export function buildSessionChecklist(state) {
  const hasAnyItem = Object.values(state.inventory ?? {}).some((qty) => qty > 0)
  return [
    {
      label: 'Escolher classe para ativar perk fixo',
      done: Boolean(state.playerClass),
    },
    {
      label: 'Concluir FORGE com 3 estrelas',
      done: (state.stars?.forge ?? 0) >= 3,
    },
    {
      label: 'Preparar inventario para desafios',
      done: hasAnyItem,
    },
    {
      label: 'Desbloquear o Guardiao das Raizes',
      done: isUnlocked('boss_forge', state.done, state.stars),
    },
  ]
}
