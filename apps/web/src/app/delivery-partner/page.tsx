'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createDeliveryApplicationSchema } from '@/types/delivery'
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
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

type DeliveryApplicationForm = z.infer<typeof createDeliveryApplicationSchema>

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]
const VEHICLE_TYPES = ['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN']

const SuccessState = ({
  fullName,
  applicationNumber
}: {
  fullName: string
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
          Thank you {fullName}, for applying to become a delivery partner
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg bg-muted p-6">
          <p className="text-muted-foreground">
            Your application has been received and is now under review.
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
              If approved, you'll receive onboarding information and next steps
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/delivery-partner/status/${applicationNumber}`}>
            Check Application Status
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function BecomeDeliveryPartnerPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [applicationNumber, setApplicationNumber] = useState('')

  const form = useForm<DeliveryApplicationForm>({
    resolver: zodResolver(createDeliveryApplicationSchema),
    defaultValues: {
      full_name: '',
      date_of_birth: new Date(),
      phone_number: '',
      email: '',
      address: '',
      vehicle_type: 'MOTORCYCLE',
      has_delivery_experience: false,
      preferred_work_areas: [],
      available_hours: {}
    }
  })

  const createApplication = api.deliveryPartnerApplications.create.useMutation({
    onSuccess: (data) => {
      setSubmittedName(data.full_name)
      setApplicationNumber(data.application_number)
      setIsSubmitted(true)
      toast.success('Application submitted successfully!')
    },
    onError: (error) => {
      toast.error('Error submitting application: ' + error.message)
    }
  })

  const onSubmit = async (values: DeliveryApplicationForm) => {
    createApplication.mutate(values)
  }

  if (isSubmitted) {
    return (
      <div className="container max-w-3xl py-10">
        <SuccessState
          applicationNumber={applicationNumber}
          fullName={submittedName}
        />
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Become a Delivery Partner</CardTitle>
          <CardDescription>
            Join our delivery network. Fill out this form to apply as a delivery
            partner. We'll review your application and get back to you within
            2-3 business days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value
                                ? new Date(field.value)
                                    .toISOString()
                                    .split('T')[0]
                                : ''
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vehicle Information</h3>

                <FormField
                  control={form.control}
                  name="vehicle_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VEHICLE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0) + type.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="vehicle_make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Make</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Toyota, Honda" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Corolla, Civic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="vehicle_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 2020"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle_plate_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter plate number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* License Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">License Information</h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="drivers_license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver's License Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter license number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="drivers_license_expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiry Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value
                                ? new Date(field.value)
                                    .toISOString()
                                    .split('T')[0]
                                : ''
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Experience</h3>

                {/* Experience Section Continued */}
                <FormField
                  control={form.control}
                  name="has_delivery_experience"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Previous Delivery Experience
                        </FormLabel>
                        <FormDescription>
                          Do you have experience in delivery services?
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

                {form.watch('has_delivery_experience') && (
                  <>
                    <FormField
                      control={form.control}
                      name="years_of_experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter years of experience"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="previous_companies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Companies</FormLabel>
                          <FormDescription>
                            Enter the names of companies you've delivered for
                            (optional)
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="One company per line"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    .split('\n')
                                    .map((item) => item.trim())
                                    .filter(Boolean)
                                )
                              }
                              value={field.value?.join('\n') || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Availability & Work Areas
                </h3>

                <FormField
                  control={form.control}
                  name="preferred_work_areas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Work Areas</FormLabel>
                      <FormDescription>
                        Enter the areas where you'd prefer to work (one per
                        line)
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Downtown, North Side, etc."
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split('\n')
                                .map((item) => item.trim())
                                .filter(Boolean)
                            )
                          }
                          value={field.value?.join('\n') || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel className="text-base">Available Hours</FormLabel>
                  <FormDescription>
                    Select the days you're available to work
                  </FormDescription>

                  {DAYS_OF_WEEK.map((day) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name={`available_hours.${day.toLowerCase()}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{day}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Required Documents</h3>
                <FormDescription>
                  You'll need to provide the following documents after your
                  initial application is reviewed:
                </FormDescription>
                <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                  <li>Valid government-issued ID</li>
                  <li>Driver's license (for motorized vehicles)</li>
                  <li>Vehicle registration (for motorized vehicles)</li>
                  <li>Vehicle insurance (for motorized vehicles)</li>
                  <li>Proof of address</li>
                </ul>
              </div>

              <Alert>
                <AlertDescription>
                  By submitting this application, you confirm that all
                  information provided is accurate and you agree to our terms
                  and conditions for delivery partners.
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
