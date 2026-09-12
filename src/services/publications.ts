import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
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
import type { Publication, PublicationStatus, PublicationUpdate } from '@/types'

const publicationsCollection = collection(db, 'publications')

export interface PublicationInput {
  organizationId: string
  title: string
  subtitle?: string
  categoryId: string
  summary: string
  coverImageUrl: string
  galleryImages?: string[]
  content: string
  author: string
  date: Date
  highlighted: boolean
  status: PublicationStatus
  tags: string[]
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
    galleryImages: data.galleryImages ?? [],
    content: data.content,
    author: data.author,
    date: data.date?.toDate() ?? new Date(),
    highlighted: data.highlighted,
    status: data.status,
    tags: data.tags ?? [],
    updates: (data.updates ?? [])
      .map((update: PublicationUpdate & { createdAt: Timestamp }) => ({
        ...update,
        createdAt: update.createdAt?.toDate() ?? new Date(),
      }))
      .sort((a: PublicationUpdate, b: PublicationUpdate) => b.createdAt.getTime() - a.createdAt.getTime()),
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

export async function getPublicationById(id: string): Promise<Publication | null> {
  const snapshot = await getDoc(doc(db, 'publications', id))

  if (!snapshot.exists()) {
    return null
  }

  return mapDoc(snapshot as QueryDocumentSnapshot)
}

// Firestore rejeita `undefined` em qualquer escrita (addDoc/updateDoc) — campos
// opcionais como `subtitle` podem chegar como undefined quando vazios (ver
// `toInput` em PublicationsPage.tsx), então removemos essas chaves antes de
// gravar em vez de deixar o SDK estourar `invalid data` em runtime.
function omitUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as Partial<T>
}

export async function createPublication(input: PublicationInput): Promise<string> {
  const docRef = await addDoc(publicationsCollection, {
    ...omitUndefined(input),
    date: Timestamp.fromDate(input.date),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function updatePublication(id: string, input: PublicationInput): Promise<void> {
  // Ao contrário de addDoc, aqui um campo opcional undefined precisa virar
  // deleteField() — só omitir a chave deixaria um subtítulo antigo "preso" no
  // documento quando o usuário limpa o campo e salva.
  const fields = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value === undefined ? deleteField() : value]),
  )

  await updateDoc(doc(db, 'publications', id), {
    ...fields,
    date: Timestamp.fromDate(input.date),
    updatedAt: serverTimestamp(),
  })
}

export async function deletePublication(id: string): Promise<void> {
  await deleteDoc(doc(db, 'publications', id))
}

export async function setPublicationUpdates(
  id: string,
  updates: PublicationUpdate[],
): Promise<void> {
  await updateDoc(doc(db, 'publications', id), {
    updates: updates.map((update) => ({
      id: update.id,
      message: update.message,
      imageUrl: update.imageUrl ?? null,
      authorId: update.authorId,
      authorName: update.authorName,
      authorPhotoUrl: update.authorPhotoUrl ?? null,
      createdAt: Timestamp.fromDate(update.createdAt),
    })),
    updatedAt: serverTimestamp(),
  })
}
