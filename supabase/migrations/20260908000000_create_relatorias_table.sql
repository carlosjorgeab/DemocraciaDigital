-- Migration: Create table 'relatorias' for relatoria/gabinete parlamentar module
-- Description: Creates the 'relatorias' table mirroring the 'projetos' table structure, 
-- and the 'relatoria_areas' many-to-many join table linking relatorias to areas_tematicas.

-- 1. Create relatorias table (mirrors projetos schema)
CREATE TABLE IF NOT EXISTS public.relatorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  ementa TEXT,
  tipo VARCHAR(100),
  autor VARCHAR(255),
  tramitacao TEXT DEFAULT 'Em elaboração',
  url_legislativo TEXT,
  etapa TEXT DEFAULT 'Liberado' CHECK (etapa IN ('Rascunho', 'Liberado')),
  numero_proposicao VARCHAR(15),
  data DATE DEFAULT CURRENT_DATE,
  id_autor UUID REFERENCES autores(id) ON DELETE SET NULL,
  id_deputado UUID REFERENCES deputado(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_relatorias_id_deputado ON relatorias(id_deputado);
CREATE INDEX IF NOT EXISTS idx_relatorias_etapa ON relatorias(etapa);
CREATE INDEX IF NOT EXISTS idx_relatorias_id_autor ON relatorias(id_autor);

-- 3. Create relatoria_areas join table (mirrors projeto_areas)
CREATE TABLE IF NOT EXISTS public.relatoria_areas (
  id_relatoria UUID NOT NULL REFERENCES public.relatorias(id) ON DELETE CASCADE,
  id_area_tematica UUID NOT NULL REFERENCES public.areas_tematicas(id) ON DELETE CASCADE,
  PRIMARY KEY (id_relatoria, id_area_tematica)
);

CREATE INDEX IF NOT EXISTS idx_relatoria_areas_id_relatoria ON relatoria_areas(id_relatoria);
CREATE INDEX IF NOT EXISTS idx_relatoria_areas_id_area ON relatoria_areas(id_area_tematica);
