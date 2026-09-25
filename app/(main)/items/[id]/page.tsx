'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, AlertCircle, Store, Calendar, TrendingDown, ArrowRight, Loader2, ChevronLeft } from 'lucide-react'
import { useMasterDataContext } from '@/app/providers/master-data-provider'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ItemComparePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const selectedItem = params?.id

  const { items, brands, stores, records, loading, addRecord, addBrand } = useMasterDataContext()
  const [userProfile, setUserProfile] = useState<{ household_id: string } | null>(null)

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandPackageType, setNewBrandPackageType] = useState<string>('none')
  const [isAddingBrand, setIsAddingBrand] = useState(false)

  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [brandSearch, setBrandSearch] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [amount, setAmount] = useState<string>('')

  const [recordStore, setRecordStore] = useState<string>('')
  const [recordDate, setRecordDate] = useState<string>('')

  const [result, setResult] = useState<{ unitPrice: number, diff: number, isCheaper: boolean, isSamePrice?: boolean, hasPastRecords?: boolean, avgPrice: number, latestUnitPrice?: number, storeId?: string, unitDiff?: number } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
        if (data) setUserProfile(data)
      }
    }
    fetchProfile()
  }, [])

  const currentItem = items.find(i => i.id === selectedItem)

  const handleCalculate = () => {
    if (!selectedItem || !selectedBrand || !price || !amount || !currentItem) return;

    const numPrice = parseFloat(price)
    const numAmount = parseFloat(amount)

    const unitPrice = numPrice / (numAmount / currentItem.base_unit_value)

    const pastRecords = records.filter(r => r.brand_id === selectedBrand)
    if (pastRecords.length > 0) {
      const latestRecord = pastRecords.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())[0]
      const avgPrice = pastRecords.reduce((acc, r) => acc + r.unit_price, 0) / pastRecords.length

      const unitDiff = latestRecord.unit_price - unitPrice
      const totalDiff = unitDiff * (numAmount / currentItem.base_unit_value)
      
      const isSamePrice = Math.abs(totalDiff) < 0.5;

      setResult({ 
        unitPrice, 
        diff: totalDiff, 
        isCheaper: totalDiff >= 0.5, 
        isSamePrice,
        hasPastRecords: true,
        avgPrice, 
        latestUnitPrice: latestRecord.unit_price,
        storeId: latestRecord.store_id, 
        unitDiff 
      })
    } else {
      setResult({ unitPrice, diff: 0, isCheaper: false, isSamePrice: false, hasPastRecords: false, avgPrice: 0 })
    }
  }

  const handleOpenRecordModal = () => {
    const today = new Date().toISOString().split('T')[0]
    setRecordDate(today)

    if (records.length > 0) {
      const latestStore = records.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())[0].store_id
      setRecordStore(latestStore)
    } else {
      setRecordStore(stores.length > 0 ? stores[0].id : '')
    }

    setIsRecordModalOpen(true)
  }

  const handleSaveRecord = async () => {
    if (!result || !selectedBrand || !price || !amount || !recordStore || !recordDate || !userProfile?.household_id) return;

    await addRecord({
      brand_id: selectedBrand,
      store_id: recordStore,
      price_without_tax: parseFloat(price),
      content_amount: parseFloat(amount),
      unit_price: Number(result.unitPrice.toFixed(1)),
      purchase_date: recordDate,
      household_id: userProfile.household_id
    })

    setIsRecordModalOpen(false)

    setResult(null)
    setPrice('')
    setAmount('')
    router.push('/history')
  }

  const filteredBrands = brands.filter(b => b.item_id === selectedItem)
  
  const formatBrandName = (brand: any) => {
    if (!brand) return '';
    const ptMap: Record<string, string> = { bottle: '本体', refill: '詰替', box: '箱' };
    const suffix = brand.package_type && ptMap[brand.package_type] ? ` (${ptMap[brand.package_type]})` : '';
    return `${brand.name}${suffix}`;
  }

  const filteredBrandsForCombobox = brandSearch
    ? filteredBrands.filter(b => formatBrandName(b).toLowerCase().includes(brandSearch.toLowerCase()))
    : filteredBrands

  const handleAddBrand = async () => {
    if (!selectedItem || !newBrandName.trim()) return
    setIsAddingBrand(true)
    const newBrand = await addBrand({
      item_id: selectedItem as string,
      name: newBrandName.trim(),
      package_type: newBrandPackageType === 'none' ? null : newBrandPackageType
    })
    setIsAddingBrand(false)
    if (newBrand) {
      setIsAddBrandModalOpen(false)
      setSelectedBrand(newBrand.id)
      setNewBrandName('')
      setNewBrandPackageType('none')
      setResult(null)
    }
  }

  const categoryBrandIds = filteredBrands.map(b => b.id)
  const categoryRecords = records.filter(r => categoryBrandIds.includes(r.brand_id))
  
  const targetRecords = selectedBrand ? records.filter(r => r.brand_id === selectedBrand) : categoryRecords
  const latestRecord = targetRecords.length > 0 ? [...targetRecords].sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())[0] : null
  const lowestRecord = targetRecords.length > 0 ? [...targetRecords].sort((a, b) => a.unit_price - b.unit_price)[0] : null

  const suggestedAmounts = selectedBrand
    ? Array.from(new Set(records.filter(r => r.brand_id === selectedBrand).map(r => r.content_amount)))
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground font-medium">アイテムが見つかりません</p>
        <Button variant="outline" onClick={() => router.push('/')}>
          <ChevronLeft className="w-4 h-4 mr-2" /> トップへ戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-black">{currentItem.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>クイック判定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">ブランド / 商品</label>
            <Combobox
              value={formatBrandName(filteredBrands.find(b => b.id === selectedBrand))}
              onValueChange={(val: string | null) => {
                const brand = filteredBrands.find(b => formatBrandName(b) === val);
                setSelectedBrand(brand ? brand.id : '');
                setResult(null);
              }}
              onInputValueChange={setBrandSearch}
            >
              <ComboboxInput placeholder="検索または新規登録..." showClear={true} />
              <ComboboxContent className="min-w-(--anchor-width) w-auto">
                <ComboboxList>
                  {filteredBrandsForCombobox.map(b => (
                    <ComboboxItem key={b.id} value={formatBrandName(b)}>{formatBrandName(b)}</ComboboxItem>
                  ))}
                </ComboboxList>
                <ComboboxEmpty>
                  <div className="p-3 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">「{brandSearch}」は見つかりません</p>
                    <Button
                      size="sm"
                      className="w-full"
                      onPointerDown={(e) => {
                        e.preventDefault()
                        setNewBrandName(brandSearch)
                        setIsAddBrandModalOpen(true)
                      }}
                    >
                      新規登録する
                    </Button>
                  </div>
                </ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-primary" />
              {selectedBrand ? 'このブランドの相場' : 'カテゴリ全体の相場'}
            </h3>
            {targetRecords.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95">
                {latestRecord && (
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> 直近 ({latestRecord.purchase_date})
                      </p>
                      {!selectedBrand && <p className="text-[10px] font-medium mb-0.5 line-clamp-2 opacity-80" title={formatBrandName(brands.find(b => b.id === latestRecord.brand_id))}>{formatBrandName(brands.find(b => b.id === latestRecord.brand_id))}</p>}
                      <p className="text-sm font-bold">
                        ¥{latestRecord.price_without_tax} / {latestRecord.content_amount}
                        {currentItem?.base_unit_label.replace(/\d+/, '') || ''}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        単価: {latestRecord.unit_price.toFixed(1)}円
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 line-clamp-1">
                        <Store className="w-3 h-3 shrink-0" />
                        {stores.find(s => s.id === latestRecord.store_id)?.name || '不明'}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-2 h-7 text-xs"
                      onClick={() => {
                        setPrice(latestRecord.price_without_tax.toString())
                        setAmount(latestRecord.content_amount.toString())
                        if (!selectedBrand) setSelectedBrand(latestRecord.brand_id)
                        setResult(null)
                      }}
                    >
                      反映
                    </Button>
                  </div>
                )}
                {lowestRecord && (
                  <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> 最安 ({lowestRecord.purchase_date})
                      </p>
                      {!selectedBrand && <p className="text-[10px] font-medium mb-0.5 line-clamp-2 text-emerald-700/80 dark:text-emerald-400/80" title={formatBrandName(brands.find(b => b.id === lowestRecord.brand_id))}>{formatBrandName(brands.find(b => b.id === lowestRecord.brand_id))}</p>}
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ¥{lowestRecord.price_without_tax} / {lowestRecord.content_amount}
                        {currentItem?.base_unit_label.replace(/\d+/, '') || ''}
                      </p>
                      <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-bold">
                        単価: {lowestRecord.unit_price.toFixed(1)}円
                      </p>
                      <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 flex items-center gap-1 line-clamp-1">
                        <Store className="w-3 h-3 shrink-0" />
                        {stores.find(s => s.id === lowestRecord.store_id)?.name || '不明'}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-2 h-7 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      onClick={() => {
                        setPrice(lowestRecord.price_without_tax.toString())
                        setAmount(lowestRecord.content_amount.toString())
                        if (!selectedBrand) setSelectedBrand(lowestRecord.brand_id)
                        setResult(null)
                      }}
                    >
                      反映
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground border">
                過去の購入記録がありません
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">税抜価格</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => { setPrice(e.target.value); setResult(null); }}
                  className="pr-8 text-right font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">円</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">内容量</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setResult(null); }}
                  className="pr-12 text-right font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {currentItem?.base_unit_label.replace(/\d+/, '') || '単位'}
                </span>
              </div>
              {suggestedAmounts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {suggestedAmounts.map(amt => (
                    <Button key={amt} variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => { setAmount(amt.toString()); setResult(null); }}>
                      {amt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!selectedBrand || !price || !amount}
            className="w-full mt-2 font-bold"
            size="lg"
          >
            計算して比較
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={result.isCheaper ? 'bg-emerald-500/10 border-emerald-500/20' : (!result.hasPastRecords || result.isSamePrice) ? '' : 'bg-destructive/5 border-destructive/20'}>
          <CardContent className="pt-6 text-center space-y-4">
            {!result.hasPastRecords ? (
              <>
                <div className="flex justify-center mb-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Store className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="space-y-1 pb-2">
                  <p className="text-sm font-bold text-primary">初めての登録です</p>
                  <h2 className="text-2xl font-black tracking-tight">基準価格として記録しましょう</h2>
                </div>
                <div className="py-4 px-4 rounded-xl bg-background/50 border">
                  <p className="text-xs text-muted-foreground mb-1">今回の計算単価</p>
                  <p className="font-bold text-2xl">{result.unitPrice.toFixed(1)}<span className="text-base font-normal text-muted-foreground">円</span></p>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-2">
                  {result.isCheaper ? (
                    <div className="bg-emerald-500/20 p-3 rounded-full">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                  ) : result.isSamePrice ? (
                    <div className="bg-muted p-3 rounded-full">
                      <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="bg-destructive/20 p-3 rounded-full">
                      <AlertCircle className="w-10 h-10 text-destructive" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 pb-2">
                  <p className={`text-sm font-bold ${result.isCheaper ? 'text-emerald-600' : result.isSamePrice ? 'text-muted-foreground' : 'text-destructive'}`}>
                    {result.isCheaper ? '✨ 買い時です！' : result.isSamePrice ? '前回と同じ価格水準です' : '⚠️ ちょっと待って！'}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {result.isCheaper 
                      ? `前回より実質 ${result.diff.toFixed(0)}円 お得` 
                      : result.isSamePrice 
                          ? '差額なし' 
                          : `前回より実質 ${Math.abs(result.diff).toFixed(0)}円 割高`}
                  </h2>
                </div>

                <div className="py-4 px-4 rounded-xl bg-background/50 border space-y-3">
                  <div className="grid grid-cols-2 gap-4 divide-x">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">今回の計算単価</p>
                      <p className="font-bold text-lg">{result.unitPrice.toFixed(1)}<span className="text-sm font-normal text-muted-foreground">円</span></p>
                      {result.unitDiff !== undefined && Math.abs(result.unitDiff) >= 0.05 && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          ({currentItem?.base_unit_value}{currentItem?.base_unit_label.replace(/\d+/, '') || ''}あたり {Math.abs(result.unitDiff).toFixed(1)}円 {result.unitDiff > 0 ? '安い' : '高い'})
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">前回の計算単価</p>
                      <p className="font-bold text-lg">{result.latestUnitPrice !== undefined ? result.latestUnitPrice.toFixed(1) : '-'}<span className="text-sm font-normal text-muted-foreground">円</span></p>
                    </div>
                  </div>

                  {!result.isCheaper && !result.isSamePrice && result.storeId && (
                    <div className="pt-3 border-t border-destructive/20 mt-3">
                      <p className="text-sm text-destructive font-bold flex items-center justify-center gap-1.5">
                        <Store className="w-4 h-4" />
                        前回の購入店: {stores.find(s => s.id === result.storeId)?.name || '不明'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            <Dialog open={isRecordModalOpen} onOpenChange={(open) => {
              if (open) handleOpenRecordModal()
              else setIsRecordModalOpen(false)
            }}>
              <DialogTrigger
                render={
                  <Button className="w-full font-bold" size="lg" variant={result.isCheaper ? 'default' : 'secondary'}>
                    この価格で記録する
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle>購入記録の保存</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="bg-primary/5 p-4 rounded-xl border flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-primary">{formatBrandName(brands.find(b => b.id === selectedBrand))}</p>
                      <p className="text-xs text-primary/80">{amount} {currentItem?.base_unit_label.replace(/\d+/, '')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-primary">¥{price}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1"><Store className="w-4 h-4" /> 店舗</label>
                    <Select value={recordStore} onValueChange={(val) => setRecordStore(val as string)} items={stores.map(s => ({ value: s.id, label: s.name }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent className="min-w-(--anchor-width) w-auto">
                        {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1"><Calendar className="w-4 h-4" /> 購入日</label>
                    <Input
                      type="date"
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleSaveRecord} className="w-full mt-2 font-bold" size="lg">
                    保存する
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}



      <Dialog open={isAddBrandModalOpen} onOpenChange={(open) => {
        setIsAddBrandModalOpen(open)
        if (!open) {
          setNewBrandName('')
          setNewBrandPackageType('none')
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>ブランド / 商品の新規登録</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">アイテム</label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {currentItem?.name}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">ブランド / 商品名</label>
              <Input
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="例: セブンプレミアム"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">パッケージタイプ（任意）</label>
              <Select value={newBrandPackageType} onValueChange={setNewBrandPackageType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent className="min-w-(--anchor-width) w-auto">
                  <SelectItem value="none">指定なし（電池やラップなど）</SelectItem>
                  <SelectItem value="bottle">本体・ボトル</SelectItem>
                  <SelectItem value="refill">詰替用</SelectItem>
                  <SelectItem value="box">箱・ケース</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddBrand}
              className="w-full mt-2 font-bold"
              size="lg"
              disabled={!newBrandName.trim() || isAddingBrand}
            >
              {isAddingBrand ? <Loader2 className="w-5 h-5 animate-spin" /> : '登録する'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
