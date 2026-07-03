import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { AppUser } from '@/types'

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snapshot = await getDoc(doc(db, 'users', uid))

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data()

  return {
    id: snapshot.id,
    organizationId: data.organizationId,
    name: data.name,
    email: data.email,
    role: data.role,
    photoUrl: data.photoUrl,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}
