-- Migration: Fix RLS policies for ministerios and acoes to properly allow INSERTS

-- Drop existing restricted policies if they exist (using the name from the previous migration)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON ministerios;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON acoes;

-- Create more robust policies
-- Ministerios
CREATE POLICY "Enable read access for authenticated users" ON ministerios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON ministerios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON ministerios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON ministerios FOR DELETE TO authenticated USING (true);

-- Acoes
CREATE POLICY "Enable read access for authenticated users" ON acoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON acoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON acoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON acoes FOR DELETE TO authenticated USING (true);
