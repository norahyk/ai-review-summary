'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Avatar from './avatar'
import Link from 'next/link'
import {
    Mail,
    User,
    AtSign,
    Globe,
    Save,
    LogOut,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Claims = { sub: string; email?: string;[key: string]: unknown }

export default function AccountForm({ claims }: { claims: Claims | null }) {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [fullname, setFullname] = useState<string | null>(null)
    const [username, setUsername] = useState<string | null>(null)
    const [website, setWebsite] = useState<string | null>(null)
    const [avatar_url, setAvatarUrl] = useState<string | null>(null)
    const [household_id, setHouseholdId] = useState<string | null>(null)
    const [notification, setNotification] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    const getProfile = useCallback(async () => {
        try {
            if (!claims?.sub) {
                setLoading(false)
                return
            }

            setLoading(true)

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`full_name, username, website, avatar_url, household_id`)
                .eq('id', claims.sub)
                .single()

            if (error && status !== 406) {
                console.log('エラーだよ')
                console.log(error)
                throw error
            }

            if (data) {
                setFullname(data.full_name)
                setUsername(data.username)
                setWebsite(data.website)
                setAvatarUrl(data.avatar_url)
                setHouseholdId(data.household_id)
            }
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'プロフィールの読み込みに失敗しました',
            })
        } finally {
            setLoading(false)
        }
    }, [claims, supabase])

    useEffect(() => {
        getProfile()
    }, [claims, getProfile])

    async function updateProfile({
        username,
        website,
        avatar_url,
        household_id,
    }: {
        username: string | null
        fullname: string | null
        website: string | null
        avatar_url: string | null
        household_id?: string | null
    }) {
        try {
            if (!claims?.sub) {
                setNotification({
                    type: 'error',
                    message: 'プロフィールを更新するにはログインが必要です',
                })
                return
            }

            setSaving(true)
            setNotification(null)

            const { error } = await supabase.from('profiles').upsert({
                id: claims.sub,
                full_name: fullname,
                username,
                website,
                avatar_url,
                household_id: household_id !== undefined ? household_id : undefined,
                updated_at: new Date().toISOString(),
            })
            if (error) throw error
            setNotification({
                type: 'success',
                message: 'プロフィールを更新しました',
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'プロフィールの更新に失敗しました',
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium">プロフィールを読み込み中...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100"
                >
                    <ArrowLeft className="w-4 h-4" />
                    ホームに戻る
                </Link>
                <span className="text-xs text-slate-400 font-mono">
                    {claims?.sub ? `ID: ${claims.sub.slice(0, 8)}...` : '未ログイン'}
                </span>
            </div>

            {/* アバターセクション */}
            <div className="py-2 flex justify-center">
                <Avatar
                    uid={claims?.sub ?? null}
                    url={avatar_url}
                    size={110}
                    onUpload={(url) => {
                        setAvatarUrl(url)
                        updateProfile({ fullname, username, website, avatar_url: url, household_id })
                    }}
                />
            </div>

            {/* 通知メッセージ */}
            {notification && (
                <div
                    className={`p-3.5 rounded-xl text-sm flex items-center gap-2.5 transition-all ${notification.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                            : 'bg-rose-50 text-rose-800 border border-rose-200/70'
                        }`}
                >
                    {notification.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* 入力フォーム */}
            <div className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
                    >
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        メールアドレス
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={claims?.email ?? ''}
                        disabled
                        className="font-mono bg-slate-50"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                        メールアドレスは変更できません
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="fullName"
                        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
                    >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        お名前（フルネーム）
                    </label>
                    <Input
                        id="fullName"
                        type="text"
                        placeholder="山田 太郎"
                        value={fullname || ''}
                        onChange={(e) => setFullname(e.target.value)}
                    />
                </div>

                <div>
                    <label
                        htmlFor="username"
                        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
                    >
                        <AtSign className="w-3.5 h-3.5 text-slate-400" />
                        ユーザー名
                    </label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="yamada_taro"
                        value={username || ''}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div>
                    <label
                        htmlFor="website"
                        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
                    >
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        Webサイト
                    </label>
                    <Input
                        id="website"
                        type="url"
                        placeholder="https://example.com"
                        value={website || ''}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <label
                        htmlFor="household_id"
                        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
                    >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        招待コード (共有グループID)
                    </label>
                    <div className="flex gap-2">
                        <Input
                            id="household_id"
                            type="text"
                            placeholder="パートナーのコードを入力して合流"
                            value={household_id || ''}
                            onChange={(e) => setHouseholdId(e.target.value)}
                            className="font-mono text-sm"
                        />
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => {
                                navigator.clipboard.writeText(household_id || '')
                                setNotification({ type: 'success', message: '招待コードをコピーしました' })
                            }}
                        >
                            コピー
                        </Button>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                        パートナーの招待コードを入力して更新すると、同じデータを共有できます。<br/>
                        （自分のコードを相手に教えて入力してもらっても構いません）
                    </p>
                </div>
            </div>

            {/* アクションボタン */}
            <div className="pt-2 space-y-3">
                <Button
                    type="button"
                    onClick={() => updateProfile({ fullname, username, website, avatar_url, household_id })}
                    disabled={saving || !claims?.sub}
                    className="w-full flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>更新中...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>プロフィールを更新</span>
                        </>
                    )}
                </Button>

                <form action="/auth/signout" method="post" className="w-full">
                    <Button
                        type="submit"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>ログアウト</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}