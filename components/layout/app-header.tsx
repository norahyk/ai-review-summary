'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ScanLine, Search, User, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useMasterDataContext } from '@/app/providers/master-data-provider'

export function AppHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { brands, items, records } = useMasterDataContext()

  const getSearchResults = () => {
    if (!searchQuery.trim()) return []
    
    const lowerQuery = searchQuery.toLowerCase()
    const matchedBrands = brands.filter(b => b.name.toLowerCase().includes(lowerQuery) || items.find(i => i.id === b.item_id)?.name.toLowerCase().includes(lowerQuery))
    
    return matchedBrands.map(brand => {
      const item = items.find(i => i.id === brand.item_id)
      const latestRecord = records.filter(r => r.brand_id === brand.id)
                                  .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())[0]
      
      return {
        brand,
        item,
        latestPrice: latestRecord?.unit_price || null,
        date: latestRecord?.purchase_date || null
      }
    })
  }

  const searchResults = getSearchResults()

  return (
    <header className="bg-background/95 backdrop-blur-md sticky top-0 z-30 border-b shadow-sm">
      <div className="px-5 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-primary" />
          買い時チェッカー
        </h1>
        <div className="flex items-center gap-1">
          <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="w-5 h-5" />
              </Button>
            }
          />
          <SheetContent side="bottom" className="h-[80vh] flex flex-col">
            <SheetHeader>
              <SheetTitle>アイテム・ブランドを検索</SheetTitle>
            </SheetHeader>
            <div className="py-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  autoFocus
                  placeholder="検索..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto mt-2">
              {searchQuery.trim() ? (
                <div className="space-y-3">
                  {searchResults.length > 0 ? (
                    searchResults.map((res, idx) => (
                      <div key={idx} className="bg-card border p-4 rounded-xl flex justify-between items-center shadow-sm">
                        <div>
                          <Badge variant="secondary" className="mb-1">{res.item?.name}</Badge>
                          <p className="font-bold">{res.brand.name}</p>
                        </div>
                        <div className="text-right">
                          {res.latestPrice ? (
                            <>
                              <p className="font-bold text-lg text-primary">{res.latestPrice}円<span className="text-xs text-muted-foreground font-normal">/単位</span></p>
                              <p className="text-xs text-muted-foreground">{res.date}</p>
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">履歴なし</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground mt-10">見つかりませんでした</p>
                  )}
                </div>
              ) : (
                <div className="mt-10 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>商品名やカテゴリで検索して<br/>最新の相場を確認できます</p>
                </div>
              )}
            </div>
          </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" className="rounded-full" render={<Link href="/account" />} nativeButton={false}>
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
