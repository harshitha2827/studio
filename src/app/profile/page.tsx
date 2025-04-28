
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Define the schema for profile data
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'), // Assuming email is fetched and read-only for now
  dob: z.date().optional(), // Date of Birth is optional
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Mock function to get user data (replace with actual data fetching)
const fetchUserData = (): ProfileFormValues => {
  // In a real app, fetch from your backend/auth provider
  // For now, use local storage or return mock data
   if (typeof window !== 'undefined') {
     const storedData = localStorage.getItem('userProfile');
     if (storedData) {
       const parsed = JSON.parse(storedData);
       // Make sure to parse the date string back into a Date object
       return { ...parsed, dob: parsed.dob ? new Date(parsed.dob) : undefined };
     }
   }
  // Default mock data if nothing is stored
  return {
    name: 'Alex Doe',
    username: 'alex_doe',
    email: 'alex.doe@example.com', // Typically read-only
    dob: undefined, // Default to undefined or a sample date new Date(1995, 5, 15)
  };
};

// Mock function to save user data (replace with actual API call)
const saveUserData = (data: ProfileFormValues) => {
   if (typeof window !== 'undefined') {
    // Convert date to string for storage if it exists
    const dataToStore = {
      ...data,
      dob: data.dob ? data.dob.toISOString() : null,
    };
    localStorage.setItem('userProfile', JSON.stringify(dataToStore));
   }
  console.log('Saving user data:', data);
  // Simulate API call delay
  return new Promise((resolve) => setTimeout(resolve, 500));
};


export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: fetchUserData(), // Load initial data
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await saveUserData(data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
      // Optionally update defaultValues if needed after save
       form.reset(data); // Reset form with the saved data to clear dirty state
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/50 p-4">
       <Card className="w-full max-w-2xl shadow-lg relative">
        {/* Back Button */}
         <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/')} // Navigate back to home/bookshelf
            aria-label="Back to Bookshelf"
          >
           <ArrowLeft className="h-5 w-5" />
         </Button>

        <CardHeader className="text-center pt-12"> {/* Added padding-top */}
          <CardTitle className="text-2xl">Profile Details</CardTitle>
          <CardDescription>
            View and update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alex Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., alex_doe" {...field} />
                    </FormControl>
                     <FormDescription>
                       This is your public display name.
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field (Read-Only Example) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} readOnly className="bg-muted cursor-not-allowed"/>
                    </FormControl>
                     <FormDescription>
                       Email address cannot be changed here.
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth Field */}
               <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                     <FormDescription>
                       Your date of birth is used to personalize your experience.
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />


              {/* Submit Button */}
              <CardFooter className="flex justify-end gap-2 px-0 pt-6">
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset(fetchUserData())} // Reset to original/fetched data
                    disabled={!form.formState.isDirty || form.formState.isSubmitting}
                  >
                    Cancel
                  </Button>
                <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>

      </Card>
    </div>
  );
}
