import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  firebaseUser: null,
  token: null,
  isLoading: true,
  
  login: (firebaseUser, token, dbUser) => set({ 
    firebaseUser, 
    token, 
    user: dbUser, 
    isLoading: false 
  }),
  
  logout: () => set({ 
    user: null, 
    firebaseUser: null, 
    token: null, 
    isLoading: false 
  }),
  
  setToken: (token) => set({ token }),
  
  setLoading: (isLoading) => set({ isLoading })
}));
