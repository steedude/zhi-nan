import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function StepCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  return (
    <Card className="animate-fade-up">
      <CardHeader className="p-6 pb-5 sm:p-8 sm:pb-5">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={cn('p-6 pt-0 sm:p-8 sm:pt-0', className)}>
        {children}
      </CardContent>
    </Card>
  )
}
