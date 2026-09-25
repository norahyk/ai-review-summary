import AccountForm from './account-form'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function Account() {
    const supabase = await createClient()

    const { data: claimsData } = await supabase.auth.getClaims()

    return (
        <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
                    <div className="mb-6 text-center relative">
                        <Link href="/" className="absolute left-0 top-0 bottom-0 my-auto h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Link>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                            アカウント設定
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            プロフィール情報やアバター画像の変更
                        </p>
                    </div>

                    <AccountForm claims={claimsData?.claims ?? null} />
                </div>
            </div>
        </div>
    )
}