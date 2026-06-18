-- Migration: Exclude total_empenhado, total_executado, and id_area_tematica from public.projetos
-- Description: Drop columns as requested to simplify the table structure, prevent ambiguities, and ensure multi-area association works cleanly.

ALTER TABLE public.projetos DROP COLUMN IF EXISTS total_empenhado CASCADE;
ALTER TABLE public.projetos DROP COLUMN IF EXISTS total_executado CASCADE;
ALTER TABLE public.projetos DROP COLUMN IF EXISTS id_area_tematica CASCADE;
