import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {/* config options here */}

const withNextIntl = createNextIntlPlugin()

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: !process.env.CI,
  widenClientFileUpload: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
})
