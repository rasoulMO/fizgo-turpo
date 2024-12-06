import { ProductFilters } from './components/product-filters'
import { ProductGrid } from './components/product-grid'
import { ProductSort } from './components/product-sort'

export default function CustomerHomePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Discover Local Fashion</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">Showing all products</p>
            <ProductSort />
          </div>
          <ProductGrid />
        </div>
      </div>
    </div>
  )
}
