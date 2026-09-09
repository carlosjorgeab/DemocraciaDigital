-- Migration: Adicionar geolocalização e clima aos compromissos da agenda
-- Data: 2026-09-07

-- Adicionar colunas de geolocalização à tabela de agendas
ALTER TABLE gabinete_agendas
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS uf VARCHAR(2),
ADD COLUMN IF NOT EXISTS previsao_tempo JSONB;

-- Adicionar índice para buscas por localização
CREATE INDEX IF NOT EXISTS idx_gabinete_agendas_geolocation
ON gabinete_agendas(latitude, longitude);

COMMENT ON COLUMN gabinete_agendas.latitude IS 'Latitude do local do compromisso (-90 a 90)';
COMMENT ON COLUMN gabinete_agendas.longitude IS 'Longitude do local do compromisso (-180 a 180)';
COMMENT ON COLUMN gabinete_agendas.cidade IS 'Nome da cidade do local';
COMMENT ON COLUMN gabinete_agendas.uf IS 'Unidade Federativa (UF) do local';
COMMENT ON COLUMN gabinete_agendas.previsao_tempo IS 'Dados de previsão do tempo em formato JSON';
