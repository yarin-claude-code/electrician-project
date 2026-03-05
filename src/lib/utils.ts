import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { ClassValue } from 'clsx'

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))

export const formatDateHe = (date: string | Date): string =>
  new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))

const INSTALLATION_TYPE_MAP: Record<string, string> = {
  residential: 'מגורים',
  commercial: 'מסחרי',
  industrial: 'תעשייתי',
  other: 'אחר',
}

export const installationTypeLabel = (type: string | null): string =>
  type ? (INSTALLATION_TYPE_MAP[type] ?? type) : ''
