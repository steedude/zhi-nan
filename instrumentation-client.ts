import * as Sentry from '@sentry/nextjs'

const tracesSampleRate = process.env.NODE_ENV === 'production' ? 0.1 : 1

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
