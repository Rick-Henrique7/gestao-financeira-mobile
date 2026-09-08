<div align="center">

# 💸 Sistema Gerenciador Financeiro

**App mobile (React Native + Expo) para gestão financeira pessoal — offline-first, com visual neon premium, export CSV/PDF e tema dark/light.**

![Expo SDK](https://img.shields.io/badge/Expo-SDK%2055-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?logo=react&logoColor=black)
![React](https://img.shields.io/badge/React-19.2-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.x-443B38?logo=react&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-expo--sqlite-003B57?logo=sqlite&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-3DDC84?logo=android&logoColor=white)
![License](https://img.shields.io/badge/license-Apache%202.0-green)
![Status](https://img.shields.io/badge/status-MVP%20funcional-brightgreen)

<br />

> **Aplicativo completo de finanças pessoais, 100% offline, com tema neon premium, animações suaves e atalhos pra IRPF / export / cofrinhos.**

</div>

---

## 📸 Screenshot

> ⚠️ _Substitua a imagem abaixo pelo screenshot real do app rodando._
> **Como adicionar:**
> 1. Tira um print do app no celular (recomendado: tela inicial com cofrinhos)
> 2. Salva como `mobile-screenshots/screenshot-home.png` (ou outro nome)
> 3. Faz commit: `git add mobile-screenshots/ && git commit -m "docs: add home screenshot"`
> 4. A imagem aparece automaticamente aqui

<p align="center">
  <img src="mobile-screenshots/screenshot-home.png" alt="Tela inicial do app" width="320" />
</p>

> 💡 **Dica de composição:** tira o print com algum dado já cadastrado (1-2 contas, 1 cofrinho, 1 assinatura) pra Home e Drawer aparecerem com conteúdo real. Se quiser mostrar mais telas, é só adicionar mais `<img>` em sequência.

---

## ✨ Funcionalidades

### 🏠 **Tela Inicial (Home)**
- Saudação dinâmica (bom dia / boa tarde / boa noite) com nome do `settingsStore`
- 4 cards de resumo **calculados em tempo real**:
  - Receitas do mês
  - Despesas do mês
  - Saldo (verde se positivo, vermelho se negativo)
  - Total acumulado nos cofrinhos
- Empty state com botão "Adicionar primeiro lançamento"
- Atalho "Lançamento rápido" → abre `QuickEntryModal`

### 📑 **5 abas principais**
| Aba | O que faz |
|---|---|
| **Início** | Resumo + atalhos (acima) |
| **Contas** | CRUD de contas a pagar, toggle pendente ↔ pago, histórico desmacarável |
| **Orçamento** | Receitas/Despesas/Saldo do mês + breakdown por categoria |
| **Assinaturas** | Cofre de serviços recorrentes com total mensal e anual |
| **IRPF** | Comprovantes com categorias (Renda Variavel, Rendimentos, Bens e Direitos, Deducoes) e progresso |

### 🗂️ **Drawer** (secundárias)
- **Empréstimos** — contas a receber, com botão "Receber" e remoção
- **Metas & Cofrinhos** — CRUD de metas, Aportar/Resgatar (transações atômicas), simulador de projeção
- **Simulações** — calculadora de cenários
- **Exportar** — CSV / PDF de **todas** as 6 entidades (Bills, Subs, Goals, Loans, IRPF, Cashflow)
- **Configurações** — toggle de privacidade (esconder valores), perfil

### 🛠️ **Funcionalidades transversais**
- ✅ **100% offline** — backend é SQLite local, sem servidor
- 🎨 **Tema dark/light** (estrutura completa, dark funcional, light skeleton)
- 🌱 **Visual neon premium** — `#CCF050` accent + cards escuros + tipografia monospace
- 📊 **Export CSV/PDF** — com `expo-print` + `expo-sharing`
- ♿ **Acessibilidade** — `accessibilityRole`/`Label` em todos os botões, `reduce-motion` respeitado
- ⌨️ **Auto-scroll keyboard** — o sheet sobe junto com o teclado (`ref.measure()`)
- 🛡️ **DB retry automático** — `withDB()` detecta connection stale e reconecta
- 🔄 **Hot reload-friendly** — Zustand stores preservam estado

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│                          MOBILE APP                              │
│                       (React Native + Expo)                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                         UI Layer                           │  │
│  │                                                            │  │
│  │   app/                       src/components/                │  │
│  │   ┌─────────────────────┐    ┌────────────────────────┐    │  │
│  │   │ (tabs)/             │    │ PremiumHeroCard        │    │  │
│  │   │  ├ index.tsx (Home) │    │ ScreenTitle            │    │  │
│  │   │  ├ contas.tsx       │    │ DrawerMenu             │    │  │
│  │   │  ├ orcamento.tsx    │    │ QuickEntryModal        │    │  │
│  │   │  ├ assinaturas.tsx  │    │ ChooseGoalModal        │    │  │
│  │   │  └ irpf.tsx         │    │ FAB / FormModal        │    │  │
│  │   ├ loans.tsx           │    └────────────────────────┘    │  │
│  │   ├ goals.tsx           │                                  │  │
│  │   ├ simulacoes.tsx      │    src/components/form/          │  │
│  │   ├ settings.tsx        │    TextInputField / Number /     │  │
│  │   ├ export.tsx          │    DateInput / SelectField /     │  │
│  │   └ _layout.tsx         │    FormModal / FAB / ImagePicker │  │
│  │                         │                                   │  │
│  │   src/components/forms/                                       │  │
│  │   BillForm / SubscriptionForm / GoalForm /                   │  │
│  │   LoanForm / CashflowForm / IRPFForm /                       │  │
│  │   GoalDepositForm / GoalSimulatorForm                        │  │
│  └──────────────┬──────────────────────────────────────────────┘  │
│                 │ state hooks (Zustand selectors)                │
│  ┌──────────────▼──────────────────────────────────────────────┐  │
│  │                    STATE Layer (Zustand)                    │  │
│  │                                                            │  │
│  │   src/stores/                                              │  │
│  │   ┌──────────────────┐ ┌──────────────────┐                │  │
│  │   │ billsStore       │ │ subscriptionsSt. │ ┌────────────┐  │  │
│  │   │  ├ bills[]       │ │  ├ subs[]        │ │ goalsStore │  │  │
│  │   │  ├ loading       │ │  ├ add/toggle    │ │ loansStore │  │  │
│  │   │  ├ add()         │ │  └ remove()      │ │ irpfStore  │  │  │
│  │   │  ├ togglePaid()  │ └──────────────────┘ │ cashflwSt. │  │  │
│  │   │  └ remove()      │                      │ settingsSt.│  │  │
│  │   └──────────────────┘                      │ goalDepoSt.│  │  │
│  │                                              └────────────┘  │  │
│  └──────────────┬──────────────────────────────────────────────┘  │
│                 │ service calls (async/await)                    │
│  ┌──────────────▼──────────────────────────────────────────────┐  │
│  │                   SERVICE Layer (CRUD)                      │  │
│  │                                                            │  │
│  │   src/services/                                            │  │
│  │   bills / subscriptions / goals / goalDeposits /           │  │
│  │   loans / irpf / cashflow / settings                       │  │
│  │   (todos wrappam queries em withDB() — auto-retry)         │  │
│  └──────────────┬──────────────────────────────────────────────┘  │
│                 │ withDB(fn) — mutex + retry on stale            │
│  ┌──────────────▼──────────────────────────────────────────────┐  │
│  │                     DATA Layer (SQLite)                    │  │
│  │                                                            │  │
│  │   src/db/                                                  │  │
│  │   database.ts    ← getDB() com mutex, isInvalidDbError()    │  │
│  │   migrations/                                             │  │
│  │    001_init             ← schema base                       │  │
│  │    002_seed             ← dados iniciais (categorias IRPF)  │  │
│  │    003_goal_deposits    ← tabela de transacoes de cofrinho  │  │
│  │    004_goals_enhance    ← campos extras em goals            │  │
│  │                                                            │  │
│  │   Tables: bills, subscriptions, financial_goals,           │  │
│  │           goal_deposits, receivables (loans),              │  │
│  │           irpf_records, cashflow_transactions, settings    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    THEME / STYLING                          │  │
│  │                                                            │  │
│  │   src/lib/                                                 │  │
│  │    theme.ts            ← darkTheme / lightTheme / spacing  │  │
│  │    AppThemeProvider.tsx ← useTheme() + useStyles() +       │  │
│  │                          useColorScheme()                   │  │
│  │    motion.ts           ← useReducedMotion + safeModalAnim   │  │
│  │    format.ts           ← fmt() BRL                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   NAVIGATION (expo-router)                  │  │
│  │                                                            │  │
│  │   _layout.tsx  (Stack root)                                 │  │
│  │     ├ (tabs)/_layout.tsx  (Tab Navigator, 5 abas)          │  │
│  │     │    ├ index.tsx, contas, orcamento, assinaturas, irpf │  │
│  │     └ loans, goals, simulacoes, settings, export (drawer)  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo de dados

```
[UI Event] → [Store action] → [Service] → [withDB()] → [SQLite]
                ↑                                    │
                └────────── state updated ───────────┘
                          (Zustand subscribe)
```

- **UI** nunca fala direto com SQLite
- **Stores** expõem estado + ações (síncronas no client, async no service)
- **Services** traduzem chamadas para queries SQL, com retry automático
- **withDB()** é o único ponto que toca a conexão SQLite (mutex + recovery)

---

## 🧰 Stack técnica

| Camada | Tecnologia | Versão |
|---|---|---|
| Runtime | Expo SDK | 55.0.29 |
| Framework | React Native | 0.83.10 |
| UI | React | 19.2.0 |
| Linguagem | TypeScript | 5.x |
| Navegação | expo-router | 55.0.18 |
| Animações | react-native-reanimated + worklets | 4.2.1 / 0.7.4 |
| Estado | Zustand | 5.x |
| Banco de dados | expo-sqlite | (built-in) |
| Ícones | lucide-react-native | (latest) |
| Export | expo-print + expo-sharing | 55.0.19 / 55.0.15 |
| File system | expo-file-system/legacy | 55.x |

---

## 📁 Estrutura de pastas

```
.
├── app/                          # Rotas (expo-router)
│   ├── _layout.tsx               # Root: AppThemeProvider + Stack
│   ├── (tabs)/                   # 5 abas principais
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home
│   │   ├── contas.tsx
│   │   ├── orcamento.tsx
│   │   ├── assinaturas.tsx
│   │   └── irpf.tsx
│   ├── loans.tsx                 # Drawer
│   ├── goals.tsx
│   ├── simulacoes.tsx
│   ├── settings.tsx
│   └── export.tsx
│
├── src/
│   ├── lib/                      # Theme, format, motion
│   │   ├── theme.ts              # darkTheme/lightTheme/spacing/radius
│   │   ├── AppThemeProvider.tsx  # useTheme + useStyles + useColorScheme
│   │   ├── motion.ts             # useReducedMotion
│   │   └── format.ts
│   │
│   ├── db/                       # SQLite layer
│   │   ├── database.ts           # withDB() helper
│   │   └── migrations/           # 001-004
│   │
│   ├── services/                 # CRUD por entidade
│   │   ├── bills.ts
│   │   ├── subscriptions.ts
│   │   ├── goals.ts
│   │   ├── goalDeposits.ts
│   │   ├── loans.ts
│   │   ├── irpf.ts
│   │   ├── cashflow.ts
│   │   ├── settings.ts
│   │   └── attachments.ts
│   │
│   ├── stores/                   # Zustand (mesma lista dos services)
│   │   └── ...
│   │
│   ├── components/
│   │   ├── PremiumHeroCard.tsx
│   │   ├── ScreenTitle.tsx
│   │   ├── DrawerMenu.tsx
│   │   ├── QuickEntryModal.tsx
│   │   ├── ChooseGoalModal.tsx
│   │   ├── form/                 # Inputs e modal genéricos
│   │   │   ├── FormModal.tsx     # Auto-scroll keyboard
│   │   │   ├── FAB.tsx
│   │   │   ├── TextInputField.tsx
│   │   │   ├── NumberInputField.tsx
│   │   │   ├── DateInputField.tsx
│   │   │   ├── SelectField.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── ImagePickerField.tsx
│   │   │   └── useInputScroll.ts
│   │   └── forms/                # 6 entity forms
│   │       ├── BillForm.tsx
│   │       ├── SubscriptionForm.tsx
│   │       ├── GoalForm.tsx
│   │       ├── LoanForm.tsx
│   │       ├── CashflowForm.tsx
│   │       ├── IRPFForm.tsx
│   │       ├── GoalDepositForm.tsx
│   │       └── GoalSimulatorForm.tsx
│   │
│   └── types/
│       └── index.ts              # 8 entidades + helpers
│
├── docs/                         # ← Coloque seus screenshots aqui
├── assets/                       # Ícone, splash
├── scripts/                      # Debug helpers
│
├── app.json                      # Expo config
├── babel.config.js
├── metro.config.js
├── package.json
└── tsconfig.json
```

---

## 🚀 Como rodar

### Pré-requisitos
- **Node.js 20+** (recomendado 22 LTS)
- **Expo Go 55.0.7** instalado no Android (ou iOS)
- Git

### Instalação

```powershell
# 1. Clone
git clone https://github.com/Rick-Henrique7/gestao-financeira-mobile.git
cd gestao-financeira-mobile

# 2. Dependências (use --legacy-peer-deps por causa do React 19)
npm install --legacy-peer-deps

# 3. Iniciar Metro
npx expo start --port 8081
```

### Conectar pelo celular
1. Abra o **Expo Go** no Android
2. Toque em **"Enter URL manually"**
3. Digite: `http://SEU_IP_LOCAL:8081` (pegue o IP com `ipconfig` no PowerShell)
4. Aguarde o bundle carregar (~30-60s no primeiro load)

> 💡 **Dica:** se a porta 8081 estiver ocupada, use `--port 8090` e aponte o Expo Go pro IP:8090.

### Build de produção (APK)

```powershell
# Requer EAS CLI + conta Expo
npm install -g eas-cli
eas build --platform android --profile preview
```

---

## 🎨 Design system

| Token | Valor | Uso |
|---|---|---|
| `accent` | `#CCF050` | Botões primários, ícones ativos |
| `accentBright` | `#E2FF00` | Gradiente do hero |
| `accentSoft` | `#E3FA7B` | Estados hover/pressed |
| `bgCanvas` | `#0A0D0A` | Fundo principal (dark) |
| `surface` / `surfaceDark1` | `#162016` | Cards |
| `surfaceDark2` | `#1F2E1F` | Card elevado |
| `text` | `#FFFFFF` | Texto principal |
| `textOnNeon` | `#000000` | Texto sobre accent verde |
| `textMuted` | `#7A8977` | Labels secundárias |
| `success` | `#00E676` | Saldo positivo, confirm |
| `danger` | `#FF5252` | Saldo negativo, delete |
| `radius.display` | `32` | Cards |
| `radius.button` | `20` | Botões |
| `radius.pill` | `9999` | Toggles e pills |

**Regra visual:** tudo sobre verde neon é preto (`textOnNeon`); texto/ícone dentro de botão escuro (`surfaceDark1`) continua branco (`text`).

---

## 🧪 Roadmap

### ✅ Entregue
- [x] 5 abas + 5 telas no drawer
- [x] SQLite local + 8 services + 9 stores
- [x] CRUD completo das 6 entidades
- [x] Cofrinho com Aportar/Resgatar (atômico)
- [x] Tema dark/light (estrutura)
- [x] Export CSV/PDF
- [x] Auto-scroll keyboard (`ref.measure`)
- [x] DB retry (`withDB`)
- [x] Visibilidade de valores (privacy toggle)
- [x] Histórico de contas desmacarável

### 🔜 Próximo
- [ ] **Empty states** em todas as listas
- [ ] **Confirmação de delete** universal (Alert)
- [ ] **Filtros** (Contas: pendentes/pagas | Subs: ativas/canceladas)
- [ ] **Customização do `lightTheme`** (cores reais, não skeleton)
- [ ] **Score de saúde financeira** (#1 do brainstorm)
- [ ] **Alertas inteligentes** (vence em 3 dias, meta parada) (#3)
- [ ] **Orçamento por categoria** com teto mensal (#8)
- [ ] **Lançamento por voz** (#12)
- [ ] **Notificações push** via `expo-notifications` (#18)
- [ ] **CI no GitHub Actions** + dependabot

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m "feat: minha feature"`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

Padrão de commits (Conventional Commits):
- `feat:` nova feature
- `fix:` bug fix
- `style:` mudanças de visual sem lógica
- `refactor:` refatoração sem mudar comportamento
- `chore:` tooling, configs, etc
- `docs:` só documentação

---

## 📄 Licença

Apache 2.0 — veja [LICENSE](LICENSE) para detalhes.

---

## 👤 Autor

**Henrique Moraes dos Santos** ([@Rick-Henrique7](https://github.com/Rick-Henrique7))

<div align="center">

Feito com 💚 e muito ☕

</div>
