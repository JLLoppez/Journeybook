import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(!!localStorage.getItem('token'));

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsBootstrapping(false);
        return;
      }

      try {
        authService.setAuthToken(storedToken);
        const response = await authService.getProfile();
        setUser(response.user);
        setToken(storedToken);
      } catch {
        // Access token may be expired — try refresh
        const storedRefresh = localStorage.getItem('refreshToken');
        if (storedRefresh) {
          try {
            const refreshed = await authService.refresh(storedRefresh);
            localStorage.setItem('token', refreshed.token);
            localStorage.setItem('refreshToken', refreshed.refreshToken);
            authService.setAuthToken(refreshed.token);
            setToken(refreshed.token);
            const profile = await authService.getProfile();
            setUser(profile.user);
          } catch {
            // Refresh also failed — clear everything
            clearSession();
          }
        } else {
          clearSession();
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, []);

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    authService.clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    // Persist refresh token
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    authService.setAuthToken(response.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register(name, email, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    authService.setAuthToken(response.token);
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token && !!user,
      isBootstrapping,
    }),
    [user, token, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
