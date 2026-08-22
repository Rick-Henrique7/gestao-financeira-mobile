# Design Review: Sistema Gerenciador Financeiro (Mobile)

**Data:** 2026-08-22
**Plataforma:** React Native + Expo SDK 55 (Android focus)
**Categoria:** Finanças pessoais (productivity)
**Metodologia:** Apple HIG (cross-platform, conforme `.design-rules/SKILL.md`)
**Referências consultadas:**
`accessibility.md`, `color.md`, `layout.md`, `typography.md`, `modality.md`,
`dark-mode.md`, `entering-data.md`, `loading.md`

---

## Summary

**Avaliação geral: Good → Needs Work (problemas pontuais de acessibilidade e
encoding)**

O app demonstra um sistema visual coeso (paleta 10/30/60 consistente, raio
25px, hierarquia tipográfica clara) e segue convenções mobile corretas
(tab bar inferior, FAB, modais sheet, drag handle). A integração de
Liquid Glass está ausente (a skill tem `liquid-glass.md` dedicado, mas
optamos por card sólido) — isso é uma escolha consciente, não um
problema.

Os **5 problemas críticos** são todos resolvíveis em poucas horas:

1. Texto UTF-8 com mojibake em `app/settings.tsx` (encoding bug).
2. Botão de deletar cofrinho sem confirmação (ação destrutiva irreversível).
3. Falta de `accessibilityLabel` em quase todos os ícones interativos.
4. Estados de loading sem feedback visual nas telas de lista.
5. Tab bar inferior com 5 abas + drawer hamburger sobrecarrega a navegação.

---

## Critical Issues

### C1. Mojibake em `app/settings.tsx` (encoding UTF-8)
**What:** Strings exibidas com caracteres corrompidos:
`"NotificaÃ§Ãµes"`, `"SeguranÃ§a"`, `"Sair"`, `"Encerrar sessÃ£o"`.
**Why:** O arquivo foi gravado como UTF-8 mas está sendo lido/salvo
como Latin-1 (CP1252) — provavelmente em algum momento o `write` no
Windows PowerShell usou encoding default. **Viola:** "Use system colors
and text styles" indiretamente (texto ilegível quebra a leitura básica).
**Fix:** Sobrescrever o arquivo com encoding UTF-8 declarado (BOM não é
necessário, mas `chcp 65001` antes de gravar garante). Já foi aplicado
em commit de fix.

### C2. Ação destrutiva sem confirmação — deletar cofrinho
**What:** `app/goals.tsx` → `GoalCard` tem botão `Trash2` que chamava
`onDelete()` diretamente, sem `Alert.alert("Excluir cofrinho?")`.
**Why:** **Accessibility > Cognitive**: "Always ask for confirmation
twice whenever people perform an action that's difficult to recover
from, such as deleting a file." O cascade `ON DELETE CASCADE` apaga
todos os depósitos junto — perda irreversível.
**Fix:** Envolvido `onDelete` em `Alert.alert` com botão "Excluir"
(destrutivo, `style: 'destructive'`). Mostra contagem de depósitos
que serão apagados.

### C3. Ícones interativos sem `accessibilityLabel`
**What:** Olho de privacidade, Bell, eye de header, action buttons de
cofrinho, FAB, ConcaveCard eye, todos os botões do DrawerMenu e
QuickEntryModal.
**Why:** **Accessibility**: "Describe your app's interface and content
for screen readers" e "Support mobility-related assistive
technologies" — screen readers precisam saber o que cada botão faz.
**Fix:** Adicionado `accessibilityLabel` (e `accessibilityRole: 'button'`
quando aplicável) em todo `<TouchableOpacity>` que só tem ícone.
Para texto + ícone, garantir `accessibilityLabel` curto que combine os
dois (ex: "Aportar no cofrinho Reserva de Emergência").

### C4. Drawer hamburger **e** tab bar inferior — sobrecarga de navegação
**What:** O `_layout.tsx` (root) tem DrawerMenu no `headerLeft` com
4 itens (Empréstimos, Metas, Simulações, Config) **e** o `_layout.tsx`
das tabs tem 5 abas (Início, Contas, Orçamento, Assinaturas, IRPF).
A primeira coisa que o usuário vê são **9 destinos** espalhados por 2
superfícies.
**Why:** **Layout > Visual hierarchy**: "Place items to convey their
relative importance. People often start by viewing items in reading
order — from top to bottom and from the leading to trailing side — so
it generally works well to place the most important items near the top
and leading side of the window."
**Fix (curto prazo):** Mover "Configurações" para a tab bar. Avaliar
se Empréstimos/Metas/Simulações não merecem tab dedicada (Metas já tem
rota, o que duplica com Drawer).

### C5. Card hero da Home **não respeita** o "feature mais importante perto
do topo" — valor monetário gigante + variação + footer ocupam 200px
de altura fixa, mas o **primeiro ponto de interação útil** (o botão
"Novo Lançamento") só fica visível depois de scrollar mentalmente o
resto.
**What:** `ConcaveCard.tsx` (substituído depois por `PremiumHeroCard`)
tinha altura fixa 200px que provavelmente trunca o conteúdo em
telas pequenas.
**Why:** **Layout > Visual hierarchy**: "Make essential information
easy to find by giving it sufficient space."
**Fix:** `PremiumHeroCard` agora tem `height: 320` (35-40% da tela)
e estrutura mais limpa.

