"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { PartnerApplicationResponse } from "@/types/partner";
import { Textarea } from "@/components/ui/textarea";

const socialMediaSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Please enter a valid URL"),
});

const partnerApplicationSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  business_description: z
    .string()
    .min(10, "Please provide a detailed business description"),
  business_address: z.string().min(5, "Business address is required"),
  business_phone: z.string().min(5, "Business phone is required"),
  business_email: z.string().email("Please enter a valid email"),
  business_registration_number: z.string().optional(),
  business_type: z.string().min(2, "Business type is required"),
  contact_person_name: z.string().min(2, "Contact person name is required"),
  contact_person_position: z
    .string()
    .min(2, "Contact person position is required"),
  social_media_links: z.array(socialMediaSchema).optional(),
});

interface PartnerResubmitFormProps {
  application: PartnerApplicationResponse;
}

export function PartnerResubmitForm({ application }: PartnerResubmitFormProps) {
  const router = useRouter();

  // Convert social media links record to array format for the form
  const initialSocialMediaLinks = application.social_media_links
    ? Object.entries(application.social_media_links).map(([platform, url]) => ({
        platform,
        url,
      }))
    : [{ platform: "", url: "" }];

  const form = useForm({
    resolver: zodResolver(partnerApplicationSchema),
    defaultValues: {
      business_name: application.business_name,
      business_description: application.business_description || "",
      business_address: application.business_address,
      business_phone: application.business_phone,
      business_email: application.business_email,
      business_registration_number:
        application.business_registration_number || "",
      business_type: application.business_type,
      contact_person_name: application.contact_person_name,
      contact_person_position: application.contact_person_position,
      social_media_links: initialSocialMediaLinks,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "social_media_links",
  });

  // Use tRPC mutations
  const updateApplication = api.partnerApplications.update.useMutation({
    onSuccess: () => {
      toast.success("Application updated successfully");
    },
    onError: (error) => {
      toast.error("Error updating application: " + error.message);
    },
  });

  const submitApplication = api.partnerApplications.submit.useMutation({
    onSuccess: () => {
      toast.success("Application resubmitted successfully");
      router.refresh();
    },
    onError: (error) => {
      toast.error("Error submitting application: " + error.message);
    },
  });

  const onSubmit = async (values: z.infer<typeof partnerApplicationSchema>) => {
    try {
      // Convert social media links array to record format
      const socialMediaRecord = values.social_media_links?.reduce(
        (acc, curr) => {
          acc[curr.platform] = curr.url;
          return acc;
        },
        {} as Record<string, string>,
      );

      // First update the application data
      await updateApplication.mutateAsync({
        id: application.id,
        data: {
          ...values,
          social_media_links: socialMediaRecord,
        },
      });

      // Then submit the application
      await submitApplication.mutateAsync(application.id);
    } catch (error) {
      console.error("Error in submission:", error);
    }
  };

  if (application.status !== "REJECTED") {
    return null;
  }

  return (
    <Card>
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
            {/* Business Information Fields */}
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
                        <Input placeholder="Enter business phone" {...field} />
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
                        <Input placeholder="Enter business email" {...field} />
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
                        <Input placeholder="e.g. Retail, Boutique" {...field} />
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
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4">
                  <FormField
                    control={form.control}
                    name={`social_media_links.${index}.platform`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
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
                        <FormControl>
                          <Input {...field} placeholder="https://" type="url" />
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
                onClick={() => append({ platform: "", url: "" })}
              >
                Add Social Media Profile
              </Button>
            </div>

            <Alert>
              <AlertDescription>
                Please review all information before resubmitting your
                application.
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
                  ? "Resubmitting..."
                  : "Resubmit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
