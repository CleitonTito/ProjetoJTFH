import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { db, getSecondaryAuth } from '@/firebase/config'
import { toAuthEmail } from '@/utils/phoneAuth'
import type { AppUser, UserRole } from '@/types'

function mapUserDoc(id: string, data: Record<string, unknown>): AppUser {
  const createdAt = data.createdAt as { toDate?: () => Date } | undefined
  const updatedAt = data.updatedAt as { toDate?: () => Date } | undefined

  return {
    id,
    organizationId: data.organizationId as string,
    name: data.name as string,
    email: (data.email as string | undefined) ?? undefined,
    phone: (data.phone as string | undefined) ?? undefined,
    role: data.role as UserRole,
    photoUrl: data.photoUrl as string | undefined,
    createdAt: createdAt?.toDate?.() ?? new Date(),
    updatedAt: updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snapshot = await getDoc(doc(db, 'users', uid))

  if (!snapshot.exists()) {
    return null
  }

  return mapUserDoc(snapshot.id, snapshot.data())
}

export async function getUsers(organizationId: string): Promise<AppUser[]> {
  const q = query(collection(db, 'users'), where('organizationId', '==', organizationId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docSnap) => mapUserDoc(docSnap.id, docSnap.data()))
}

export interface CreateUserInput {
  organizationId: string
  name: string
  role: UserRole
  password: string
  phone?: string
  email?: string
}

export async function createUser(input: CreateUserInput): Promise<void> {
  const identifier = input.phone || input.email

  if (!identifier) {
    throw new Error('Informe um telefone ou e-mail.')
  }

  const authEmail = toAuthEmail(identifier)
  const secondaryAuth = getSecondaryAuth()

  const credential = await createUserWithEmailAndPassword(
    secondaryAuth,
    authEmail,
    input.password,
  )
  await signOut(secondaryAuth)

  await setDoc(doc(db, 'users', credential.user.uid), {
    organizationId: input.organizationId,
    name: input.name,
    role: input.role,
    phone: input.phone || null,
    email: input.email || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export interface UpdateUserProfileInput {
  name: string
  role: UserRole
}

export async function updateUserProfile(uid: string, input: UpdateUserProfileInput): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    name: input.name,
    role: input.role,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid))
}
