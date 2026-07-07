import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** shadcn/ui 慣用 className 合併工具：條件 class + Tailwind 衝突合併。 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
