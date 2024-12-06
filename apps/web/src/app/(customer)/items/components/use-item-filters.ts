import { ItemCondition } from '@prisma/client'
import { create } from 'zustand'

interface ItemFiltersState {
  conditions: ItemCondition[]
  priceRange: [number, number]
  sortBy: 'newest' | 'price-asc' | 'price-desc'
  search: string
  setConditions: (conditions: ItemCondition[]) => void
  setPriceRange: (range: [number, number]) => void
  setSortBy: (sort: 'newest' | 'price-asc' | 'price-desc') => void
  setSearch: (search: string) => void
}

export const useItemFilters = create<ItemFiltersState>((set) => ({
  conditions: [],
  priceRange: [0, 1000],
  sortBy: 'newest',
  search: '',
  setConditions: (conditions) => set({ conditions }),
  setPriceRange: (range) => set({ priceRange: range }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearch: (search) => set({ search })
}))
