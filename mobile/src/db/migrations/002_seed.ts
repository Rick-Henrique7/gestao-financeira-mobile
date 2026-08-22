// Migration 002 - Seed inicial
export const migration002 = `
-- Cria linha padrao de user_settings
INSERT OR IGNORE INTO user_settings (id, display_name) VALUES (1, 'Convidado');

-- Categorias IRPF
INSERT OR IGNORE INTO irpf_categories (id, name, code) VALUES
  ('cat-rv', 'Renda Variável', 'RENDA_VARIAVEL'),
  ('cat-rt', 'Rendimentos',     'RENDIMENTOS'),
  ('cat-bd', 'Bens e Direitos', 'BENS_DIREITOS'),
  ('cat-dd', 'Deduções',        'DEDUCOES');
`;
