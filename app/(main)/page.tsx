'use client'

import { useMasterDataContext } from '@/app/providers/master-data-provider'
import { Card } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { useMemo } from 'react'

export default function CategorySelectionPage() {
  const { items, loading } = useMasterDataContext()

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {
      'キッチン': [],
      '洗面': [],
      'ランドリー': [],
      'お風呂': [],
      'トイレ': [],
      'その他': []
    }

    items.forEach(item => {
      const loc = item.location || 'その他'
      if (!groups[loc]) {
        groups[loc] = []
      }
      groups[loc].push(item)
    })

    return groups
  }, [items])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const predefinedOrder = ['キッチン', '洗面', 'ランドリー', 'お風呂', 'トイレ', 'その他']
  const allKeys = Object.keys(groupedItems)
  const sortedKeys = Array.from(new Set([...predefinedOrder, ...allKeys]))

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-black mb-2">カテゴリを選択</h1>
        <p className="text-muted-foreground text-sm">判定したい商品のカテゴリをタップしてください。</p>
      </div>

      <div className="space-y-8">
        {sortedKeys.map(key => {
          const groupItems = groupedItems[key]
          if (!groupItems || groupItems.length === 0) return null

          return (
            <div key={key} className="space-y-4">
              <h2 className="text-lg font-bold border-b pb-2">{key}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {groupItems.map(item => (
                  <Link key={item.id} href={`/items/${item.id}`} className="block">
                    <Card className="hover:bg-muted/50 hover:border-primary/50 transition-all flex flex-col items-center justify-center p-6 h-32 text-center rounded-2xl cursor-pointer active:scale-95 duration-200">
                      <DynamicIcon name={item.icon_name || 'Box'} className="w-10 h-10 mb-3 text-primary" />
                      <span className="font-bold text-sm">{item.name}</span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
