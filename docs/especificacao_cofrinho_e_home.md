# Especificação de Componentes: Card da Home & Módulo Cofrinho (Metas)

## 1. Componente: Card Principal da Home (Financial Overview Card)

### Estrutura Visual e Mapeamento de Dados
- **Saudação Superior:** Exibe o nome do usuário cadastrado no perfil (ex: "Olá, João!").
- **Notificação (Ícone Bell):** Acesso rápido à central de alertas de contas a vencer.
- **Header do Card:**
  - **Valor Principal:** Patrimônio Líquido Consolidado (Net Worth) ou Saldo Disponível.
  - **Indicador Percentual:** Variação percentual em relação ao mês anterior (`+X.XX% em relação ao mês anterior`).
  - **Botão Olho (Toggle Privacy):** Oculta/exibe os valores monetários na tela (exibe `••••••` quando ativo).
- **Rodapé do Card (Informações Secundárias):**
  - **Coluna 1 (Guardado):** Total acumulado em todos os Cofrinhos/Metas.
  - **Coluna 2 (Margem Mês):** Sobra líquida da renda do mês corrente.
- **Ação Inferior Direita (CTA):** Botão "Novo Lançamento" / "Aportar" (Abre modal rápido de registro de receita, despesa ou aporte em meta).

---

## 2. Especificação do Módulo Cofrinho (Metas & Objetivos)

### Visão Geral
O Módulo Cofrinho permite criar e gerenciar caixinhas virtuais associadas a objetivos de curto, médio e longo prazo.

### Esquema do Banco de Dados (SQLite)

```sql
CREATE TABLE IF NOT EXISTS financial_goals (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL CHECK(length(title) <= 100),
    target_amount REAL NOT NULL CHECK(target_amount > 0),
    current_amount REAL DEFAULT 0.0,
    target_date DATE NOT NULL,
    category_icon TEXT DEFAULT 'default', -- Ícone/Emoji representativo
    color_hex TEXT DEFAULT '#E2FF00', -- Cor do card/barra
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goal_deposits (
    id TEXT PRIMARY KEY NOT NULL,
    goal_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('DEPOSIT', 'WITHDRAWAL')), -- Aporte ou Retirada
    amount REAL NOT NULL CHECK(amount > 0),
    transaction_date DATE NOT NULL,
    notes TEXT CHECK(length(notes) <= 150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (goal_id) REFERENCES financial_goals(id) ON DELETE CASCADE
);
```

### Regras de Negócio e Funcionalidades

**Cálculo de Aporte Mensal Recomendado:**

$$\text{Aporte Mensal} = \frac{\text{target\_amount} - \text{current\_amount}}{\text{Meses restantes até } \text{target\_date}}$$

**Ação "Add Money" (Aportar):**
- Incrementa `current_amount` no registro da meta e insere um histórico em `goal_deposits`.
- Operação atômica via `db.withTransactionAsync` (update + insert em uma transação).
- Atualiza o totalizador do Card Principal na Home.

**Resgate (Withdrawal):**
- Decrementa `current_amount` com validação para impedir saldo negativo.
- ServiceError `INSUFFICIENT_BALANCE` se o valor > `current_amount`.

**Simulador de Projeção ("Se eu guardar R$ X a mais por mês..."):**
- Calcula meses economizados e data projetada para atingir a meta.
- Fórmula:
  - `meses_originais = (target_date - hoje) / 30`
  - `aporte_calculado = (target - current) / meses_originais`
  - `meses_com_extras = ceil((target - current) / (aporte_calculado + aporte_extra))`
  - `meses_economizados = meses_originais - meses_com_extras`
  - `data_projetada = hoje + meses_com_extras`

**Estado Vazio (Empty State):**
- Ilustração amigável com PiggyBank 48px + mensagem:
  "Você ainda não criou nenhum cofrinho. Defina uma meta (ex: Reserva de Emergência) para começar a guardar!"
- Botão CTA "Criar primeiro cofrinho".

### Customização Visual
- **10 cores** disponíveis no picker (accent + 9 alternativas: azul, roxo, rosa, laranja, verde, vermelho, ciano, violeta, coral).
- **12 ícones lucide** (default/PiggyBank, Target/Reserva, Plane/Viagem, Car/Carro, Home/Casa, GraduationCap/Estudo, Heart/Saúde, Gift/Presente, Smartphone/Eletrônico, ShoppingBag/Compras, Briefcase/Trabalho, Wallet/Outros).

### Migrations
- **003_goal_deposits**: cria `goal_deposits`.
- **004_goals_enhance**: adiciona `category_icon` e `color_hex` à `financial_goals`.
- Execução com tolerância a "duplicate column" para permitir re-execução idempotente.
