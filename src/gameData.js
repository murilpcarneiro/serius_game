export const G = {
  bg: '#05050f',
  surface: '#0c0c1e',
  surfaceHigh: '#12122a',
  surfaceMid: '#181832',
  border: '#1e1e42',
  borderHi: '#2e2e58',
  accent: '#c084fc',
  green: '#4ade80',
  blue: '#38bdf8',
  gold: '#fbbf24',
  orange: '#fb923c',
  pink: '#f472b6',
  red: '#f87171',
  text: '#f1f5f9',
  muted: '#64748b',
  font: "'IBM Plex Mono', 'Courier New', monospace",
  display: "'Orbitron', monospace",
}

export const INITIAL_HP = {
  forge: 3,
  usub: 3,
  parts: 3,
  measure: 3,
  connect: 3,
  boss_forge: 1,
  boss_usub_parts: 1,
  boss_final: 1,
}

export const INITIAL_STATE = {
  xp: 0,
  gold: 0,
  hp: 3,
  done: [],
  stars: {},
  grimoire: [],
  inventory: {},
}

export const SHOP_ITEMS = [
  {
    id: 'potion_eliminate',
    name: 'Poção de Eliminar',
    icon: '🧪',
    cost: 30,
    currency: 'xp',
    description:
      'Remove 1 alternativa incorreta em questões de múltipla escolha.',
    maxStack: 3,
    blockedInBosses: ['boss_forge', 'boss_usub_parts'],
    pedagogicNote: 'Reduz carga de opções sem revelar a lógica da resposta.',
  },
  {
    id: 'potion_hint',
    name: 'Poção de Dica',
    icon: '💡',
    cost: 50,
    currency: 'xp',
    description: 'Exibe a dica do conceito relevante para a questão atual.',
    maxStack: 3,
    blockedInBosses: ['boss_usub_parts'],
    pedagogicNote: 'Conecta o erro ao conceito sem entregar a resposta.',
  },
  {
    id: 'shield_life',
    name: 'Escudo de Vida',
    icon: '🛡',
    cost: 60,
    currency: 'xp',
    description: 'Protege contra 1 erro sem perder vida. Uso único por fase.',
    maxStack: 3,
    blockedInBosses: [],
    pedagogicNote: 'Permite tentativa sem punição total; incentiva arriscar.',
  },
  {
    id: 'hourglass',
    name: 'Ampulheta',
    icon: '⏳',
    cost: 40,
    currency: 'xp',
    description: 'Adiciona +30 segundos ao cronômetro em fases Boss.',
    maxStack: 3,
    blockedInBosses: [],
    pedagogicNote: 'Reduz pressão de tempo sem eliminar o desafio.',
  },
  {
    id: 'scroll_mage',
    name: 'Pergaminho do Mago',
    icon: '📜',
    cost: 80,
    currency: 'xp',
    description:
      'Revela o primeiro passo correto de um wizard (U-SUB ou PARTES).',
    maxStack: 3,
    blockedInBosses: ['boss_final'],
    pedagogicNote: 'Scaffolding: ancora o raciocínio sem completar a solução.',
  },
  {
    id: 'crystal_review',
    name: 'Cristal de Revisão',
    icon: '🔮',
    cost: 2,
    currency: 'gold',
    description:
      'Abre uma questão aleatória do Grimório para revisão antes de uma fase.',
    maxStack: 3,
    blockedInBosses: [],
    pedagogicNote: 'Aproveita os erros registrados como treino dirigido.',
  },
  {
    id: 'amulet_return',
    name: 'Amuleto de Retorno',
    icon: '🔄',
    cost: 5,
    currency: 'gold',
    description: 'Permite uma segunda tentativa em um Boss sem voltar ao mapa.',
    maxStack: 2,
    blockedInBosses: [],
    pedagogicNote: 'Reduz penalidade de derrota; incentiva continuar jogando.',
  },
  {
    id: 'elixir_supreme',
    name: 'Elixir Supremo',
    icon: '✨',
    cost: 10,
    currency: 'gold',
    description:
      'Desbloqueia TODAS as dicas no Boss Final. Uso único na campanha.',
    maxStack: 1,
    blockedInBosses: [],
    availableOnlyIn: ['boss_final'],
    pedagogicNote:
      'Item de emergência para jogadores travados; custo alto garante exceção.',
  },
]

