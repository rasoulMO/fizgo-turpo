import { ProductCategory, ProductGender } from '@prisma/client'
import { create } from 'zustand'

interface ProductFiltersState {
  categories: ProductCategory[]
  gender: ProductGender | null
  priceRange: [number, number]
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular'
  setCategories: (categories: ProductCategory[]) => void
  setGender: (gender: ProductGender | null) => void
  setPriceRange: (range: [number, number]) => void
  setSortBy: (sort: 'newest' | 'price-asc' | 'price-desc' | 'popular') => void
  reset: () => void
}

export const useProductFilters = create<ProductFiltersState>((set) => ({
  categories: [],
  gender: null,
  priceRange: [0, 1000],
  sortBy: 'newest',
  setCategories: (categories) => set({ categories }),
  setGender: (gender) => set({ gender }),
  setPriceRange: (range) => set({ priceRange: range }),
  setSortBy: (sortBy) => set({ sortBy }),
  reset: () =>
    set({
      categories: [],
      gender: null,
      priceRange: [0, 1000],
      sortBy: 'newest'
    })
}))
