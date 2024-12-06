import { ItemFilters } from './components/item-filters'
import { ItemGrid } from './components/item-grid'
import { ItemSort } from './components/item-sort'

export default function ItemsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Discover Local Items</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <ItemFilters />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">Showing all items</p>
            <ItemSort />
          </div>
          <ItemGrid />
        </div>
      </div>
    </div>
  )
}
