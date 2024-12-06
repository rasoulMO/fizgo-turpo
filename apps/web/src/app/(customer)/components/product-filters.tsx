'use client'

import { ProductCategory, ProductGender } from '@prisma/client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'

import { useProductFilters } from './use-product-filters'

export function ProductFilters() {
  const {
    categories,
    gender,
    priceRange,
    setCategories,
    setGender,
    setPriceRange
  } = useProductFilters()

  const handleCategoryChange = (
    checked: boolean,
    category: ProductCategory
  ) => {
    if (checked) {
      setCategories([...categories, category])
    } else {
      setCategories(categories.filter((c) => c !== category))
    }
  }

  const handleGenderChange = (
    checked: boolean,
    selectedGender: ProductGender
  ) => {
    if (checked) {
      setGender(selectedGender)
    } else {
      setGender(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div className="space-y-4">
          <h3 className="font-semibold">Categories</h3>
          <div className="space-y-2">
            {Object.values(ProductCategory).map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={categories.includes(category)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(checked as boolean, category)
                  }
                />
                <label htmlFor={category} className="text-sm">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-4">
          <h3 className="font-semibold">Gender</h3>
          <div className="space-y-2">
            {Object.values(ProductGender).map((genderOption) => (
              <div key={genderOption} className="flex items-center space-x-2">
                <Checkbox
                  id={genderOption}
                  checked={gender === genderOption}
                  onCheckedChange={(checked) =>
                    handleGenderChange(checked as boolean, genderOption)
                  }
                />
                <label htmlFor={genderOption} className="text-sm">
                  {genderOption}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <h3 className="font-semibold">Price Range</h3>
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={1000}
            step={10}
            className="mt-2"
          />
          <div className="flex justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
