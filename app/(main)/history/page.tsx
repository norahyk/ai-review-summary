'use client'

import { useMasterDataContext } from '@/app/providers/master-data-provider'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HistoryPage() {
  const { records, brands, items, stores } = useMasterDataContext()

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h2 className="text-lg font-bold px-1">最近の購入履歴</h2>
      {records.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">履歴がありません。</p>
      ) : (
        records.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()).map(record => {
          const brand = brands.find(b => b.id === record.brand_id)
          const item = items.find(i => i.id === brand?.item_id)
          const store = stores.find(s => s.id === record.store_id)
          
          return (
            <Card key={record.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">{item?.name}</Badge>
                    <span className="text-xs font-medium text-muted-foreground">{record.purchase_date}</span>
                  </div>
                  <p className="font-bold">{brand?.name}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">{store?.name} • {record.content_amount}{item?.base_unit_label.replace(/\d+/, '')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl">¥{record.price_without_tax}</p>
                  <Badge variant="outline" className="mt-1 font-normal">単価 {record.unit_price}円</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