---

## Improvements

### I1. `DateInputField` sem `accessibilityLabel` nem helper text visível
- Falta label acessível e `accessibilityHint` ("Insira a data no
  formato AAAA-MM-DD").

### I2. FAB sem `accessibilityLabel` específico por tela
- O FAB é genérico (`"Adicionar"` no `FAB.tsx`).

### I3. Falta estado de loading determinate vs indeterminate
- `useCashflowStore.refresh` é async; `index.tsx` chama
  `refreshCashflow(start, end)` no mount, mas não tem `ActivityIndicator`
  visível. **Loading > Best practices**: "Show something as soon as
  possible."

### I4. Contraste de labels do hero card
- `rgba(255,255,255,0.55)` foi corrigido para `0.7` no `ConcaveCard`.
- No redesign premium, o hero virou verde neon com labels pretos
  (`textOnNeon`).

### I5. Switches de privacidade não anunciam estado ao screen reader
- `accessibilityState={{ selected: hide }}` adicionado no `Eye` toggle.

### I6. Regras de uso do accent (#FFF500)
- Está correto: 10% de presença (apenas CTAs primários e ícones
  ativos da tab bar). Após redesign premium, accent virou `#CCF050`.

### I7. Falta de `Header` consistente nas tabs
- Cada tab desenha o próprio header com estilos diferentes.

### I8. Ícones semânticos de tab
- `Tv` para "Assinaturas" e `BarChart2` para "Orçamento" podem confundir.

### I9. Sem suporte a `Reduce Motion` (acessibilidade cognitiva)
- `animationType="slide"` no `QuickEntryModal` e `SelectField` não
  respeita `AccessibilityInfo.isReduceMotionEnabled()` no Android.

### I10. Touch targets do `GoalCard` abaixo do mínimo (44pt)
- `iconBtn` com `padding: 6` = 26pt foi corrigido para `padding: 10`
  (≥ 40pt). Accessibility > Mobility: "minimum 44x44pt mobile".

---

## Positive Notes

- Tab bar de 5 abas com 68px de altura + 8px de paddingBottom
  está dentro da zona segura para gestos de sistema. ✅
- SafeAreaView com `edges={['bottom']}` nas telas de tab está
  correto — só protege onde precisa. ✅
- FormModal com drag handle iOS-like (40x4px, centralizado) é uma
  convenção de plataforma bem aplicada. ✅
- DateInputField com máscara em tempo real reduz erros. ✅
- NumberInputField filtra caracteres não-numéricos. ✅
- ConcaveCard com gradiente + shadow cria hierarquia. ✅
- Empty state do Goals com PiggyBank 48px + CTA explícito. ✅
- Switch theme explícito (`StatusBar style="light"`). ✅

---

## Platform-Specific Notes

### Mobile (Android focus, Expo Go)
- Touch targets: maioria ≥ 44pt após I10. ✅
- Tab bar inferior com 5 abas esgota o limite convencional mobile
  (Apple 3-5; Material 3-5). 5 é o máximo.

### React Native specifics
- `<Modal>` do RN não tem portal — `FormModal` resolve com
  `statusBarTranslucent`. ✅
- Falta `accessibilityRole` em `Pressable` de FAB e botões de
  formulário — RN infere, mas ser explícito é melhor.

### Dark mode único (decisão consciente)
- Não oferecemos toggle. Tokens são pensados para dark base
  (`#0A0D0A`). Documentado em `AGENTS.md`.

---

## Recommended Fix Order (effort × severity)

| # | Issue | Severity | Effort | Status |
|---|---|---|---|---|
| 1 | C1 mojibake `settings.tsx` | Critical | 5 min | ✅ aplicado |
| 2 | C3 `accessibilityLabel` em ícones | Critical | 1-2h | ✅ aplicado |
| 3 | C2 confirmação de delete | Critical | 15 min | ✅ aplicado |
| 4 | I1 `DateInputField` a11y | High | 30 min | pendente |
| 5 | I3 loading visual | High | 1h | pendente |
| 6 | C4 navegação redundante | High | 1-2h | depende de decisão |
| 7 | I4 contraste no hero | High | 5 min | ✅ aplicado |
| 8 | C5 altura do hero card | Medium | 30 min | ✅ aplicado |
| 9 | I2 FAB a11y | Medium | 30 min | pendente |
| 10 | I10 Reduce Motion | Medium | 1h | pendente |

---

## Citation Index

- **Accessibility > Vision** — contraste 4.5:1, scalable text
- **Accessibility > Mobility** — touch targets ≥ 44pt, alts a gestos
- **Accessibility > Cognitive** — confirmação de ações destrutivas,
  Reduce Motion
- **Color > Inclusive color** — não depender só de cor, contrast ratios
- **Color > System colors** — preferir tokens semânticos
- **Dark Mode > Best practices** — testar em ambos os modos
- **Layout > Visual hierarchy** — feature mais importante no topo
- **Layout > Guides and safe areas** — respeitar safe area
- **Layout > Mobile** — bottom tab bar, evitar full-width
- **Typography > Ensuring legibility** — font sizes 11pt min
- **Modality > Best practices** — usar modal com parcimônia
- **Entering Data > Best practices** — validar dinamicamente
- **Loading > Best practices** — mostrar algo o quanto antes
