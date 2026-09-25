'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-foreground">アプリのインストール</h3>
      <Button className="w-full" variant="outline">
        ホーム画面に追加
      </Button>
      {isIOS && (
        <p className="text-xs text-muted-foreground leading-relaxed bg-muted p-3 rounded-lg border border-border">
          iOS端末の場合、共有ボタン
          <span role="img" aria-label="share icon" className="mx-1">⎋</span>
          をタップして「ホーム画面に追加」
          <span role="img" aria-label="plus icon" className="mx-1">➕</span>
          を選択してください。
        </p>
      )}
    </div>
  )
}
