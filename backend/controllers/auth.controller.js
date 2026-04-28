const supabase = require('../config/supabase');

/**
 * POST /api/auth/register
 * Crea el usuario en Supabase Auth y el perfil en la tabla users.
 */
const register = async (req, res) => {
  let authUserId = null;

  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'email, password y full_name son obligatorios.' });
    }

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('[register] Error Supabase Auth:', authError);
      // Usuario duplicado
      if (authError.message?.toLowerCase().includes('already')) {
        return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });
      }
      return res.status(400).json({ error: authError.message });
    }

    authUserId = authData.user.id;

    // 2. Crear perfil en la tabla users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUserId,
        email,
        full_name,
        phone: phone || null,
        role: 'clientela',
        is_adopter: false,
      })
      .select()
      .single();

    if (profileError) {
      console.error('[register] Error insertando perfil:', profileError);

      // Rollback seguro: eliminar usuario de Auth
      try {
        await supabase.auth.admin.deleteUser(authUserId);
      } catch (rollbackErr) {
        console.error('[register] Error en rollback deleteUser:', rollbackErr);
      }

      // Mensaje claro si el schema no está ejecutado
      if (profileError.code === 'PGRST205' || profileError.message?.includes('schema cache')) {
        return res.status(503).json({
          error: 'La base de datos no está configurada. Ejecuta database/schema.sql en Supabase.',
        });
      }

      return res.status(500).json({ error: `Error al crear perfil: ${profileError.message}` });
    }

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: profile,
    });
  } catch (err) {
    console.error('[register] Excepción no controlada:', err);

    // Rollback si el usuario de auth ya fue creado
    if (authUserId) {
      try { await supabase.auth.admin.deleteUser(authUserId); } catch {}
    }

    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/auth/login
 * Autentica al usuario con email y password mediante Supabase Auth.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son obligatorios.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    // Cargar perfil con rol
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_adopter')
      .eq('id', data.user.id)
      .single();

    return res.status(200).json({
      message: 'Login exitoso.',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: profile,
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/auth/me
 * Devuelve el perfil del usuario autenticado (req.user viene del middleware).
 */
const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

module.exports = { register, login, getMe };
