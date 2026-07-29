-- Migration: Add id_municipio foreign key to public.orcamentos and drop text column municipio
-- Description: Connects public.orcamentos to public.municipio via id_municipio foreign key and drops text column municipio.

ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS id_municipio UUID REFERENCES public.municipio(id);

-- Migrate existing data if matching municipality name exists
UPDATE public.orcamentos o
SET id_municipio = m.id
FROM public.municipio m
WHERE o.id_municipio IS NULL 
  AND o.municipio IS NOT NULL
  AND LOWER(TRIM(m.nome)) = LOWER(TRIM(SPLIT_PART(o.municipio, '-', 1)));

-- Drop old text column municipio
ALTER TABLE public.orcamentos DROP COLUMN IF EXISTS municipio;