export const FORGE_Q = [
  {
    biome: 'Floresta da Potencia',
    story:
      'Ao entrar na Floresta da Potencia, voce encontra as raizes-selo que protegem a trilha principal. Para ativar o primeiro selo e abrir passagem, determine a funcao de acumulacao F(x) para f(x)=x^2.',
    display: '∫ x² dx',
    pieces: ['x³/3', '+C', 'x²/2', '2x', '3x²'],
    answer: ['x³/3', '+C'],
    hint: 'Regra da potência: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C',
    ok: 'Escudo conjurado! F(x) = x³/3 + C',
    xp: 30,
  },
  {
    biome: 'Floresta da Potencia',
    story:
      'Com o primeiro selo aceso, a comitiva segue por uma trilha ancestral. A resistencia magica do caminho cresce como 4x^3 por passo. Encontre a antiderivada para estimar o esforco total da marcha.',
    display: '∫ 4x³ dx',
    pieces: ['x⁴', '+C', '4x²', 'x³', '12x²'],
    answer: ['x⁴', '+C'],
    hint: '∫4x³ = 4·x⁴/4 = x⁴. O coeficiente cancela com n+1=4.',
    ok: 'Esforço mapeado! F(x) = x⁴ + C',
    xp: 30,
  },
  {
    biome: 'Floresta da Potencia',
    story:
      'No limite da floresta, um canal antigo bloqueia o exercito aliado. O fluxo encantado segue v(x)=6x. Calcule a funcao acumulada para erguer a comporta e liberar o acesso para as regioes centrais.',
    display: '∫ 6x dx',
    pieces: ['3x²', '+C', '6x²', 'x²/2', '6'],
    answer: ['3x²', '+C'],
    hint: '∫6x dx = 6·x²/2 + C = 3x² + C',
    ok: 'Comporta aberta! V(x) = 3x² + C',
    xp: 30,
  },
]

