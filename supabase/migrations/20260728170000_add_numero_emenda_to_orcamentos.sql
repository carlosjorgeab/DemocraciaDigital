-- Migration: Add numero_emenda, id_area_tematica, and etapa to orcamentos
-- Description: Ensures orcamentos table has columns for Numero Emenda, Area Tematica, and Etapa for full import/export support.

ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS numero_emenda VARCHAR(100);
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS id_area_tematica UUID REFERENCES public.areas_tematicas(id);
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS etapa VARCHAR(50) DEFAULT 'Liberado';
