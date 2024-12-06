'use client'

import { ItemCondition } from '@prisma/client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'

import { useItemFilters } from './use-item-filters'

export function ItemFilters() {
  const { conditions, priceRange, setConditions, setPriceRange } =
    useItemFilters()

  const handleConditionChange = (
    checked: boolean,
    condition: ItemCondition
  ) => {
    if (checked) {
      setConditions([...conditions, condition])
    } else {
      setConditions(conditions.filter((c) => c !== condition))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conditions */}
        <div className="space-y-4">
          <h3 className="font-semibold">Condition</h3>
          <div className="space-y-2">
            {Object.values(ItemCondition).map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={condition}
                  checked={conditions.includes(condition)}
                  onCheckedChange={(checked) =>
                    handleConditionChange(checked as boolean, condition)
                  }
                />
                <label htmlFor={condition} className="text-sm">
                  {condition.replace('_', ' ')}
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
