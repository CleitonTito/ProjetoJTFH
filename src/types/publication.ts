export type PublicationStatus = 'draft' | 'published' | 'archived'

export interface PublicationUpdate {
  id: string
  message: string
  imageUrl?: string
  authorId: string
  authorName: string
  authorPhotoUrl?: string
  createdAt: Date
}

export interface Publication {
  id: string
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
  updates?: PublicationUpdate[]
  createdAt: Date
  updatedAt: Date
}
