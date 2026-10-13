import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAuthToken, clearAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on application mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (err) {
        // Not logged in or expired cookie
        setUser(null);
        clearAuthToken();
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    setUser(data.user);
    return data.user;
  };

  const register = async (fullName, email, password) => {
    const data = await authApi.register({
      full_name: fullName,
      email,
      password,
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      clearAuthToken();
      setUser(null);
    }
  };

  const updateUser = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
