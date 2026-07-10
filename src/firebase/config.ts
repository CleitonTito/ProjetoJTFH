import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

/**
 * Uma segunda instância do Firebase App, usada só para criar novas contas de
 * usuário sem derrubar a sessão do admin que está criando (o SDK do Firebase
 * loga automaticamente como a conta recém-criada na instância usada).
 */
export function getSecondaryAuth() {
  const secondaryApp =
    getApps().find((existingApp) => existingApp.name === 'Secondary') ??
    initializeApp(firebaseConfig, 'Secondary')

  return getAuth(secondaryApp)
}
