export type UserRole = 'admin' | 'editor' | 'reader'

export interface AppUser {
  id: string
  organizationId: string
  name: string
  email: string
  role: UserRole
  photoUrl?: string
  createdAt: Date
  updatedAt: Date
}
