'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { COLORS, MATERIALS } from '@/options'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import useSupabaseBrowser from '@/utils/supabase/client'
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
import { useProductImages } from '@/app/dashboard/shop/products/components/hooks/use-product-images'

const itemFormSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  price: z.string().min(1, 'Price is required'),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  materials: z.array(z.string()).default([]),
  is_negotiable: z.boolean().default(true),
  images: z.array(z.string()).min(1, 'At least one image is required')
})

type ItemFormValues = z.infer<typeof itemFormSchema>

interface EditItemFormProps {
  itemId: string
  userId: string
}

export function EditItemForm({ itemId, userId }: EditItemFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { pendingFiles, setPendingFiles, uploadImages } =
    useProductImages('items')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = useSupabaseBrowser()

  const { data: item, isLoading } = api.userItems.getById.useQuery(itemId)

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      images: [],
      materials: [],
      is_negotiable: true
    }
  })

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description || undefined,
        condition: item.condition,
        price: String(item.price),
        brand: item.brand || undefined,
        size: item.size || undefined,
        color: item.color || undefined,
        length: item.length || undefined,
        width: item.width || undefined,
        height: item.height || undefined,
        materials: item.materials || [],
        is_negotiable: item.is_negotiable || true,
        images: Array.isArray(item.images) ? item.images : []
      })
    }
  }, [item, form])

  const updateItem = api.userItems.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Item updated successfully.' })
      router.push('/account/items')
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update item'
      })
    }
  })

  async function onSubmit(data: ItemFormValues) {
    try {
      setIsSubmitting(true)

      const currentImages = (item?.images as string[]) ?? []
      const removedImages = currentImages.filter(
        (img) => !data.images.includes(img)
      )

      // Delete removed images from storage if any
      if (removedImages.length > 0) {
        const filesToRemove = removedImages
          .map((imageUrl) => {
            // Extract just the filename part after the last /
            const match = imageUrl.match(/\/([^/]+)$/)
            return match ? `public/items/${userId}/${match[1]}` : null
          })
          .filter(Boolean)

        if (filesToRemove.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('products') // Changed from 'products' to 'items'
            .remove(
              filesToRemove.filter((file): file is string => file !== null)
            )

          if (deleteError) {
            console.error('Error deleting images:', deleteError)
            throw new Error('Failed to delete old images')
          }
        }
      }

      // Upload new images if any
      let finalImageUrls = [
        ...data.images.filter((url) => url.startsWith('http'))
      ]
      if (pendingFiles.length > 0) {
        const newImageUrls = await uploadImages(userId, pendingFiles)
        finalImageUrls = [...finalImageUrls, ...newImageUrls]
      }

      await updateItem.mutateAsync({
        id: itemId,
        data: {
          ...data,
          price: Number(data.price),
          images: finalImageUrls
        }
      })
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update item'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container max-w-2xl py-10">
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
                      field.onChange([...field.value, ...previewUrls])
                    }}
                    maxImages={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="LIKE_NEW">Like New</SelectItem>
                      <SelectItem value="GOOD">Good</SelectItem>
                      <SelectItem value="FAIR">Fair</SelectItem>
                      <SelectItem value="POOR">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
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
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Additional Details</h2>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
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
              name="materials"
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="length"
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="width"
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_negotiable"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Price is negotiable</FormLabel>
                </FormItem>
              )}
            />
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
              {isSubmitting ? 'Updating Item...' : 'Update Item'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
