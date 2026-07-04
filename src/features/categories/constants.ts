import {
  Trophy,
  Calendar,
  MapPin,
  Megaphone,
  Info,
  Users,
  Flag,
  Medal,
  Bell,
  Clock,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'trophy', label: 'Troféu', icon: Trophy },
  { value: 'calendar', label: 'Calendário', icon: Calendar },
  { value: 'map-pin', label: 'Localização', icon: MapPin },
  { value: 'megaphone', label: 'Megafone', icon: Megaphone },
  { value: 'info', label: 'Informação', icon: Info },
  { value: 'users', label: 'Grupo', icon: Users },
  { value: 'flag', label: 'Largada/Chegada', icon: Flag },
  { value: 'medal', label: 'Medalha', icon: Medal },
  { value: 'bell', label: 'Aviso', icon: Bell },
  { value: 'clock', label: 'Horário', icon: Clock },
]

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map(({ value, icon }) => [value, icon]),
)

export const CATEGORY_COLORS: { value: string; label: string }[] = [
  { value: '#0B5D58', label: 'Verde-petróleo' },
  { value: '#2E6FA6', label: 'Azul' },
  { value: '#16A34A', label: 'Verde' },
  { value: '#D97706', label: 'Laranja' },
  { value: '#DC2626', label: 'Vermelho' },
  { value: '#7C3AED', label: 'Roxo' },
  { value: '#DB2777', label: 'Rosa' },
  { value: '#475569', label: 'Cinza' },
]
