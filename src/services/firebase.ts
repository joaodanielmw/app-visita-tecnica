import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  // @ts-ignore — em algumas versões do firebase, os tipos do TS para React
  // Native ficam fora de sincronia com o que o bundle nativo de fato
  // exporta. A função existe e funciona em runtime (ver issues do
  // firebase-js-sdk sobre getReactNativePersistence). Esse ts-ignore é
  // inofensivo caso uma versão futura já exporte o tipo corretamente.
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  // Erro proposital e explícito: é muito comum esquecer de criar o .env
  // a partir do .env.example, e o erro nativo do Firebase nesse caso
  // ("auth/invalid-api-key") é bem mais difícil de diagnosticar.
  console.warn(
    '[firebase] Configuração não encontrada. Copie ".env.example" para ' +
      '".env" e preencha com as chaves do seu projeto Firebase.'
  );
}

// getApps()/getApp() evitam o erro "Firebase App named '[DEFAULT]' already
// exists" quando o Fast Refresh do Expo re-executa este módulo.
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth só deve ser chamado uma única vez por app. Em Fast
// Refresh ele pode ser re-executado e lançar erro — nesse caso,
// recuperamos a instância já existente com getAuth().
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db: Firestore = getFirestore(app);

export { app, auth, db };
