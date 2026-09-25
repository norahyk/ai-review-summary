import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Item = { id: string; name: string; icon_name?: string | null; location?: string | null; base_unit_label: string; base_unit_value: number }
export type Brand = { id: string; item_id: string; name: string; package_type?: string | null; }
export type StoreDef = { id: string; name: string }
export type PurchaseRecord = { 
  id: string; 
  brand_id: string; 
  store_id: string;
  price_without_tax: number; 
  content_amount: number; 
  unit_price: number; 
  purchase_date: string;
}

export function useMasterData() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [stores, setStores] = useState<StoreDef[]>([])
  const [records, setRecords] = useState<PurchaseRecord[]>([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [
        { data: itemsData },
        { data: brandsData },
        { data: storesData },
        { data: recordsData }
      ] = await Promise.all([
        supabase.from('items').select('*').order('name'),
        supabase.from('brands').select('*').order('name'),
        supabase.from('stores').select('*').order('name'),
        supabase.from('purchase_records').select('*').order('purchase_date', { ascending: false })
      ])

      if (itemsData) setItems(itemsData as Item[])
      if (brandsData) setBrands(brandsData as Brand[])
      if (storesData) setStores(storesData as StoreDef[])
      if (recordsData) setRecords(recordsData as PurchaseRecord[])
      
    } catch (error) {
      console.error('Error fetching master data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const addRecord = async (record: Omit<PurchaseRecord, 'id' | 'created_at'> & { household_id: string }) => {
    const { data, error } = await supabase
      .from('purchase_records')
      .insert([record])
      .select()
      .single()
      
    if (error) {
      console.error('Error adding record:', error)
      return null
    }
    
    if (data) {
      setRecords(prev => [data as PurchaseRecord, ...prev].sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()))
    }
    return data
  }

  const addBrand = async (brand: Omit<Brand, 'id'>) => {
    const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()
      .single()
      
    if (error) {
      console.error('Error adding brand:', error)
      return null
    }
    
    if (data) {
      setBrands(prev => [...prev, data as Brand].sort((a, b) => a.name.localeCompare(b.name)))
    }
    return data
  }


  return {
    loading,
    items,
    brands,
    stores,
    records,
    refetch: fetchData,
    addRecord,
    addBrand
  }
}
