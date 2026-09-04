-- ==============================================================================
-- Migration: Criar Tabela de Autores para Projetos no Banco de Dados Supabase
-- Data: 2026-09-03
-- ==============================================================================

-- 1. Criação da Tabela de Autores
CREATE TABLE IF NOT EXISTS autores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cargo VARCHAR(100) DEFAULT 'Deputado(a) Federal',
  partido VARCHAR(50),
  uf VARCHAR(2),
  id_deputado UUID REFERENCES deputado(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_autores_nome ON autores(nome);
CREATE INDEX IF NOT EXISTS idx_autores_id_deputado ON autores(id_deputado);

-- 2. Habilitação de Row Level Security (RLS) e Políticas de Acesso
ALTER TABLE autores ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'autores' AND policyname = 'Permitir leitura pública de autores'
  ) THEN
    CREATE POLICY "Permitir leitura pública de autores" ON autores FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'autores' AND policyname = 'Permitir inserção de autores'
  ) THEN
    CREATE POLICY "Permitir inserção de autores" ON autores FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'autores' AND policyname = 'Permitir atualização de autores'
  ) THEN
    CREATE POLICY "Permitir atualização de autores" ON autores FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'autores' AND policyname = 'Permitir exclusão de autores'
  ) THEN
    CREATE POLICY "Permitir exclusão de autores" ON autores FOR DELETE USING (true);
  END IF;
END $$;

-- 3. Adicionar coluna id_autor na tabela projetos (mantendo a coluna autor para total compatibilidade)
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS id_autor UUID REFERENCES autores(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projetos_id_autor ON projetos(id_autor);

-- 4. Inserir os deputados cadastrados como autores iniciais
INSERT INTO autores (nome, cargo, partido, uf, id_deputado)
SELECT 
  d.nome, 
  'Deputado(a) Federal', 
  COALESCE(p.sigla, 'PL'), 
  COALESCE(d.estado, 'PR'),
  d.id
FROM deputado d
LEFT JOIN partidos p ON d.id_partido = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM autores a WHERE LOWER(a.nome) = LOWER(d.nome)
);

-- 5. Inserir autores distintos pré-existentes na tabela projetos
INSERT INTO autores (nome, cargo)
SELECT DISTINCT 
  TRIM(p.autor),
  'Deputado(a) Federal'
FROM projetos p
WHERE p.autor IS NOT NULL 
  AND TRIM(p.autor) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM autores a WHERE LOWER(a.nome) = LOWER(TRIM(p.autor))
  );

-- 6. Atualizar a referência id_autor nos projetos existentes baseando-se no nome do autor
UPDATE projetos p
SET id_autor = a.id
FROM autores a
WHERE p.id_autor IS NULL 
  AND p.autor IS NOT NULL 
  AND LOWER(TRIM(p.autor)) = LOWER(TRIM(a.nome));