-- Migration: Create table 'projeto_areas' for many-to-many relationship
-- Description: Creates a join table 'projeto_areas' linking 'projetos' to multiple 'areas_tematicas', then migrates any existing single relation data.

CREATE TABLE IF NOT EXISTS public.projeto_areas (
  id_projeto UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  id_area_tematica UUID NOT NULL REFERENCES public.areas_tematicas(id) ON DELETE CASCADE,
  PRIMARY KEY (id_projeto, id_area_tematica)
);

-- Copy existing single references to join table for backward compatibility
INSERT INTO public.projeto_areas (id_projeto, id_area_tematica)
SELECT id, id_area_tematica FROM public.projetos
WHERE id_area_tematica IS NOT NULL
ON CONFLICT DO NOTHING;