export const USUB_Q = [
  {
    biome: 'Caverna da Mudanca',
    story:
      'Depois de cruzar a floresta, a expedicao entra na Caverna da Mudanca, onde cristais runicos alimentam o proximo portao. A carga segue f(x)=2x(x^2+1)^4. Use substituicao para decifrar o mecanismo.',
    display: '∫ 2x·(x²+1)⁴ dx',
    xp: 45,
    hint: 'Observe o termo interno x²+1 e sua derivada 2x dx.',
    ok: 'Cristal desvendado! ∫2x(x²+1)⁴dx = (x²+1)⁵/5 + C',
    steps: [
      {
        prompt: 'Defina u. Qual é a substituição correta?',
        options: ['u = x²+1', 'u = 2x', 'u = (x²+1)⁴', 'u = x²'],
        correct: 'u = x²+1',
        explain: 'u = x²+1 pois sua derivada du = 2x dx aparece no integrando.',
      },
      {
        prompt: 'Se u = x²+1, então du = ?',
        options: ['2x dx', '2 dx', 'x dx', 'dx'],
        correct: '2x dx',
        explain:
          'Derivando u=x²+1: du/dx = 2x → du = 2x dx. Aparece exatamente no integrando!',
      },
      {
        prompt: 'Após substituir, a integral em u fica:',
        options: ['∫ u⁴ du', '∫ u⁴ 2x du', '∫ u⁵ du', '∫ 2u⁴ du'],
        correct: '∫ u⁴ du',
        explain: '2x dx = du, então ∫2x·(x²+1)⁴dx = ∫u⁴ du.',
      },
      {
        prompt: 'Resolva ∫ u⁴ du =',
        options: ['u⁵/5 + C', 'u⁵ + C', '4u³ + C', 'u⁴/4 + C'],
        correct: 'u⁵/5 + C',
        explain: 'Regra da potência: ∫uⁿ du = uⁿ⁺¹/(n+1). Logo u⁵/5 + C.',
      },
      {
        prompt: 'Voltando a x, a resposta final é:',
        options: ['(x²+1)⁵/5 + C', '(x²+1)⁵ + C', 'x¹⁰/5 + C', '(2x)⁵/5 + C'],
        correct: '(x²+1)⁵/5 + C',
        explain: 'Substituindo u=x²+1 de volta: u⁵/5+C = (x²+1)⁵/5 + C.',
      },
    ],
  },
  {
    biome: 'Caverna da Mudanca',
    story:
      'No coracao da caverna, um rio de fogo divide o grupo. As runas da ponte exigem resolver ∫cos(3x)dx. Aplique a substituicao correta para completar a travessia sem colapso.',
    display: '∫ cos(3x) dx',
    xp: 45,
    hint: 'Use u = 3x para remover a composição no cosseno.',
    ok: 'Rio cruzado! ∫cos(3x)dx = sen(3x)/3 + C',
    steps: [
      {
        prompt: 'Defina u. Qual é a substituição correta?',
        options: ['u = 3x', 'u = cos(x)', 'u = 3', 'u = x'],
        correct: 'u = 3x',
        explain: 'u = 3x pois é o argumento interno da função.',
      },
      {
        prompt: 'Se u = 3x, então du = ?',
        options: ['3 dx', 'dx', '3x dx', 'cos(3x) dx'],
        correct: '3 dx',
        explain: 'du/dx = 3 → du = 3 dx → dx = du/3.',
      },
      {
        prompt: 'A integral em u fica:',
        options: [
          '(1/3)∫ cos(u) du',
          '∫ cos(u) du',
          '3∫ cos(u) du',
          '∫ cos(u/3) du',
        ],
        correct: '(1/3)∫ cos(u) du',
        explain: 'dx = du/3, então ∫cos(3x)dx = ∫cos(u)·du/3 = (1/3)∫cos(u)du.',
      },
      {
        prompt: '(1/3)∫ cos(u) du =',
        options: [
          'sen(u)/3 + C',
          'cos(u)/3 + C',
          '-sen(u)/3 + C',
          'sen(u) + C',
        ],
        correct: 'sen(u)/3 + C',
        explain: '∫cos(u)du = sen(u) + C. Multiplicando por 1/3: sen(u)/3 + C.',
      },
      {
        prompt: 'Resultado final em x:',
        options: [
          'sen(3x)/3 + C',
          'cos(3x)/3 + C',
          'sen(3x) + C',
          '-sen(3x)/3 + C',
        ],
        correct: 'sen(3x)/3 + C',
        explain: 'Substituindo u=3x de volta: sen(u)/3+C = sen(3x)/3 + C.',
      },
    ],
  },
]

