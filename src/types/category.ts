export interface Category {
  id: string
  organizationId: string
  name: string
  description?: string
  icon: string
  color: string
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}
