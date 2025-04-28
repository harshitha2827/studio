
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
import { CalendarIcon, ArrowLeft, User, Camera, Image as ImageIcon } from 'lucide-react'; // Added Camera and ImageIcon
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar components

// Define the schema for profile data, including avatar URL (or data URI)
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'), // Assuming email is fetched and read-only for now
  dob: z.date().optional(), // Date of Birth is optional
  avatarUrl: z.string().optional().or(z.literal('')), // Optional Avatar URL or data URI
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Mock function to get user data (replace with actual data fetching)
const fetchUserData = (): ProfileFormValues => {
   if (typeof window !== 'undefined') {
     const storedData = localStorage.getItem('userProfile');
     if (storedData) {
       try {
           const parsed = JSON.parse(storedData);
           // Ensure avatarUrl exists and dob is parsed correctly
           return {
                ...parsed,
                dob: parsed.dob ? new Date(parsed.dob) : undefined,
                avatarUrl: parsed.avatarUrl || '',
            };
        } catch (e) {
            console.error("Failed to parse user profile:", e);
        }
     }
   }
  // Default mock data if nothing is stored
  return {
    name: 'Alex Doe',
    username: 'alex_doe',
    email: 'alex.doe@example.com',
    dob: undefined,
    avatarUrl: '', // Default empty avatar URL
  };
};

// Mock function to save user data (replace with actual API call)
const saveUserData = (data: ProfileFormValues) => {
   if (typeof window !== 'undefined') {
    // Convert date to string for storage if it exists
    const dataToStore = {
      ...data,
      dob: data.dob ? data.dob.toISOString() : null,
      avatarUrl: data.avatarUrl || '', // Ensure avatarUrl is stored
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

  const [imagePreview, setImagePreview] = React.useState<string | null>(form.getValues("avatarUrl"));
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  // Watch name for fallback initials
  const userName = form.watch("name");

  // Update preview when form value changes (e.g., on load or reset)
  React.useEffect(() => {
      setImagePreview(form.getValues("avatarUrl"));
  }, [form.watch("avatarUrl")]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('avatarUrl', result, { shouldDirty: true }); // Update form value with data URL
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value to allow selecting the same file again if needed
     if (event.target) {
       event.target.value = '';
     }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerCameraInput = () => cameraInputRef.current?.click();


  const onSubmit = async (data: ProfileFormValues) => {
    try {
      // The avatarUrl field now contains the data URL from the preview
      await saveUserData(data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
       form.reset(data); // Reset form with the saved data to clear dirty state
    } catch (error) {
        console.error("Error saving profile:", error);
      toast({
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Generate initials for Avatar fallback
  const getInitials = (name: string | undefined): string => {
    if (!name) return '';
    const names = name.split(' ');
    return names
      .map((n) => n[0])
      .slice(0, 2) // Take first letter of first two names
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/50 p-4">
       {/* Hidden File Inputs */}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
        />
        <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="user" // Trigger camera on mobile
            style={{ display: 'none' }}
        />

       <Card className="w-full max-w-2xl shadow-lg relative">
         <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground z-10"
            onClick={() => router.push('/')}
            aria-label="Back to Bookshelf"
          >
           <ArrowLeft className="h-5 w-5" />
         </Button>

         {/* Avatar Display & Upload Buttons */}
         <div className="flex flex-col items-center pt-8 -mb-2">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md mb-4">
                <AvatarImage src={imagePreview || undefined} alt={userName || 'User Profile'} />
                <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                 {userName ? getInitials(userName) : <User className="h-8 w-8" />}
                </AvatarFallback>
             </Avatar>
             <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={triggerFileInput}>
                     <ImageIcon className="mr-2 h-4 w-4" /> Upload
                 </Button>
                 <Button variant="outline" size="sm" onClick={triggerCameraInput}>
                    <Camera className="mr-2 h-4 w-4" /> Capture
                 </Button>
             </div>
             <FormMessage className="text-xs mt-1">
                 {form.formState.errors.avatarUrl?.message}
            </FormMessage>
         </div>


        <CardHeader className="text-center pt-6"> {/* Adjusted padding-top */}
          <CardTitle className="text-2xl">Profile Details</CardTitle>
          <CardDescription>
            View and update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               {/* Hidden Field for avatarUrl - managed by state/buttons */}
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem style={{ display: 'none' }}>
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          onSelect={(date) => field.onChange(date || undefined)} // Handle undefined date
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
                    onClick={() => {
                        const defaultData = fetchUserData();
                        form.reset(defaultData);
                        setImagePreview(defaultData.avatarUrl); // Reset preview as well
                    }}
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