export const PARTS_Q = [
  {
    biome: 'Torre das Partes',
    story:
      'Com a caverna estabilizada, o grupo chega a Torre das Partes. Para acionar o elevador interno, e preciso sintetizar o reagente de impulso resolvendo ∫x·e^x dx por integracao por partes.',
    display: '∫ x·eˣ dx',
    xp: 55,
    hint: 'Por LIATE, escolha u = x e dv = eˣ dx.',
    ok: 'Poção sintetizada! ∫x·eˣdx = x·eˣ − eˣ + C = eˣ(x−1) + C',
    steps: [
      {
        prompt: 'Escolha u (deve ser fácil de derivar):',
        options: ['u = x', 'u = eˣ', 'u = x·eˣ', 'u = 1'],
        correct: 'u = x',
        explain:
          'Pela regra LIATE (Logarítmica, Inversa, Algébrica, Trigonométrica, Exponencial), escolhemos u = x (algébrica).',
      },
      {
        prompt: 'Se u = x, então dv = ? e v = ?',
        options: [
          'dv = eˣ dx, v = eˣ',
          'dv = eˣ dx, v = eˣ+1',
          'dv = x dx, v = x²/2',
          'dv = dx, v = x',
        ],
        correct: 'dv = eˣ dx, v = eˣ',
        explain: 'O que sobra é dv = eˣ dx. Integrando: v = eˣ.',
      },
      {
        prompt: 'Aplique ∫u dv = uv − ∫v du. Qual é uv?',
        options: ['x·eˣ', 'eˣ', 'x²·eˣ', 'x·eˣ/2'],
        correct: 'x·eˣ',
        explain: 'uv = x · eˣ = x·eˣ.',
      },
      {
        prompt: 'du = dx pois u=x. Qual é ∫v du = ∫eˣ dx?',
        options: ['eˣ + C', 'xeˣ + C', 'eˣ/x + C', 'x·eˣ + C'],
        correct: 'eˣ + C',
        explain: '∫eˣ dx = eˣ + C. Simples!',
      },
      {
        prompt: 'Resultado final: uv − ∫v du =',
        options: [
          'x·eˣ − eˣ + C',
          'x·eˣ + eˣ + C',
          'eˣ − x·eˣ + C',
          'x²·eˣ/2 + C',
        ],
        correct: 'x·eˣ − eˣ + C',
        explain: '∫x·eˣdx = x·eˣ − eˣ + C = eˣ(x−1) + C.',
      },
    ],
  },
  {
    biome: 'Torre das Partes',
    story:
      'No ultimo andar da torre, o cofre dos mapas de guerra so abre com o calculo de ∫x·cos(x)dx. Resolva por partes para recuperar as coordenadas do Templo do TFC.',
    display: '∫ x·cos(x) dx',
    xp: 55,
    hint: 'Escolha u = x e dv = cos(x) dx.',
    ok: 'Cofre aberto! ∫x·cos(x)dx = x·sen(x) + cos(x) + C',
    steps: [
      {
        prompt: 'Escolha u (algébrica antes de trigonométrica):',
        options: ['u = x', 'u = cos(x)', 'u = x·cos(x)', 'u = sen(x)'],
        correct: 'u = x',
        explain:
          'Pela LIATE, a função algébrica x vem antes de cos(x). Logo u = x.',
      },
      {
        prompt: 'dv = cos(x) dx → v = ?',
        options: ['sen(x)', 'cos(x)', '-sen(x)', '−cos(x)'],
        correct: 'sen(x)',
        explain: '∫cos(x)dx = sen(x). Logo v = sen(x).',
      },
      {
        prompt: 'uv = ?',
        options: ['x·sen(x)', 'x·cos(x)', 'sen(x)', 'x²·sen(x)'],
        correct: 'x·sen(x)',
        explain: 'uv = u·v = x·sen(x).',
      },
      {
        prompt: 'du = dx. Calcule ∫v du = ∫ sen(x) dx:',
        options: ['−cos(x) + C', 'cos(x) + C', 'sen(x) + C', '−sen(x) + C'],
        correct: '−cos(x) + C',
        explain: '∫sen(x)dx = −cos(x) + C.',
      },
      {
        prompt: 'Resultado final:',
        options: [
          'x·sen(x) + cos(x) + C',
          'x·sen(x) − cos(x) + C',
          'x·cos(x) + sen(x) + C',
          '−x·cos(x) + sen(x) + C',
        ],
        correct: 'x·sen(x) + cos(x) + C',
        explain:
          'uv − ∫v du = x·sen(x) − (−cos(x)) + C = x·sen(x) + cos(x) + C.',
      },
    ],
  },
]

