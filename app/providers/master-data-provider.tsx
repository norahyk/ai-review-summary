'use client'

import React, { createContext, useContext } from 'react'
import { useMasterData } from '@/app/hooks/use-master-data'

type MasterDataReturnType = ReturnType<typeof useMasterData>

const MasterDataContext = createContext<MasterDataReturnType | null>(null)

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
  const masterData = useMasterData()

  return (
    <MasterDataContext.Provider value={masterData}>
      {children}
    </MasterDataContext.Provider>
  )
}

export function useMasterDataContext() {
  const context = useContext(MasterDataContext)
  if (!context) {
    throw new Error('useMasterDataContext must be used within a MasterDataProvider')
  }
  return context
}
