// src/app/delivery/[appNumber]/delivery-resubmit-form.tsx
'use client'

import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]
const VEHICLE_TYPES = ['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN']

const deliveryResubmitSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  date_of_birth: z.date({
    required_error: 'Date of birth is required',
    invalid_type_error: 'Invalid date format'
  }),
  phone_number: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Please enter a valid email'),
  address: z.string().min(5, 'Address is required'),

  vehicle_type: z.enum(['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN']),
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_year: z.number().int().min(1900).optional(),
  vehicle_plate_number: z.string().optional(),

  drivers_license_number: z.string().optional(),
  drivers_license_expiry: z.date().optional(),

  has_delivery_experience: z.boolean(),
  years_of_experience: z.number().int().min(0).optional(),
  previous_companies: z.array(z.string()).optional(),

  preferred_work_areas: z
    .array(z.string())
    .min(1, 'At least one area required'),
  available_hours: z.record(z.boolean()).optional()
})

interface DeliveryResubmitFormProps {
  application: any // Replace with proper type from your Prisma client
}

export function DeliveryResubmitForm({
  application
}: DeliveryResubmitFormProps) {
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(deliveryResubmitSchema),
    defaultValues: {
      full_name: application.full_name,
      date_of_birth: new Date(application.date_of_birth),
      phone_number: application.phone_number,
      email: application.email,
      address: application.address,
      vehicle_type: application.vehicle_type,
      vehicle_make: application.vehicle_make || '',
      vehicle_model: application.vehicle_model || '',
      vehicle_year: application.vehicle_year || undefined,
      vehicle_plate_number: application.vehicle_plate_number || '',
      drivers_license_number: application.drivers_license_number || '',
      drivers_license_expiry: application.drivers_license_expiry
        ? new Date(application.drivers_license_expiry)
        : undefined,
      has_delivery_experience: application.has_delivery_experience,
      years_of_experience: application.years_of_experience || 0,
      previous_companies: application.previous_companies || [],
      preferred_work_areas: application.preferred_work_areas || [],
      available_hours:
        application.available_hours ||
        DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: false }), {})
    }
  })

  const updateApplication = api.deliveryPartnerApplications.update.useMutation({
    onSuccess: () => {
      toast.success('Application updated successfully')
    },
    onError: (error) => {
      toast.error('Error updating application: ' + error.message)
    }
  })

  const submitApplication = api.deliveryPartnerApplications.submit.useMutation({
    onSuccess: () => {
      toast.success('Application resubmitted successfully')
      router.refresh()
    },
    onError: (error) => {
      toast.error('Error submitting application: ' + error.message)
    }
  })

  const onSubmit = async (values: z.infer<typeof deliveryResubmitSchema>) => {
    try {
      // First update the application data
      await updateApplication.mutateAsync({
        id: application.id,
        data: values
      })

      // Then submit the application
      await submitApplication.mutateAsync(application.id)
    } catch (error) {
      console.error('Error in submission:', error)
    }
  }

  if (application.status !== 'REJECTED') {
    return null
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Update and Resubmit Application</CardTitle>
        <CardDescription>
          Please review and update your application details before resubmitting.
        </CardDescription>
        {application.rejection_reason && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              <p className="font-semibold">Rejection Reason:</p>
              <p>{application.rejection_reason}</p>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>

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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Experience & Availability
              </h3>

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

              <FormField
                control={form.control}
                name="preferred_work_areas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Work Areas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter areas (one per line)"
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
                <FormLabel className="text-base">Available Days</FormLabel>
                {DAYS_OF_WEEK.map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name={`available_hours.${day}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Please review all information before resubmitting your
                application. Make sure to address any issues mentioned in the
                rejection reason.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={
                  updateApplication.isPending || submitApplication.isPending
                }
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={
                  updateApplication.isPending || submitApplication.isPending
                }
              >
                {updateApplication.isPending || submitApplication.isPending
                  ? 'Resubmitting...'
                  : 'Resubmit Application'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
