export type PublicationStatus = 'draft' | 'published' | 'archived'

export interface Attachment {
  name: string
  url: string
  size?: number
  type?: string
}

export interface Publication {
  id: string
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
  createdAt: Date
  updatedAt: Date
}
