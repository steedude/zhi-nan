import { z } from 'zod'
import { QUESTION_CATEGORIES } from '@/configs/questions'
import { isValidDate } from '@/utils/date'

export const interpretRequestSchema = z
  .object({
    question: z.string().trim().min(1).max(500),
    category: z.enum(QUESTION_CATEGORIES),
    locale: z.enum(['zh-TW', 'en']),
    year: z.number().int().min(1900).max(2100),
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
    gender: z.enum(['male', 'female']),
  })
  .refine((value) => isValidDate(value.year, value.month, value.day), {
    message: 'Invalid date',
    path: ['day'],
  })

export type InterpretRequest = z.infer<typeof interpretRequestSchema>
