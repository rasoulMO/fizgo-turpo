'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  onFilesSelected: (files: File[]) => void
  maxImages?: number
}

export function ImageUpload({
  value,
  onChange,
  onFilesSelected,
  maxImages = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setUploading(true)

        // Update pending files
        const newFiles = [...pendingFiles, ...acceptedFiles].slice(0, maxImages)
        setPendingFiles(newFiles)

        // Create object URLs for preview for new files
        const previewUrls = newFiles.map((file) => URL.createObjectURL(file))

        // Combine existing URLs (that start with http) with new preview URLs
        const existingUrls = value.filter((url) => url.startsWith('http'))
        onChange([...existingUrls, ...previewUrls])

        // Notify parent component about all pending files
        onFilesSelected(newFiles)

        toast({
          title: 'Success',
          description: 'Images added successfully'
        })
      } catch (error) {
        console.error('Failed to handle files:', error)
        toast({
          title: 'Error',
          description: 'Failed to process images. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setUploading(false)
      }
    },
    [pendingFiles, maxImages, onChange, onFilesSelected, toast, value]
  )

  const removeImage = (index: number) => {
    try {
      const imageUrl = value[index]
      const isExistingUrl = imageUrl?.startsWith('http') ?? false

      if (!isExistingUrl) {
        // Clean up object URL for preview images
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl)
        }

        // Update pending files
        const newFiles = pendingFiles.filter((_, i) => {
          const previewIndex = value.findIndex((url) => !url.startsWith('http'))
          return i !== index - previewIndex
        })
        setPendingFiles(newFiles)

        // Notify parent component about remaining files
        onFilesSelected(newFiles)
      }

      // Update all URLs
      const remainingUrls = value.filter((_, i) => i !== index)
      onChange(remainingUrls)

      toast({
        title: 'Success',
        description: 'Image removed successfully'
      })
    } catch (error) {
      console.error('Remove failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove image. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: maxImages - value.length,
    disabled: uploading || value.length >= maxImages,
    maxSize: 5 * 1024 * 1024 // 5MB max file size
  })

  const images = Array.isArray(value) ? value : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((url, index) => (
          <div key={`${url}-${index}`} className="relative aspect-square">
            <Image
              src={url}
              alt={`Image ${index + 1}`}
              fill
              className="rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {value.length < maxImages && (
          <div
            {...getRootProps()}
            className={`relative aspect-square rounded-lg border-2 border-dashed transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-muted-foreground hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex h-full flex-col items-center justify-center gap-2">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Processing...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-center text-sm text-muted-foreground">
                    Drop images here or click to upload
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Upload up to {maxImages} images (max 5MB each). Supported formats: PNG,
        JPG, JPEG, WEBP.
      </p>
    </div>
  )
}
