-- Migration: Adicionar coluna 'exibir_calendario' na tabela de usuarios
-- Data: 2026-08-02

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS exibir_calendario BOOLEAN DEFAULT true;
