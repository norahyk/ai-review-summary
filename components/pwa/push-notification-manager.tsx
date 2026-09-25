'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from '@/app/actions'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register(
      new URL('../../lib/service-worker.js', import.meta.url),
      { scope: '/', updateViaCache: 'none' }
    )
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    })
    setSubscription(sub)
    const serializedSub = JSON.parse(JSON.stringify(sub))
    await subscribeUser(serializedSub)
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe()
    setSubscription(null)
    await unsubscribeUser()
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message)
      setMessage('')
    }
  }

  if (!isSupported) {
    return <p className="text-sm text-muted-foreground">Push notifications are not supported in this browser.</p>
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">プッシュ通知</h3>
      {subscription ? (
        <div className="space-y-3">
          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> 通知は有効です
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="テストメッセージ"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={sendTestNotification} variant="secondary">
              送信
            </Button>
          </div>
          <Button 
            onClick={unsubscribeFromPush}
            variant="destructive"
            className="w-full"
          >
            通知を解除する
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">通知を受け取って、より便利に利用しましょう。</p>
          <Button onClick={subscribeToPush} className="w-full">
            プッシュ通知を許可する
          </Button>
        </div>
      )}
    </div>
  )
}
