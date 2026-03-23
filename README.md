# ∫ntegra - Jogo Serio Educativo de Cálculo Integral

<div align="center">

![Integra](https://img.shields.io/badge/Jogo%20Serio-Educativo-purple)
![React](https://img.shields.io/badge/Powered%20by-React-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active%20Development-yellow)

**Um RPG educacional interativo para aprender Cálculo Integral de forma lúdica e gamificada.**

[Documentação Completa](#documentação) • [Como Executar](#como-executar) • [Recursos](#recursos) • [Contribuindo](#contribuindo)

</div>

---

## 🎮 Visão Geral

**∫ntegra** é um Jogo Serio (Serious Game) desenvolvido para o CESUPA que combina:

- 🎭 **Mecânicas de RPG**: Exploração, desbloqueio de fases, sistema de XP
- 📚 **Educação em Cálculo**: Problemas reais de integração com validação automática
- 🎪 **Gamificação**: Itens, loja, bosses, grimório de erros
- 📱 **Responsivo**: Funciona em mobile, tablet e desktop

### Objetivo Pedagógico

Ensinar **Cálculo Integral Fundamental** através de uma narrativa de exploração matemática, onde cada nível representa um bioma representando um método de integração diferente.

---

## 🚀 Como Executar

### Requisitos

- **Node.js** v16+
- **npm** v8+

### Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd serius_game

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação abrirá em `http://localhost:5173` (Vite)

### Build para Produção

```bash
# Crie a build otimizada
npm run build

# Visualize a build localmente
npm run preview
```

---

## 📁 Estrutura do Projeto

```
serius_game/
├── index.html              # HTML principal com meta tags otimizadas
├── package.json            # Dependências e scripts
├── vite.config.js          # Configuração Vite
├── src/
│   ├── main.jsx            # Entrada React com Error Boundary
│   ├── IntegraGame.jsx     # Componente principal
│   ├── gameData.js         # Dados de fases e integrais
│   ├── gameUtils.js        # Utilitários (validação, cálculo)
│   ├── styles/
│   │   └── game.css        # CSS com tema escuro gamificado
│   └── components/         # Componentes React (telas)
│       ├── MapScreen.jsx
│       ├── ForgeScreen.jsx
│       ├── ShopScreen.jsx
│       └── ... (outras telas)
├── docs/                   # Documentação
├── dist/                   # Build otimizada
└── IMPROVEMENTS.md         # Changelog de melhorias visuais
```

---

## 🎯 Telas Principais

### 1. **MapScreen** - Mapa de Biomas

- Árvore de desbloqueio visual
- 6 biomas (fases) + 3 bosses
- Status do jogador (level, XP, ouro)
- Sugestões de próximos passos

### 2. **ForgeScreen** - Fase Integral Indefinida

- Problemas de integração indefinida
- Validação com Sympy
- Sistema de 3 tentativas
- Hints contextuais

### 3. **USubScreen** - Fase Substituição

- Método u-substitution
- Validação de passo a passo
- Grimório de erros

### 4. **BossScreen** - Chefão Final

- 3 Bosses progressivos
- Múltiplos problemas por boss
- Recompensa em ouro/XP

### 5. **ShopScreen** - Loja de Itens

- Compra de itens com ouro
- Consumíveis e equipamentos
- Interface de inventory

### 6. **GrimorioScreen** - Histórico de Erros

- Registro de erros cometidos
- Dicas de revisão
- Estatísticas de desempenho

---

## 🎨 Design Visual

### Paleta de Cores

```
🟣 Primária (Roxo):      #c084fc
🔵 Secundária (Azul):    #38bdf8
🟡 Destaque (Ouro):      #fbbf24
🔴 Alerta (Vermelho):    #f87171
🟢 Sucesso (Verde):      #4ade80
⚫ Background:            #05050f
```

### Animações Gamificadas

- **slideInUp/Down/Left/Right** - Entradas de elementos
- **float-bounce** - Flutuação contínua (badges, ícones)
- **pulse-glow** - Brilho pulsante (nós do mapa)
- **glow-pulse** - Efeito de brilho em textos
- **shimmer** - Brilho passante (barras de progresso)
- **starPop** - Explosão de pop para estrelas
- **button-glow** - Brilho em botões ao hover

### Componentes UI

- Cards elevados com shadow dinâmico
- Botões com gradiente e glow
- Barras de progresso com shimmer
- Badges e tags com hover effects
- Scrollbars personalizadas em roxo

---

## 🎮 Mecânicas de Jogo

### Sistema de Level

- **Nível padrão**: 1 (pode aumentar)
- **XP necessária**: 100 XP por nível
- **Visualização**: Badge circular com animação de flutuação

### Moeda (Ouro)

- Ganhado ao completar fases
- Usado na loja para comprar itens
- Exibido no topo (top-bar)

### Itens

- **Consumíveis**: Aumentam tentativas/hints
- **Equipamentos**: Afetam mecânicas de jogo
- Podem ser comprados ou achados em fases

### Hints System

- 3 hints gratuitos por fase
- Compra de hints com ouro
- Hints contextuais para cada problema

### Grimório de Erros

- Registro automático de erros
- Categorização por tipo
- Dicas de revisão personalizadas

---

## 💻 Tecnologia

### Frontend

- **React 18+** - UI declarativa
- **Hooks** (useState, useEffect, useRef) - State management
- **CSS3** - Animações e responsividade
- **Vite** - Bundler rápido

### Validação

- **Sympy Integration** (via API externo) - Validação de integrais
- Suporte a LaTeX para renderização matemática

### Padrões de Código

- Single component architecture (IntegraGame.jsx)
- Functional components com hooks
- Error Boundary para proteção
- Props drilling minimizado

---

## 📚 Documentação

### Arquivos de Documentação

- **IMPROVEMENTS.md** - Changelog de melhorias visuais (v1.1)
- **intrega_prompt.md** - Especificações técnicas completas
- **docs/** - Notas de design e wireframes

### Como Contribuir

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para:

- Diretrizes de código
- Processo de pull requests
- Convenções de commit

---

## 🧪 Testes

### Teste Manual

```bash
# 1. Compile e execute localmente
npm run dev

# 2. Teste em diferentes dispositivos
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

# 3. Teste as telas principais
- [ ] MapScreen - navegação e desbloqueio
- [ ] ForgeScreen - resolução de integrais
- [ ] ShopScreen - compra de itens
- [ ] BossScreen - desafios finais
```

### Validação de Acessibilidade

```bash
# Lighthouse audit
npm run build
npx lighthouse http://localhost:5173 --view
```

---

## 🐛 Troubleshooting

### Problema: "Cannot find module 'react'"

**Solução:**

```bash
npm install
```

### Problema: Port 5173 já em uso

**Solução:**

```bash
npm run dev -- --port 3000
```

### Problema: Integrais não validam

**Solução:**

- Verifique conexão com servidor Sympy
- Confirme sintaxe da integral (use `x` como variável)

---

## 📊 Estatísticas do Projeto

| Métrica                    | Valor                     |
| -------------------------- | ------------------------- |
| Linhas de Código           | ~2000+                    |
| Componentes Visuais        | 20+                       |
| Animações CSS              | 15+                       |
| Fases de Aprendizagem      | 9                         |
| Bosses Finais              | 3                         |
| Paleta de Cores            | 6 cores principais        |
| Responsibility Breakpoints | 3 (mobile/tablet/desktop) |

---

## 🎓 Aprendizados Pedagógicos

O projeto ensina:

**Conceitos de Cálculo Integral:**

1. **FORGE** - Integrais indefinidas (C + ∫f(x)dx)
2. **U-SUB** - Substituição u (chain rule reversa)
3. **PARTES** - Integração por partes (∫u dv = uv - ∫v du)
4. **MEASURE** - Integral definida (área sob curva)
5. **CONNECT** - Teorema Fundamental do Cálculo

**Competências Transversais:**

- Pensamento computacional
- Resolução de problemas
- Engajamento com matemática
- Feedback iterativo

---

## 📝 Licença

Este projeto é licenciado sob a MIT License - veja [LICENSE](./LICENSE) para detalhes.

---

## 👥 Autores e Colaboradores

- **Design Pedagógico**: [Instituição CESUPA]
- **Implementação**: [Seu Nome]
- **Data de Início**: 2024

---

## 🙋 Suporte

Para dúvidas ou problemas:

1. Abra uma [Issue](https://github.com/seu-repo/issues)
2. Consulte a documentação em `docs/`
3. Verifique troubleshooting acima

---

<div align="center">

### Desenvolvido com ❤️ para educação em Cálculo Integral

**CESUPA 2024** • [Repositório](https://github.com/seu-repo) • [Documentação](./docs/README.md)

</div>
