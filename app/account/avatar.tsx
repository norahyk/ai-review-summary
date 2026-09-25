'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Camera, Loader2, User } from 'lucide-react'

export default function Avatar({
    uid,
    url,
    size = 120,
    onUpload,
}: {
    uid: string | null
    url: string | null
    size: number
    onUpload: (url: string) => void
}) {
    const supabase = createClient()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        async function downloadImage(path: string) {
            try {
                const { data, error } = await supabase.storage.from('avatars').download(path)
                if (error) {
                    throw error
                }

                const url = URL.createObjectURL(data)
                setAvatarUrl(url)
            } catch (error) {
                console.log('Error downloading image: ', error)
            }
        }

        if (url) downloadImage(url)
    }, [url, supabase])

    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${uid}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            onUpload(filePath)
        } catch (error) {
            alert('Error uploading avatar!')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative group">
                <div
                    className="relative rounded-full overflow-hidden bg-slate-100 ring-4 ring-white shadow-md border border-slate-200 flex items-center justify-center transition-all group-hover:ring-indigo-100"
                    style={{ width: size, height: size }}
                >
                    {avatarUrl ? (
                        <Image
                            width={size}
                            height={size}
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-slate-400 bg-slate-100">
                            <User className="w-1/2 h-1/2" />
                        </div>
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    )}
                </div>

                <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer ring-2 ring-white"
                    title="写真を変更"
                >
                    <Camera className="w-4 h-4" />
                </label>
            </div>

            <div className="flex flex-col items-center">
                <label
                    htmlFor="avatar-upload"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors"
                >
                    {uploading ? 'アップロード中...' : 'プロフィール画像を変更'}
                </label>
                <input
                    className="sr-only"
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                />
            </div>
        </div>
    )
}