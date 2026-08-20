import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/axios';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendEmailVerification 
} from 'firebase/auth';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dfa_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Hydrate user from token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dfa_token');
      if (storedToken) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user || response.data);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth hydration failed:', error);
          localStorage.removeItem('dfa_token');
          localStorage.removeItem('dfa_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    // Listen to Firebase Auth state
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Automatically get the token if Firebase logs in
        const idToken = await firebaseUser.getIdToken();
        localStorage.setItem('dfa_token', idToken);
        setToken(idToken);
      }
    });

    initAuth();
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password, secretCode) => {
    let firebaseToken = null;
    try {
      // 1. Try Firebase Authentication First
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      firebaseToken = await userCredential.user.getIdToken();
      
      // Optionally check if email is verified
      if (!userCredential.user.emailVerified) {
        toast.error("Please verify your email address.");
      }
    } catch (error) {
      console.warn("Firebase auth failed, falling back to local DB auth (for backward compatibility)", error);
    }

    // 2. Local DB Authentication (SBVM logic & mapping)
    const payload = { email, password };
    if (secretCode) payload.secretCode = secretCode;
    
    // We send the request to backend. If Firebase succeeded, we could technically just call getProfile
    // But backend /login also handles SBVM verification. 
    // We'll let backend generate its own token as fallback, or use Firebase token.
    const response = await authAPI.login(payload);
    const data = response.data;
    
    // Prioritize Firebase token if available, otherwise use backend token
    const newToken = firebaseToken || data.token;
    const userData = data.user || data;
    
    localStorage.setItem('dfa_token', newToken);
    localStorage.setItem('dfa_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    let firebaseToken = null;
    try {
      // 1. Register with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await sendEmailVerification(userCredential.user);
      firebaseToken = await userCredential.user.getIdToken();
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      console.warn("Firebase registration failed, proceeding with local registration", error);
    }

    // 2. Register in Local Database
    const response = await authAPI.register(formData);
    const data = response.data;
    
    // Prioritize Firebase token
    const newToken = firebaseToken || data.token;
    const userData = data.user || data;
    
    localStorage.setItem('dfa_token', newToken);
    localStorage.setItem('dfa_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase logout error:", e);
    }
    localStorage.removeItem('dfa_token');
    localStorage.removeItem('dfa_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateProfile = useCallback(async (data) => {
    const response = await authAPI.updateProfile(data);
    const updatedUser = response.data.user || response.data;
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('dfa_user', JSON.stringify({ ...user, ...updatedUser }));
    return response.data;
  }, [user]);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
