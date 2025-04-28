
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
import { CalendarIcon, ArrowLeft, User, Camera, Image as ImageIcon, Users, UserCheck, LogIn } from 'lucide-react'; // Added LogIn
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
  avatarUrl: z.string().optional().or(z.literal('')).refine(url => !url || url.startsWith('data:image/') || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)).*$/.test(url), {
        message: "Avatar must be a valid image data URI or URL.",
    }), // Optional Avatar URL or data URI validated
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
                name: parsed.name || '', // Default to empty string if missing
                username: parsed.username || '', // Default to empty string if missing
                email: parsed.email || 'user@example.com', // Default email
                dob: parsed.dob ? new Date(parsed.dob) : undefined,
                avatarUrl: parsed.avatarUrl || '',
            };
        } catch (e) {
            console.error("Failed to parse user profile:", e);
        }
     }
   }
  // Default mock data if nothing is stored or error occurs
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
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // Loading state for auth check

  // Fetch user data only if logged in
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {}, // Initialize empty, load data in useEffect
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  // Watch name for fallback initials
  const userName = form.watch("name");
  // Watch avatarUrl for preview and error handling
  const watchedAvatarUrl = form.watch("avatarUrl");

  // Mock follower/following counts - Reset to 0
  const [followerCount, setFollowerCount] = React.useState(0);
  const [followingCount, setFollowingCount] = React.useState(0);

  // Effect for checking login status and loading data
  React.useEffect(() => {
    // Check login status on client mount
    const userProfileExists = localStorage.getItem('userProfile');
    const loggedIn = !!userProfileExists;
    setIsLoggedIn(loggedIn);

     if (loggedIn) {
        // Load user data if logged in
        const userData = fetchUserData();
        form.reset(userData); // Reset form with fetched data
        setImagePreview(userData.avatarUrl || null);
        // TODO: In a real app, fetch actual follower/following counts here
        // For now, they remain 0 as initialized above
    } else {
         toast({
             title: "Login Required",
             description: "Please log in to view your profile.",
             variant: "destructive",
              action: (
                  <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                      Login
                  </Button>
              ),
         });
         // Redirect if not logged in
         // router.push('/login');
    }
    setIsLoading(false); // Finish loading check
  }, [form, router, toast]); // Add form, router, toast to dependencies

  // Effect for updating image preview when watchedAvatarUrl changes
  React.useEffect(() => {
      setImagePreview(watchedAvatarUrl || null); // Use null instead of empty string for consistency
  }, [watchedAvatarUrl]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Example: 5MB limit
           form.setError('avatarUrl', { type: 'manual', message: 'Image size should not exceed 5MB.' });
           setImagePreview(form.getValues('avatarUrl') || null); // Reset preview to original if error
           return;
       }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('avatarUrl', result, { shouldValidate: true, shouldDirty: true }); // Update form value with data URL and validate
        form.clearErrors('avatarUrl'); // Clear previous errors on successful load
      };
      reader.onerror = () => {
        form.setError('avatarUrl', { type: 'manual', message: 'Failed to read image file.' });
        setImagePreview(form.getValues('avatarUrl') || null); // Reset preview on error
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
      // The avatarUrl field now contains the data URL from the preview or original URL
      await saveUserData(data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
       // Reset the form with the *saved* data to clear dirty state
       // and ensure the form values match the persisted state.
       form.reset(data);
       // Explicitly update the preview state after reset to match the saved data
       setImagePreview(data.avatarUrl || null);
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

  // Render loading state
  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <p className="text-lg text-muted-foreground">Loading profile...</p>
             {/* Optional: Add a spinner */}
        </div>
    );
  }

  // Render login prompt if not logged in
  if (!isLoggedIn) {
      return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/50 p-4">
              <div className="text-center max-w-md bg-background p-8 rounded-lg shadow-lg border">
                  <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
                  <p className="text-muted-foreground mb-6">You need to be logged in to view or edit your profile.</p>
                  <Button onClick={() => router.push('/login')} size="lg">
                      <LogIn className="mr-2 h-5 w-5" /> Login to Continue
                  </Button>
                  <Button variant="link" size="sm" asChild className="mt-4">
                      <Link href="/">
                          <ArrowLeft className="mr-1 h-4 w-4" /> Go Back Home
                      </Link>
                  </Button>
              </div>
         </div>
      );
  }


  // Render profile page if logged in
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/50 p-4">
       {/* Hidden File Inputs */}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif, image/webp" // Be specific about accepted types
            style={{ display: 'none' }}
            aria-hidden="true" // Hide from accessibility tree
        />
        <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="user" // Trigger camera on mobile
            style={{ display: 'none' }}
            aria-hidden="true" // Hide from accessibility tree
        />

       <Card className="w-full max-w-2xl shadow-lg relative">
         <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground z-10"
            onClick={() => router.push('/')} // Navigate home instead of back
            aria-label="Back to Home" // Updated Label
          >
           <ArrowLeft className="h-5 w-5" />
         </Button>

        <Form {...form}> {/* Form provider now wraps the entire form including avatar */}
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Avatar Display & Upload Buttons - Moved inside Form */}
                <div className="flex flex-col items-center pt-8">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md mb-2">
                        <AvatarImage src={imagePreview || undefined} alt={userName || 'User Profile'} />
                        <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                         {userName ? getInitials(userName) : <User className="h-8 w-8" />}
                        </AvatarFallback>
                     </Avatar>
                     {/* Follower/Following Counts */}
                     <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span><span className="font-semibold text-foreground">{followerCount}</span> Followers</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <UserCheck className="h-4 w-4" />
                            <span><span className="font-semibold text-foreground">{followingCount}</span> Following</span>
                        </div>
                     </div>
                     <div className="flex gap-2">
                         <Button type="button" variant="outline" size="sm" onClick={triggerFileInput}>
                             <ImageIcon className="mr-2 h-4 w-4" /> Upload
                         </Button>
                         <Button type="button" variant="outline" size="sm" onClick={triggerCameraInput}>
                            <Camera className="mr-2 h-4 w-4" /> Capture
                         </Button>
                     </div>
                     {/* FormMessage for avatarUrl, now correctly inside the Form context */}
                     <FormField
                        control={form.control}
                        name="avatarUrl" // Needs to be part of a FormField to show message correctly
                        render={({ field }) => (
                            <FormItem className="h-4 mt-1"> {/* Adjusted spacing/height */}
                                <FormMessage className="text-xs text-center"/>
                                {/* Hidden input managed by buttons/state, still needed for RHF */}
                                <FormControl>
                                    {/* Use hidden input for RHF, actual file input is separate */}
                                    <input type="hidden" {...field} value={field.value ?? ''} />
                                </FormControl>
                            </FormItem>
                        )}
                     />
                 </div>

                <CardHeader className="text-center pt-4"> {/* Adjusted padding-top */}
                  <CardTitle className="text-2xl">Profile Details</CardTitle>
                  <CardDescription>
                    View and update your personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                </CardContent>
                <CardFooter className="flex justify-end gap-2 px-6 pb-6 pt-0">
                         <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                // Reload default data for the logged-in user
                                const defaultData = fetchUserData();
                                form.reset(defaultData);
                                setImagePreview(defaultData.avatarUrl || null); // Reset preview as well
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
      </Card>
    </div>
  );
}
