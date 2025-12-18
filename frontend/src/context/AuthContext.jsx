import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase'; // 🔥 your firebase config file

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🔁 Firebase Auth Listener
   * Runs automatically on:
   * - page refresh
   * - login
   * - logout
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 🔐 Get Firebase ID token
        const token = await firebaseUser.getIdToken();

        // Store token only (backend needs this)
        localStorage.setItem('token', token);
        console.log('Firebase user logged in:', firebaseUser);
        // Minimal user object for UI
        setUser(firebaseUser);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * 🔑 Login (Email + Password)
   */
  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    // user state handled automatically by listener
  };

  /**
   * 🆕 Register (Email + Password)
   */
  const register = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
    // user state handled automatically
  };

  /**
   * 🚪 Logout
   */
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
