import * as icons from 'lucide-react'
import { LucideProps } from 'lucide-react'

export type IconName = keyof typeof icons

interface DynamicIconProps extends Omit<LucideProps, 'name'> {
  name?: string | null
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  if (!name) {
    const Fallback = icons['HelpCircle'] as any
    return <Fallback {...props} />
  }

  const Icon = (icons as any)[name]

  if (!Icon) {
    const Fallback = icons['HelpCircle'] as any
    return <Fallback {...props} />
  }

  return <Icon {...props} />
}
