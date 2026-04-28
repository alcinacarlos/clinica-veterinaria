const supabase = require('../config/supabase');

/**
 * Middleware de autenticación.
 * 1. Extrae el Bearer token del header Authorization.
 * 2. Verifica el JWT con Supabase Auth.
 * 3. Carga el perfil completo del usuario (rol, is_adopter) desde la tabla `users`.
 *    → Si no existe (primer login OAuth), lo crea automáticamente.
 * 4. Adjunta el resultado a req.user para los controladores.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorización no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar JWT con Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

    // Cargar perfil extendido desde la tabla users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_adopter, phone, avatar_url')
      .eq('id', authUser.id)
      .single();

    // ── Perfil no encontrado: primer login OAuth (GitHub, etc.) ──
    if (profileError || !profile) {
      const provider = authUser.app_metadata?.provider || 'email';
      const isOAuth  = provider !== 'email';

      if (!isOAuth) {
        return res.status(401).json({ error: 'Perfil de usuario no encontrado.' });
      }

      // Extraer datos del proveedor OAuth
      const meta       = authUser.user_metadata || {};
      const full_name  = meta.full_name || meta.name || meta.user_name || authUser.email;
      const avatar_url = meta.avatar_url || null;

      // UPSERT: si ya existe (race condition), simplemente lo ignora
      const { data: upserted, error: upsertError } = await supabase
        .from('users')
        .upsert(
          {
            id:         authUser.id,
            email:      authUser.email,
            full_name,
            avatar_url,
            role:       'clientela',
            is_adopter: false,
          },
          { onConflict: 'id', ignoreDuplicates: false }
        )
        .select('id, email, full_name, role, is_adopter, phone, avatar_url')
        .single();

      if (upsertError) {
        // Si a pesar del upsert falla, intentar carga directa (perfil ya existe)
        if (upsertError.code === '23505') {
          const { data: existing } = await supabase
            .from('users')
            .select('id, email, full_name, role, is_adopter, phone, avatar_url')
            .eq('id', authUser.id)
            .single();

          if (existing) {
            req.user = existing;
            return next();
          }
        }
        console.error('[authenticate] Error upsert perfil OAuth:', upsertError);
        return res.status(500).json({ error: 'No se pudo crear el perfil de usuario.' });
      }

      console.log(`[OAuth] Perfil upserted para ${authUser.email} (${provider})`);
      req.user = upserted;
      return next();
    }

    // Adjuntar usuario enriquecido a la request
    req.user = profile;
    next();
  } catch (err) {
    console.error('Error en middleware authenticate:', err);
    return res.status(500).json({ error: 'Error interno de autenticación.' });
  }
};

module.exports = { authenticate };

