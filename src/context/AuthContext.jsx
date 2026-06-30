import { createContext, useContext, useState, useEffect } from 'react';
import { authLogin, authRegistro, authPerfil } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authPerfil()
      .then(u => setUsuario(u))
      .catch(() => { setToken(null); localStorage.removeItem('token'); })
      .finally(() => setLoading(false));
  }, [token]);

  function guardarToken(t) {
    localStorage.setItem('token', t);
    setToken(t);
  }

  async function login(email, password) {
    const data = await authLogin(email, password);
    guardarToken(data.token);
    setUsuario(data.usuario);
    return data;
  }

  async function register(nombre, email, password, telefono) {
    const data = await authRegistro(nombre, email, password, telefono);
    guardarToken(data.token);
    setUsuario(data.usuario);
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
