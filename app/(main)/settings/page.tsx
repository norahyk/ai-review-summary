'use client'

import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PushNotificationManager } from '@/components/pwa/push-notification-manager'
import { InstallPrompt } from '@/components/pwa/install-prompt'

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-lg font-bold px-1">設定</h2>
      
      <Card>
        <div className="divide-y">
          <div className="p-5">
            <h3 className="font-medium mb-3">アカウント・データ管理</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" render={<Link href="/account" />} nativeButton={false}>
                プロフィール・共有設定
              </Button>
              <Button variant="outline" className="w-full justify-start" render={<Link href="/master" />} nativeButton={false}>
                マスタデータ管理 (追加・編集)
              </Button>
            </div>
          </div>

          <div className="p-5">
            <p className="font-medium">比較のメイン指標</p>
            <p className="text-sm text-muted-foreground mt-1 mb-3">クイック判定で大きく表示される比較基準</p>
            <Select defaultValue="latest" items={[
              { value: "latest", label: "最新の購入単価" },
              { value: "avg3", label: "直近3件の平均単価" },
              { value: "min1y", label: "過去1年の最安値" }
            ]}>
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">最新の購入単価</SelectItem>
                <SelectItem value="avg3">直近3件の平均単価</SelectItem>
                <SelectItem value="min1y">過去1年の最安値</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-5">
            <PushNotificationManager />
          </div>
          
          <div className="p-5">
            <InstallPrompt />
          </div>
        </div>
      </Card>
      
      <div className="text-center text-xs font-medium text-muted-foreground mt-8">
        v1.1.0 (shadcn/ui)
      </div>
    </div>
  )
}
