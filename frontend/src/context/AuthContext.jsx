import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión al montar
  useEffect(() => {
    const token    = localStorage.getItem('vc_token');
    const cached   = localStorage.getItem('vc_user');
    if (token && cached) {
      try { setUser(JSON.parse(cached)); } catch {}
      // Refrescar perfil en background
      authApi.me()
        .then(r => { setUser(r.data.user); localStorage.setItem('vc_user', JSON.stringify(r.data.user)); })
        .catch(() => { localStorage.removeItem('vc_token'); localStorage.removeItem('vc_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await authApi.login({ email, password });
    localStorage.setItem('vc_token', r.data.access_token);
    localStorage.setItem('vc_user',  JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vc_token');
    localStorage.removeItem('vc_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const r = await authApi.me();
    setUser(r.data.user);
    localStorage.setItem('vc_user', JSON.stringify(r.data.user));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
