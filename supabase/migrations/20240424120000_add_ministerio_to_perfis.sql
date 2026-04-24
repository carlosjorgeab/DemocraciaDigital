-- Migration: Add id_ministerio to perfis table
ALTER TABLE perfis ADD COLUMN id_ministerio UUID REFERENCES ministerios(id);
