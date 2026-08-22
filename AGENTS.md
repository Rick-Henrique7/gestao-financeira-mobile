# AGENTS.md — Sistema Gerenciador Financeiro

Regras de IA para este projeto. Carregue estas instruções antes de qualquer
tarefa (exceto navegação trivial em arquivos já conhecidos).

## Design Review Rules

Quando o usuário pedir **revisão de design, auditoria de UI/UX, conformidade
HIG, melhoria de telas, feedback visual** ou mencionar **screenshots,
mockups, "esse componente está feio", "como melhorar X"**, siga o processo
definido em:

- `.design-rules/SKILL.md` — metodologia de auditoria + sistema de severidade
- `.design-rules/references/hig-lookup.md` — roteamento de tópico → arquivo
- `.design-rules/references/hig/*.md` — 53 documentos de guideline

### Como usar

1. Leia o `SKILL.md` para entender o processo (4 etapas + severidade).
2. Use `hig-lookup.md` para escolher 3–8 arquivos `.md` relevantes ao escopo
   da revisão (sempre inclua `accessibility.md`, `color.md`, `layout.md`,
   `typography.md`).
3. Traduza os termos Apple (iOS, UIKit, SF Pro, UIColor) para React Native
   (Expo, StyleSheet, `expo-router`, `lucide-react-native`, tokens em
   `src/lib/theme.ts`).
4. Entregue o relatório com a estrutura do `SKILL.md`:
   Summary → Critical Issues → Improvements → Positive Notes →
   Platform-Specific Notes.
5. Cite cada guideline como princípio (não como URL).

## Regra de design: texto sobre neon

**Se o `backgroundColor` do container é verde (`colors.accent` ou
`colors.accentSoft`), o conteúdo (texto/ícone) deve ser preto
(`colors.textOnNeon`).** Se o fundo é grafite/azul/preto, o conteúdo pode
ser verde (`colors.accent`) para destacar.

## Espaçamento padrão

`paddingTop: 20` no `ScrollView.contentContainerStyle` de cada tela para
padronizar a distância do primeiro elemento ao topo do SafeArea. Os lados
mantêm `spacing.lg` (16) e o bottom varia conforme presença do FAB.

## Workflow padrão do projeto

- **Commits**: prefixo `feat/`, `chore/`, `fix/`, `docs/`, `refactor/`,
  `style/`. Mensagem curta no imperativo, corpo com bullets do "porquê".
- **Bundle budget**: ~5 MB Hermes Android. Não adicionar deps que
  comprometam isso sem aviso.
- **Theme**: sempre importar de `mobile/src/lib/theme.ts` (não hardcode
  cores). Tokens: `colors`, `radius`, `spacing`, `typography`.
- **Path do projeto**: `C:\dev\Sistema Gerenciador Financeiro` (NÃO o
  `C:\dev\projects\…`).
- **Deleção de arquivos**: nunca usar `rmdir /s /q` ou `Remove-Item -Recurse`
  fora de diretórios explicitamente autorizados. Para remover o diretório
  duplicado `FinanceIRO`, mover para a Lixeira via Explorador de Arquivos.

## Stack

- Expo SDK 55 + Expo Router (file-based routing)
- React Native + TypeScript
- SQLite local (offline-first) + 8 services + 8 Zustand stores
- `react-native-svg` 15.x (recortes curvos)
- `lucide-react-native` (ícones)
- `expo-image-picker` (anexo IRPF)

## Tabs principais

1. Início (Home com `PremiumHeroCard` + `FloatingTabBar`)
2. Contas
3. Orçamento
4. Assinaturas
5. IRPF

Itens secundários (Empréstimos, Metas, Simulações, Configurações) ficam
no DrawerMenu (headerLeft).

## Design system atual (após redesign premium)

- **bgCanvas**: `#0A0D0A` (grafite)
- **accent**: `#CCF050` (neon green)
- **accentBright**: `#E2FF00`
- **accentSoft**: `#E3FA7B`
- **surfaceDark1**: `#162016` (botões escuros)
- **surfaceDark2**: `#1F2E1F` (hover/pressed)
- **text**: `#FFFFFF`
- **textOnNeon**: `#000000` (preto para usar sobre verde)
- **textMuted**: `#7A8977`
- **success**: `#00E676`
- **danger**: `#FF5252`
- **radius**: display 32 / card 24 / button 20 / pill 9999
