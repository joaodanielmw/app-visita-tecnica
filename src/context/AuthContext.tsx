import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebase';

interface AuthContextValue {
  user: User | null;
  /** true enquanto o Firebase ainda não informou o estado inicial de
   *  autenticação (sessão restaurada do AsyncStorage ou não). */
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setInitializing(false);
      } else {
        const isGuest = await AsyncStorage.getItem('@visita_tecnica_guest');
        if (isGuest === 'true') {
          setUser({ uid: 'guest', isAnonymous: true, email: 'Convidado (Local)' } as User);
        } else {
          setUser(null);
        }
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user,
    initializing,
    signIn: async (email, password) => {
      await AsyncStorage.removeItem('@visita_tecnica_guest');
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    signUp: async (email, password) => {
      await AsyncStorage.removeItem('@visita_tecnica_guest');
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    },
    signInAsGuest: async () => {
      await AsyncStorage.setItem('@visita_tecnica_guest', 'true');
      setUser({ uid: 'guest', isAnonymous: true, email: 'Convidado (Local)' } as User);
    },
    signOutUser: async () => {
      await AsyncStorage.removeItem('@visita_tecnica_guest');
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>.');
  }
  return ctx;
}
