'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMasterData } from '@/app/hooks/use-master-data'
import { Loader2, Plus, ArrowLeft, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MasterDataPage() {
  const { items, brands, stores, loading, refetch, addBrand } = useMasterData()
  const supabase = createClient()
  const [userProfile, setUserProfile] = useState<{ household_id: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
        if (data) setUserProfile(data)
      }
    }
    fetchProfile()
  }, [supabase])

  // ==========================================
  // Forms State
  // ==========================================
  const [activeTab, setActiveTab] = useState("item")
  const [newItemName, setNewItemName] = useState('')
  const [newItemBaseUnitLabel, setNewItemBaseUnitLabel] = useState('100ml')
  const [newItemBaseUnitValue, setNewItemBaseUnitValue] = useState('100')
  const [newStoreName, setNewStoreName] = useState('')
  const [newBrandName, setNewBrandName] = useState('')
  const [selectedItemIdForBrand, setSelectedItemIdForBrand] = useState('')

  // ==========================================
  // Handlers
  // ==========================================
  const handleAddItem = async () => {
    if (!newItemName || !userProfile?.household_id || !newItemBaseUnitLabel || !newItemBaseUnitValue) return
    await supabase.from('items').insert([{ 
      name: newItemName, 
      household_id: userProfile.household_id,
      base_unit_label: newItemBaseUnitLabel,
      base_unit_value: parseFloat(newItemBaseUnitValue)
    }])
    setNewItemName('')
    refetch()
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('削除しますか？紐づくブランドや履歴も削除される可能性があります。')) {
      await supabase.from('items').delete().eq('id', id)
      refetch()
    }
  }

  const handleAddStore = async () => {
    if (!newStoreName || !userProfile?.household_id) return
    await supabase.from('stores').insert([{ name: newStoreName, household_id: userProfile.household_id }])
    setNewStoreName('')
    refetch()
  }

  const handleDeleteStore = async (id: string) => {
    if (confirm('削除しますか？紐づく履歴も削除される可能性があります。')) {
      await supabase.from('stores').delete().eq('id', id)
      refetch()
    }
  }

  const handleAddBrand = async () => {
    if (!newBrandName || !selectedItemIdForBrand) return
    await addBrand({ name: newBrandName, item_id: selectedItemIdForBrand })
    setNewBrandName('')
  }

  const handleDeleteBrand = async (id: string) => {
    if (confirm('削除しますか？紐づく商品も削除されます。')) {
      await supabase.from('brands').delete().eq('id', id)
      refetch()
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-background/95 backdrop-blur-md sticky top-0 z-30 border-b shadow-sm">
        <div className="px-5 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h1 className="text-xl font-bold">マスタデータ管理</h1>
        </div>
      </header>

      <main className="p-5 max-w-lg mx-auto w-full space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="item">カテゴリ</TabsTrigger>
            <TabsTrigger value="brand">ブランド</TabsTrigger>
            <TabsTrigger value="store">店舗</TabsTrigger>
          </TabsList>

          {/* ======================= Item Tab ======================= */}
          <TabsContent value="item" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">カテゴリ (Item) 追加</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setNewItemBaseUnitLabel('100ml'); setNewItemBaseUnitValue('100'); }}>100ml</Button>
                  <Button variant="outline" size="sm" onClick={() => { setNewItemBaseUnitLabel('100g'); setNewItemBaseUnitValue('100'); }}>100g</Button>
                  <Button variant="outline" size="sm" onClick={() => { setNewItemBaseUnitLabel('1個'); setNewItemBaseUnitValue('1'); }}>1個</Button>
                  <Button variant="outline" size="sm" onClick={() => { setNewItemBaseUnitLabel('10m'); setNewItemBaseUnitValue('10'); }}>10m</Button>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="カテゴリ名" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="flex-1" />
                  <Input placeholder="単位" value={newItemBaseUnitLabel} onChange={e => setNewItemBaseUnitLabel(e.target.value)} className="w-20" />
                  <Input type="number" placeholder="基準値" value={newItemBaseUnitValue} onChange={e => setNewItemBaseUnitValue(e.target.value)} className="w-20" />
                  <Button onClick={handleAddItem}><Plus className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 border rounded-xl bg-card">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({item.base_unit_label} / 基準値: {item.base_unit_value})</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ======================= Brand Tab ======================= */}
          <TabsContent value="brand" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">ブランド (Brand) 追加</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={selectedItemIdForBrand} onValueChange={(val) => setSelectedItemIdForBrand(val as string)} items={items.map(i => ({ value: i.id, label: i.name }))}>
                  <SelectTrigger><SelectValue placeholder="属するカテゴリを選択" /></SelectTrigger>
                  <SelectContent>
                    {items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input placeholder="キュキュット" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} />
                  <Button onClick={handleAddBrand} disabled={!selectedItemIdForBrand}><Plus className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {brands.map(brand => (
                <div key={brand.id} className="flex justify-between items-center p-3 border rounded-xl bg-card">
                  <div>
                    <div className="text-xs text-muted-foreground">{items.find(i => i.id === brand.item_id)?.name}</div>
                    <span className="font-medium">{brand.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteBrand(brand.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>



          {/* ======================= Store Tab ======================= */}
          <TabsContent value="store" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">店舗 (Store) 追加</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Input placeholder="コスモス" value={newStoreName} onChange={e => setNewStoreName(e.target.value)} />
                <Button onClick={handleAddStore}><Plus className="w-4 h-4" /></Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {stores.map(store => (
                <div key={store.id} className="flex justify-between items-center p-3 border rounded-xl bg-card">
                  <span className="font-medium">{store.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteStore(store.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
