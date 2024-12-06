'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Plus } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { cn } from '@/utils/cn'
import { createApplicationSchema } from '@/types/partner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Textarea } from '@/components/ui/textarea'

type PartnerApplicationForm = z.infer<typeof createApplicationSchema>

const SuccessState = ({
  businessName,
  applicationNumber
}: {
  businessName: string
  applicationNumber: string
}) => {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl">
          Application Submitted Successfully!
        </CardTitle>
        <CardDescription className="text-lg">
          Thank you for applying to become a partner
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg bg-muted p-6">
          <p className="text-muted-foreground">
            Your application for{' '}
            <span className="font-semibold">{businessName}</span> has been
            received and is now under review.
          </p>
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Your Application Number
            </p>
            <p className="font-mono text-2xl font-bold">{applicationNumber}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please save this ID for your records. You'll need it to check your
              application status.
            </p>
          </div>
        </div>
        <div className="space-y-2 text-left">
          <h3 className="font-semibold">What happens next?</h3>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              Our team will review your application within 2-3 business days
            </li>
            <li>
              You've been sent a confirmation email with your application
              details
            </li>
            <li>
              You can check your application status anytime using your
              application ID
            </li>
            <li>
              If approved, you'll get access to our partner dashboard and
              onboarding materials
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/partner/status/${applicationNumber}`}>
            Check Application Status
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => window.location.reload()}
        >
          Submit Another Application
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function BecomePartnerPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedBusinessName, setSubmittedBusinessName] = useState('')
  const [applicationNumber, setapplicationNumber] = useState('')

  const form = useForm<PartnerApplicationForm>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      business_name: '',
      business_description: '',
      business_address: '',
      business_phone: '',
      business_email: '',
      business_type: '',
      contact_person_name: '',
      contact_person_position: '',
      social_media_links: [{ platform: '', url: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    name: 'social_media_links',
    control: form.control
  })

  const createApplication = api.partnerApplications.create.useMutation({
    onSuccess: (data) => {
      setSubmittedBusinessName(data.business_name)
      setapplicationNumber(data.application_number)
      setIsSubmitted(true)
      toast.success('Application submitted successfully!')
    },
    onError: (error) => {
      toast.error('Error submitting application: ' + error.message)
    }
  })

  const onSubmit = async (values: PartnerApplicationForm) => {
    // Convert social media links array to record format expected by the API
    const socialMediaRecord = values.social_media_links?.reduce(
      (acc, curr) => {
        acc[curr.platform] = curr.url
        return acc
      },
      {} as Record<string, string>
    )

    createApplication.mutate({
      ...values,
      social_media_links: socialMediaRecord
    })
  }

  if (isSubmitted) {
    return (
      <div className="container max-w-3xl py-10">
        <SuccessState
          applicationNumber={applicationNumber}
          businessName={submittedBusinessName}
        />
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Become a Partner</CardTitle>
          <CardDescription>
            Fill out this form to apply as a partner. We'll review your
            application and get back to you within 2-3 business days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your business name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="business_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your business"
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="business_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter business phone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="business_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter business email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="business_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter business address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="business_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Retail, Boutique"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="business_registration_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter registration number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact_person_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_person_position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position in Company</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Owner, Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Social Media Links Section */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base">
                    Social Media Profiles
                  </FormLabel>
                  <FormDescription>
                    Add links to your business social media profiles.
                  </FormDescription>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4">
                    <FormField
                      control={form.control}
                      name={`social_media_links.${index}.platform`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={cn(index !== 0 && 'sr-only')}>
                            Platform
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Twitter, LinkedIn"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`social_media_links.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="flex-[2]">
                          <FormLabel className={cn(index !== 0 && 'sr-only')}>
                            URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://"
                              type="url"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-8"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ platform: '', url: '' })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Social Media Profile
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  By submitting this application, you agree to our terms and
                  conditions for partners.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                disabled={createApplication.isPending}
              >
                {createApplication.isPending
                  ? 'Submitting...'
                  : 'Submit Application'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
