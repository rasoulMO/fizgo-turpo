'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { useItemFilters } from './use-item-filters'

export function ItemSort() {
  const { sortBy, setSortBy } = useItemFilters()

  return (
    <Select
      value={sortBy}
      onValueChange={(value: typeof sortBy) => setSortBy(value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  )
}
