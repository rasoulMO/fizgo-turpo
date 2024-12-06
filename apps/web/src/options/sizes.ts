// config/products.ts

export const SIZES_BY_CATEGORY = {
  CLOTHING: {
    tops: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    bottoms: ['28', '29', '30', '31', '32', '33', '34', '36', '38', '40'],
    dresses: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  SHOES: {
    all: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
  },
  ACCESSORIES: {
    all: ['ONE SIZE']
  }
} as const

export function getAvailableSizes(
  category: string,
  subcategory: string
): string[] {
  if (category === 'SHOES') {
    return SIZES_BY_CATEGORY.SHOES.all.slice()
  }

  if (category === 'ACCESSORIES') {
    return SIZES_BY_CATEGORY.ACCESSORIES.all.slice()
  }

  if (category === 'CLOTHING') {
    if (subcategory === 'pants' || subcategory === 'jeans') {
      return SIZES_BY_CATEGORY.CLOTHING.bottoms.slice()
    }
    if (subcategory === 'dresses') {
      return SIZES_BY_CATEGORY.CLOTHING.dresses.slice()
    }
    return SIZES_BY_CATEGORY.CLOTHING.tops.slice()
  }

  return []
}

export const COLORS = [
  'Black',
  'White',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Purple',
  'Pink',
  'Brown',
  'Gray',
  'Navy',
  'Beige',
  'Orange',
  'Multicolor'
] as const

export const MATERIALS = [
  'Cotton',
  'Polyester',
  'Wool',
  'Leather',
  'Denim',
  'Silk',
  'Linen',
  'Nylon',
  'Canvas',
  'Suede',
  'Velvet',
  'Jersey',
  'Spandex',
  'Cashmere'
] as const

export type Color = (typeof COLORS)[number]
export type Material = (typeof MATERIALS)[number]
