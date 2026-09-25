'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ScanLine, History, Settings } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 w-full bg-background/80 backdrop-blur-xl border-t pb-safe z-40">
      <div className="max-w-md mx-auto flex justify-around p-2">
        <Link 
          href="/"
          className={`flex flex-col items-center justify-center w-20 h-14 rounded-xl transition-all duration-300 ${pathname === '/' ? 'text-primary font-bold' : 'text-muted-foreground hover:bg-muted font-medium'}`}
        >
          <ScanLine className={`w-6 h-6 mb-1 transition-transform duration-300 ${pathname === '/' ? 'scale-110' : ''}`} />
          <span className="text-[10px]">判定・記録</span>
        </Link>
        
        <Link 
          href="/history"
          className={`flex flex-col items-center justify-center w-20 h-14 rounded-xl transition-all duration-300 ${pathname === '/history' ? 'text-primary font-bold' : 'text-muted-foreground hover:bg-muted font-medium'}`}
        >
          <History className={`w-6 h-6 mb-1 transition-transform duration-300 ${pathname === '/history' ? 'scale-110' : ''}`} />
          <span className="text-[10px]">履歴</span>
        </Link>
        
        <Link 
          href="/settings"
          className={`flex flex-col items-center justify-center w-20 h-14 rounded-xl transition-all duration-300 ${pathname === '/settings' ? 'text-primary font-bold' : 'text-muted-foreground hover:bg-muted font-medium'}`}
        >
          <Settings className={`w-6 h-6 mb-1 transition-transform duration-300 ${pathname === '/settings' ? 'scale-110' : ''}`} />
          <span className="text-[10px]">設定</span>
        </Link>
      </div>
    </nav>
  )
}
