import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { BaziChart } from '@/types/bazi'
import type { InterpretRequest } from '@/lib/validation/interpret'
import { reportServerError } from '@/lib/server/api-errors'

export type AppSupabaseClient = SupabaseClient<Database>

export async function saveReading(
  supabase: AppSupabaseClient,
  user: User,
  body: InterpretRequest,
  chart: BaziChart,
  interpretation: string,
): Promise<void> {
  const { error } = await supabase.from('readings').insert({
    user_id: user.id,
    category: body.category,
    question: body.question,
    gender: body.gender,
    solar_date: chart.solarDate,
    chart,
    interpretation,
  })
  if (error) {
    reportServerError('READING_SAVE_FAILED', {
      cause: error,
      context: {
        tags: { source: 'supabase', operation: 'readings.insert' },
        user: { id: user.id },
        extra: {
          category: body.category,
          solarDate: chart.solarDate,
        },
      },
    })
  }
}
