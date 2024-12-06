'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  COLORS,
  getAvailableSizes,
  MATERIALS,
  MEN_CATEGORIES_LIST,
  WOMEN_CATEGORIES_LIST
} from '@/options'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProductCategory, ProductGender } from '@prisma/client'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/image-upload'

import { useProductImages } from './hooks/use-product-images'
import { productFormSchema } from './product.schema'

// Update the schema to include specifications
type ProductFormValues = z.infer<typeof productFormSchema>

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { pendingFiles, setPendingFiles, uploadImages } =
    useProductImages('products')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: shop } = api.shop.getMine.useQuery()
  const utils = api.useUtils()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      gender: 'UNISEX',
      stock_quantity: '0',
      low_stock_threshold: '5',
      images: [],
      specifications: {
        available_sizes: [],
        colors: [],
        materials: [],
        length: null,
        width: null,
        height: null
      }
    }
  })

  const selectedGender = form.watch('gender')
  const selectedCategory = form.watch('category')
  const selectedSubcategory = form.watch('subcategory')

  const categoriesList =
    selectedGender === 'WOMEN' ? WOMEN_CATEGORIES_LIST : MEN_CATEGORIES_LIST

  const subcategories = selectedCategory
    ? categoriesList[selectedCategory as keyof typeof categoriesList]
        ?.subcategories
    : []

  // Get available sizes based on category and subcategory
  const availableSizes = getAvailableSizes(
    selectedCategory,
    selectedSubcategory
  )

  const createProduct = api.product.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product created successfully.'
      })
      utils.shop.getMine.invalidate()
      router.push('/dashboard/shop/products')
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create product'
      })
    }
  })

  const createSpecifications = api.productSpecifications.create.useMutation({
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create product specifications'
      })
    }
  })

  async function onSubmit(data: ProductFormValues) {
    try {
      setIsSubmitting(true)

      if (!shop) {
        throw new Error('Shop not found')
      }

      // Upload images if any
      let imageUrls: string[] = []
      if (pendingFiles.length > 0) {
        imageUrls = await uploadImages(shop.id, pendingFiles)
      }

      // Create product using TRPC
      const product = await createProduct.mutateAsync({
        shop_id: shop.id,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        sale_price: data.sale_price ? Number(data.sale_price) : undefined,
        stock_quantity: Number(data.stock_quantity),
        low_stock_threshold: data.low_stock_threshold
          ? Number(data.low_stock_threshold)
          : 5,
        sku: data.sku,
        gender: data.gender as ProductGender,
        category: data.category as ProductCategory,
        subcategory: data.subcategory,
        is_available: true,
        images: imageUrls
      })

      // Prepare specifications
      const specifications = {
        product_id: product.id,
        available_sizes: data.specifications.available_sizes,
        colors: data.specifications.colors,
        materials: data.specifications.materials,
        length: data.specifications.length,
        width: data.specifications.width,
        height: data.specifications.height
      }

      // Create product specifications using TRPC
      await createSpecifications.mutateAsync(specifications)

      toast({
        title: 'Success',
        description: 'Product created successfully.'
      })

      utils.product.getByOwnerId.invalidate()
      router.push('/dashboard/shop/products')
    } catch (error) {
      console.error('Error creating product:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create product'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">
          Create a new product in your catalog
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    onFilesSelected={(files) => {
                      setPendingFiles(files)
                      const previewUrls = files.map((file) =>
                        URL.createObjectURL(file)
                      )
                      field.onChange(previewUrls)
                    }}
                    maxImages={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rest of the form fields remain the same as before */}
          {/* ... Basic Info ... */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ... Description ... */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ... Pricing ... */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Price (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ... Inventory ... */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="stock_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="low_stock_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ... Categories ... */}
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MEN">Men</SelectItem>
                      <SelectItem value="WOMEN">Women</SelectItem>
                      <SelectItem value="UNISEX">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoriesList).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedCategory}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories?.map((subcategory) => (
                        <SelectItem
                          key={subcategory.value}
                          value={subcategory.value}
                        >
                          {subcategory.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Specifications</h2>

            {/* Sizes */}
            <FormField
              control={form.control}
              name="specifications.available_sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Sizes</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <Button
                          key={size}
                          type="button"
                          variant={
                            field.value.includes(size) ? 'default' : 'outline'
                          }
                          onClick={() => {
                            const updatedSizes = field.value.includes(size)
                              ? field.value.filter((s) => s !== size)
                              : [...field.value, size]
                            field.onChange(updatedSizes)
                          }}
                          className="h-8"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Colors */}
            <FormField
              control={form.control}
              name="specifications.colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colors</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((color) => (
                        <Button
                          key={color}
                          type="button"
                          variant={
                            field.value.includes(color) ? 'default' : 'outline'
                          }
                          onClick={() => {
                            const updatedColors = field.value.includes(color)
                              ? field.value.filter((c) => c !== color)
                              : [...field.value, color]
                            field.onChange(updatedColors)
                          }}
                          className="h-8"
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Materials */}
            <FormField
              control={form.control}
              name="specifications.materials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materials</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {MATERIALS.map((material) => (
                        <Button
                          key={material}
                          type="button"
                          variant={
                            field.value.includes(material)
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() => {
                            const updatedMaterials = field.value.includes(
                              material
                            )
                              ? field.value.filter((m) => m !== material)
                              : [...field.value, material]
                            field.onChange(updatedMaterials)
                          }}
                          className="h-8"
                        >
                          {material}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Measurements */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="specifications.length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specifications.width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specifications.height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Product...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
