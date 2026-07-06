import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Category } from '@/types'

const categoriesCollection = collection(db, 'categories')

export interface CategoryInput {
  organizationId: string
  name: string
  description?: string
  icon: string
  color: string
  order: number
  active: boolean
}

export async function getCategories(organizationId: string): Promise<Category[]> {
  const q = query(
    categoriesCollection,
    where('organizationId', '==', organizationId),
    orderBy('order', 'asc'),
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data()

    return {
      id: docSnap.id,
      organizationId: data.organizationId,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      order: data.order,
      active: data.active,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    }
  })
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const docRef = await addDoc(categoriesCollection, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  await updateDoc(doc(db, 'categories', id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id))
}