export const MEASURE_Q = [
  {
    biome: 'Planicie da Area',
    story:
      'Enquanto parte da equipe sobe a torre, os batedores mapeiam a Planicie da Area. A regiao protegida por f(x)=x^2 entre 0 e 3 define onde sera erguida a defesa avancada. Calcule a area total para planejar recursos.',
    fn: (x) => x * x,
    label: 'f(x) = x²',
    a: 0,
    b: 3,
    real: 9,
    antideriv: 'F(x) = x³/3',
    hint: 'F(3) − F(0) = 27/3 − 0 = 9 km²',
    ok: 'Área calculada! O arquiteto pode iniciar a pavimentação.',
    xp: 50,
  },
  {
    biome: 'Planicie da Area',
    story:
      'Na segunda frente da planicie, a rampa de artilharia segue f(x)=2x entre 0 e 4. O comandante precisa da area sob a curva para posicionar as catapultas e manter a linha de defesa.',
    fn: (x) => 2 * x,
    label: 'f(x) = 2x',
    a: 0,
    b: 4,
    real: 16,
    antideriv: 'F(x) = x²',
    hint: 'F(4) − F(0) = 16 − 0 = 16 unidades²',
    ok: 'Posicionamento calculado! As catapultas estão prontas.',
    xp: 50,
  },
]

export const CONNECT_Q = [
  {
    biome: 'Templo do TFC',
    story:
      'Com os mapas da torre em maos, o grupo alcanca o Templo do TFC. A ponte principal responde apenas ao calculo exato da area por Teorema Fundamental. Resolva para liberar a passagem ao santuario interno.',
    integral: '∫₀⁴ x² dx',
    options: ['x³/3 + C', 'x²/2 + C', '3x² + C'],
    correct: 'x³/3 + C',
    a: 0,
    b: 4,
    Fb: '64/3',
    Fa: '0',
    realNum: 64 / 3,
    realResult: '≈21.33',
    hint: 'F(4) = 64/3 ≈ 21.33 · F(0) = 0',
    ok: 'Ponte liberada! Área = 64/3 ≈ 21.33',
    xp: 60,
  },
  {
    biome: 'Templo do TFC',
    story:
      'No nucleo do templo, um portal antigo precisa de energia acumulada para abrir o caminho final. A fonte segue e(x)=2x de 1 a 3. Calcule corretamente para completar o ritual.',
    integral: '∫₁³ 2x dx',
    options: ['x² + C', '2x² + C', 'x²/2 + C'],
    correct: 'x² + C',
    a: 1,
    b: 3,
    Fb: '9',
    Fa: '1',
    realNum: 8,
    realResult: '8',
    hint: 'F(3) = 9 · F(1) = 1 · 9−1 = 8 unidades',
    ok: 'Portal ativado! Energia total = 8 unidades.',
    xp: 60,
  },
]

