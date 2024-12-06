'use client'

import React, { useState } from 'react'
import { api, RouterOutputs } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Globe, Link, Loader2, ShieldCheck, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import useSupabaseBrowser from '@/utils/supabase/client'
import { uploadAvatar } from '@/utils/supabase/upload'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

const basicInfoSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  phone_number: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .optional()
    .nullable(),
  avatar_url: z
    .union([z.string().url(), z.string().max(0), z.literal('')])
    .optional()
    .nullable()
})

const profileSettingsSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  display_email: z.boolean().default(false),
  display_phone: z.boolean().default(false),
  is_public: z.boolean().default(true),
  social_links: z
    .object({
      twitter: z.string().url().optional().or(z.literal('')),
      instagram: z.string().url().optional().or(z.literal('')),
      linkedin: z.string().url().optional().or(z.literal(''))
    })
    .optional()
})

type BasicInfoValues = z.infer<typeof basicInfoSchema>
type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>
type ProfileData = RouterOutputs['user']['getOwnProfile']

interface ProfilePageProps {
  initialProfile: ProfileData
}

const ProfilePage = ({ initialProfile }: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState('basic')
  const [isUploading, setIsUploading] = useState(false)
  const supabase = useSupabaseBrowser()
  const { toast } = useToast()

  const updateUser = api.user.updateUser.useMutation({
    onSuccess: () => {
      utils.user.getOwnProfile.invalidate()
      toast({ description: 'Profile updated successfully' })
    },
    onError: (error) => {
      toast({
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      })
    }
  })

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getOwnProfile.invalidate()
      toast({ description: 'Profile settings updated successfully' })
    },
    onError: (error) => {
      toast({
        description: error.message || 'Failed to update profile settings',
        variant: 'destructive'
      })
    }
  })

  const updateAvatar = api.user.updateAvatar.useMutation({
    onSuccess: () => {
      toast({ description: 'Avatar updated successfully' })
    },
    onError: (error) => {
      toast({
        description: error.message || 'Failed to update avatar',
        variant: 'destructive'
      })
    }
  })

  const utils = api.useUtils()

  const { data: profileData, isLoading: isLoadingProfile } =
    api.user.getOwnProfile.useQuery(undefined, {
      initialData: initialProfile,
      refetchOnMount: false,
      refetchOnWindowFocus: false
    })

  const basicInfoForm = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      full_name: profileData?.full_name || '',
      avatar_url: profileData?.avatar_url || '',
      phone_number: profileData?.phone_number || ''
    },
    mode: 'onSubmit'
  })

  const profileSettingsForm = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      username: profileData?.profile?.username || '',
      bio: profileData?.profile?.bio || '',
      website: profileData?.profile?.website || '',
      location: profileData?.profile?.location || '',
      display_email: profileData?.profile?.display_email ?? false,
      display_phone: profileData?.profile?.display_phone ?? false,
      is_public: profileData?.profile?.is_public ?? true,
      social_links: (profileData?.profile?.social_links as any) ?? {
        twitter: '',
        instagram: '',
        linkedin: ''
      }
    }
  })

  const onBasicInfoSubmit = async (data: BasicInfoValues) => {
    await updateUser.mutateAsync({
      full_name: data.full_name,
      phone_number: data.phone_number || null,
      avatar_url: data.avatar_url || null
    })
  }

  const onProfileSettingsSubmit = async (data: ProfileSettingsValues) => {
    await updateProfile.mutateAsync(data)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Get the old avatar URL
      const oldAvatarUrl = profileData?.avatar_url

      // If there's an old avatar, delete it from storage
      if (oldAvatarUrl) {
        const match = oldAvatarUrl.match(/public\/avatars\/(.+)/)
        const filePath = match?.[1]
        if (filePath) {
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([filePath])

          if (deleteError) {
            console.error('Error deleting old avatar:', deleteError)
            throw new Error('Failed to delete old avatar')
          }
        }
      }

      // Upload new avatar
      const newAvatarUrl = await uploadAvatar(supabase, file)
      await updateAvatar.mutateAsync({ avatarUrl: newAvatarUrl })
      basicInfoForm.setValue('avatar_url', newAvatarUrl)
    } catch (error) {
      toast({
        description:
          error instanceof Error ? error.message : 'Failed to update avatar',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl">
      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Profile Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your account settings and set profile preferences.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 grid w-full grid-cols-2">
          <TabsTrigger value="basic">
            <User className="mr-2 h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="public">
            <Globe className="mr-2 h-4 w-4" />
            Public Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your basic profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...basicInfoForm}>
                <form
                  onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={basicInfoForm.watch('avatar_url') ?? ''}
                        />
                        <AvatarFallback>
                          {profileData?.full_name?.charAt(0)?.toUpperCase() ||
                            'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <p className="text-sm text-muted-foreground">
                            Uploading...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={basicInfoForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={basicInfoForm.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormDescription>
                          Format: +1234567890 (minimum 10 digits)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={
                      isUploading ||
                      basicInfoForm.formState.isSubmitting ||
                      updateUser.isPending
                    }
                  >
                    {(basicInfoForm.formState.isSubmitting ||
                      updateUser.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {basicInfoForm.formState.isSubmitting ||
                    updateUser.isPending
                      ? 'Saving...'
                      : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public">
          <Card>
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>
                Manage how others see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileSettingsForm}>
                <form
                  onSubmit={profileSettingsForm.handleSubmit(
                    onProfileSettingsSubmit
                  )}
                  className="space-y-8"
                >
                  <FormField
                    control={profileSettingsForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Your unique username for your public profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileSettingsForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          Tell others about yourself.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileSettingsForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileSettingsForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Links</h3>
                    <div className="space-y-4">
                      <FormField
                        control={profileSettingsForm.control}
                        name="social_links.twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileSettingsForm.control}
                        name="social_links.instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileSettingsForm.control}
                        name="social_links.linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Privacy Settings</h3>
                    <FormField
                      control={profileSettingsForm.control}
                      name="display_email"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Display Email
                            </FormLabel>
                            <FormDescription>
                              Show your email address on your public profile
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileSettingsForm.control}
                      name="display_phone"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Display Phone
                            </FormLabel>
                            <FormDescription>
                              Show your phone number on your public profile
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileSettingsForm.control}
                      name="is_public"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Public Profile
                            </FormLabel>
                            <FormDescription>
                              Make your profile visible to everyone
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription>
                      Your profile changes will be visible to others based on
                      your privacy settings.
                    </AlertDescription>
                  </Alert>

                  <Button
                    type="submit"
                    disabled={profileSettingsForm.formState.isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {profileSettingsForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Profile Settings'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>
                This is how your profile appears to{' '}
                {profileSettingsForm.watch('is_public')
                  ? 'everyone'
                  : 'only you'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profileData?.avatar_url ?? ''} />
                  <AvatarFallback>
                    {profileData?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {basicInfoForm.watch('full_name')}
                  </h3>
                  {profileSettingsForm.watch('username') && (
                    <p className="text-sm text-muted-foreground">
                      @{profileSettingsForm.watch('username')}
                    </p>
                  )}
                  {profileSettingsForm.watch('bio') && (
                    <p className="mt-2 text-sm">
                      {profileSettingsForm.watch('bio')}
                    </p>
                  )}
                  <div className="mt-4 flex items-center space-x-4">
                    {profileSettingsForm.watch('location') && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {profileSettingsForm.watch('location')}
                      </div>
                    )}
                    {profileSettingsForm.watch('website') && (
                      <div className="flex items-center text-sm">
                        <Link className="mr-1 h-4 w-4" />
                        <a
                          href={profileSettingsForm.watch('website')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links Preview */}
              {Object.entries(
                profileSettingsForm.watch('social_links') || {}
              ).some(([_, value]) => value) && (
                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-medium">Connect with me</h4>
                  <div className="flex space-x-4">
                    {profileSettingsForm.watch('social_links.twitter') && (
                      <a
                        href={profileSettingsForm.watch('social_links.twitter')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Twitter
                      </a>
                    )}
                    {profileSettingsForm.watch('social_links.instagram') && (
                      <a
                        href={profileSettingsForm.watch(
                          'social_links.instagram'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Instagram
                      </a>
                    )}
                    {profileSettingsForm.watch('social_links.linkedin') && (
                      <a
                        href={profileSettingsForm.watch(
                          'social_links.linkedin'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information Preview */}
              <div className="mt-6 space-y-2">
                {profileSettingsForm.watch('display_email') &&
                  profileData?.email && (
                    <div className="flex items-center text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {profileData.email}
                    </div>
                  )}
                {profileSettingsForm.watch('display_phone') &&
                  basicInfoForm.watch('phone_number') && (
                    <div className="flex items-center text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {basicInfoForm.watch('phone_number')}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProfilePage
