import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Attachment, Publication, PublicationStatus } from '@/types'

const publicationsCollection = collection(db, 'publications')

export interface PublicationInput {
  organizationId: string
  title: string
  subtitle?: string
  categoryId: string
  summary: string
  coverImageUrl: string
  content: string
  author: string
  date: Date
  highlighted: boolean
  status: PublicationStatus
  tags: string[]
  attachments?: Attachment[]
}

function mapDoc(docSnap: QueryDocumentSnapshot): Publication {
  const data = docSnap.data()

  return {
    id: docSnap.id,
    organizationId: data.organizationId,
    title: data.title,
    subtitle: data.subtitle,
    categoryId: data.categoryId,
    summary: data.summary,
    coverImageUrl: data.coverImageUrl,
    content: data.content,
    author: data.author,
    date: data.date?.toDate() ?? new Date(),
    highlighted: data.highlighted,
    status: data.status,
    tags: data.tags ?? [],
    attachments: data.attachments ?? [],
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  }
}

export async function getPublications(organizationId: string): Promise<Publication[]> {
  const q = query(
    publicationsCollection,
    where('organizationId', '==', organizationId),
    orderBy('date', 'desc'),
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map(mapDoc)
}

export async function createPublication(input: PublicationInput): Promise<string> {
  const docRef = await addDoc(publicationsCollection, {
    ...input,
    date: Timestamp.fromDate(input.date),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function updatePublication(id: string, input: PublicationInput): Promise<void> {
  await updateDoc(doc(db, 'publications', id), {
    ...input,
    date: Timestamp.fromDate(input.date),
    updatedAt: serverTimestamp(),
  })
}

export async function deletePublication(id: string): Promise<void> {
  await deleteDoc(doc(db, 'publications', id))
}
