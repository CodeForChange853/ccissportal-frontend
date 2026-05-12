import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client';

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);



const parseJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(
      decodeURIComponent(
        window.atob(base64).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      )
    );
  } catch {
    return null;
  }
};

// Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp > Date.now() / 1000) {
        const storedData = JSON.parse(localStorage.getItem('user_data') || '{}');
        setUser({
          username: decoded.sub,
          role: storedData.account_role || decoded.role || 'STUDENT',
          id: storedData.account_id || decoded.id,
          authenticated: true,
        });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const setSession = (loginData) => {
    const { access_token } = loginData;
    const decoded = parseJwt(access_token);
    if (!decoded) return false;

    const userData = {
      username: decoded.sub,
      role: loginData.account_role || decoded.role || 'STUDENT',
      id: decoded.id,
      authenticated: true,
    };

    localStorage.setItem('token', access_token);
    localStorage.setItem('user_data', JSON.stringify(loginData));
    setUser(userData);
    return true;
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/authentication/login', {
        email_address: username,
        plain_text_password: password
      });

      if (setSession(response.data)) {
        return { success: true, role: response.data.account_role || 'STUDENT' };
      }
      throw new Error('Failed to initialize session.');
    } catch (error) {
      let errorMessage = 'Login failed. Please check your credentials.';
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        errorMessage = `Invalid format: ${detail[0].loc[1]} is ${detail[0].msg}`;
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (typeof detail === 'object' && detail !== null) {
        // Handle object-based details like maintenance info
        errorMessage = detail.message || detail.reason || errorMessage;
      }

      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setSession, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}