export const BOSS_CONFIG = {
  boss_forge: {
    id: 'boss_forge',
    name: 'Guardião das Raízes',
    biome: 'Guardiao das Raizes',
    story:
      'Ao deixar a floresta, o Guardiao das Raizes desperta para impedir o avanco. O duelo testa tudo que foi aprendido em potencia; um erro e o selo da floresta se fecha novamente.',
    hp: 1,
    timePerQuestion: 90,
    blockedItems: ['potion_eliminate'],
    rewardXp: 80,
    rewardGold: 2,
    questions: FORGE_Q.map((q) => ({ ...q, kind: 'forge' })),
  },
  boss_usub_parts: {
    id: 'boss_usub_parts',
    name: 'Arquimago da Caverna',
    biome: 'Arquimago da Caverna',
    story:
      'No limiar entre Torre e Templo, o Arquimago da Caverna controla os rituais de substituicao e partes. Neste confronto, ele neutraliza atalhos e exige dominio tecnico completo.',
    hp: 1,
    timePerQuestion: 75,
    blockedItems: ['potion_hint', 'potion_eliminate'],
    rewardXp: 100,
    rewardGold: 3,
    questions: [
      { ...USUB_Q[0], kind: 'wizard', family: 'U-SUB' },
      { ...PARTS_Q[0], kind: 'wizard', family: 'PARTES' },
      { ...CONNECT_Q[0], kind: 'connect' },
    ],
  },
  boss_final: {
    id: 'boss_final',
    name: 'O Integral Supremo',
    biome: 'O Integral Supremo',
    story:
      'No santuario final, O Integral Supremo condensa todas as tecnicas em um unico ritual. O tempo e curto, os itens sao restritos e cada decisao define o destino da campanha.',
    hp: 1,
    timePerQuestion: 60,
    blockedItems: ['ALL'],
    rewardXp: 150,
    rewardGold: 5,
    specialReward: 'crown',
    questions: [
      {
        kind: 'wizard',
        family: 'U-SUB',
        biome: 'O Integral Supremo',
        story:
          'Primeiro selo do santuario: uma integral definida com mudanca de variavel e ajuste correto de limites. Sem esse selo, as camaras finais permanecem trancadas.',
        display: '∫₀¹ 2x·(x²+1)² dx',
        hint: 'Use u = x²+1, então quando x=0 u=1 e quando x=1 u=2.',
        steps: [
          {
            prompt: 'Escolha a substituição correta:',
            options: ['u = x²+1', 'u = 2x', 'u = (x²+1)²', 'u = x²'],
            correct: 'u = x²+1',
            explain: 'u=x²+1, com du=2x dx.',
          },
          {
            prompt: 'Com u=x²+1, os novos limites são:',
            options: ['1 a 2', '0 a 1', '0 a 2', '1 a 3'],
            correct: '1 a 2',
            explain: 'x=0 → u=1; x=1 → u=2.',
          },
          {
            prompt: 'A integral vira:',
            options: ['∫₁² u² du', '∫₀¹ u² du', '∫₁² 2u du', '∫₁² u du'],
            correct: '∫₁² u² du',
            explain: '2x dx = du, então sobra u².',
          },
          {
            prompt: 'Uma antiderivada é:',
            options: ['u³/3', 'u²/2', '2u', 'u³'],
            correct: 'u³/3',
            explain: 'Regra da potência.',
          },
          {
            prompt: 'Valor final:',
            options: ['7/3', '8/3', '1', '4/3'],
            correct: '7/3',
            explain: '(2³−1³)/3 = 7/3.',
          },
        ],
      },
      { ...PARTS_Q[1], kind: 'wizard', family: 'PARTES' },
      { ...CONNECT_Q[1], kind: 'connect' },
    ],
  },
}

export const MAP_NODES = [
  {
    id: 'forge',
    name: 'Floresta da Potência',
    type: 'bioma',
    color: '#4ade80',
    x: 160,
    y: 210,
  },
  {
    id: 'usub',
    name: 'Caverna da Mudança',
    type: 'bioma',
    color: '#fb923c',
    x: 360,
    y: 140,
  },
  {
    id: 'measure',
    name: 'Planície da Área',
    type: 'bioma',
    color: '#38bdf8',
    x: 360,
    y: 330,
  },
  {
    id: 'boss_forge',
    name: 'Guardião das Raízes',
    type: 'boss',
    color: '#f87171',
    x: 560,
    y: 225,
  },
  {
    id: 'parts',
    name: 'Torre das Partes',
    type: 'bioma',
    color: '#f472b6',
    x: 760,
    y: 125,
  },
  {
    id: 'connect',
    name: 'Templo do TFC',
    type: 'bioma',
    color: '#c084fc',
    x: 760,
    y: 340,
  },
  {
    id: 'boss_usub_parts',
    name: 'Arquimago da Caverna',
    type: 'boss',
    color: '#f87171',
    x: 980,
    y: 230,
  },
  {
    id: 'boss_final',
    name: 'O Integral Supremo',
    type: 'boss',
    color: '#fbbf24',
    x: 1120,
    y: 170,
  },
]

export const MAP_EDGES = [
  ['forge', 'usub'],
  ['forge', 'measure'],
  ['forge', 'boss_forge'],
  ['boss_forge', 'parts'],
  ['usub', 'connect'],
  ['measure', 'connect'],
  ['parts', 'boss_usub_parts'],
  ['connect', 'boss_usub_parts'],
  ['boss_usub_parts', 'boss_final'],
]
