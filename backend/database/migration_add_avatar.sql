-- ============================================================
--  MIGRACIÓN: Añadir avatar_url a la tabla users
--  Ejecutar en SQL Editor de Supabase
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Verificación
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name = 'avatar_url';
