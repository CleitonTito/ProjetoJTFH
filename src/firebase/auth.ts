import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
} from 'firebase/auth'
import { auth } from './config'

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function signOut() {
  return firebaseSignOut(auth)
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const user = auth.currentUser

  if (!user?.email) {
    throw new Error('Usuário não autenticado.')
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  await updatePassword(user, newPassword)
}
