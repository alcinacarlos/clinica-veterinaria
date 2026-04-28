import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para el FRONTEND.
 * Usa la anon/publishable key — seguro para exponer al navegador.
 * Se usa EXCLUSIVAMENTE para el flujo OAuth (signInWithOAuth).
 * Todas las llamadas a la API van por axios con el JWT del backend.
 */
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon || supabaseAnon === 'tu-anon-key-aqui') {
  console.warn(
    '⚠️ VITE_SUPABASE_ANON_KEY no configurada en frontend/.env\n' +
    'GitHub OAuth no funcionará hasta que añadas la anon key.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnon || '');
