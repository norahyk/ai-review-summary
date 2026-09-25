import { ReactNode } from 'react'
import { MasterDataProvider } from '@/app/providers/master-data-provider'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <MasterDataProvider>
      <div className="min-h-[100dvh] bg-background flex flex-col font-sans pb-20 relative">
        <AppHeader />
        <main className="flex-1 p-5 max-w-lg mx-auto w-full">
          {children}
        </main>
        <BottomNav />
        <style dangerouslySetInnerHTML={{__html: `
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 1rem);
          }
        `}} />
      </div>
    </MasterDataProvider>
  )
}
