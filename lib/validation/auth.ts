import { z } from 'zod'

export const authSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export type AuthFormValues = z.infer<typeof authSchema>
