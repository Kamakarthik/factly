import { useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import API from '../utils/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await API.get('/users/me');
        setUser(response.data.data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email, password, username) => {
    try {
      const response = await API.post('/auth/signup', {
        username,
        email,
        password,
        passwordConfirm: password,
      });

      setUser(response.data.data.user);

      return { data: response.data.data.user, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Signup failed' },
      };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await API.post('/auth/login', {
        email,
        password,
      });

      setUser(response.data.data.user);

      return { data: response.data.data.user, error: null };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signOut = async () => {
    try {
      await API.get('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still remove token and user on error
      setUser(null);
    }
  };

  // Update user state
  const updateUser = (updatedData) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedData
    }));
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
