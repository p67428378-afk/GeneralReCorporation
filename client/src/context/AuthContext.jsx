import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'usr-1',
    email: 'test@example.com',
    name: 'Eleanor Vance, FCAS (Chief Underwriter)',
    role: 'CHIEF_UNDERWRITER',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('genre_auth_token');
    if (token) {
      api.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Keep default mock user for seamless dev testing
          setIsAuthenticated(true);
        });
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('genre_auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
