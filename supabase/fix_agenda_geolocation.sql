-- Script SQL para adicionar colunas de geolocalização na tabela gabinete_agendas
-- Execute este script no Supabase Dashboard > SQL Editor

-- Adicionar colunas de geolocalização
ALTER TABLE gabinete_agendas 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS uf VARCHAR(2);

-- Adicionar comentários
COMMENT ON COLUMN gabinete_agendas.latitude IS 'Latitude do local do compromisso';
COMMENT ON COLUMN gabinete_agendas.longitude IS 'Longitude do local do compromisso';
COMMENT ON COLUMN gabinete_agendas.cidade IS 'Nome da cidade do local';
COMMENT ON COLUMN gabinete_agendas.uf IS 'Unidade Federativa (UF) do local';

-- Criar índice para buscas por localização
CREATE INDEX IF NOT EXISTS idx_gabinete_agendas_geolocation 
ON gabinete_agendas(latitude, longitude);

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gabinete_agendas' 
AND column_name IN ('latitude', 'longitude', 'cidade', 'uf');
