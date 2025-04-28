
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
  email: z.string().email('Invalid email address'), // Email is read-only
  dob: z.date().optional(), // Date of Birth is optional
  avatarUrl: z.string().url("Must be a valid image URL or data URI.").optional().or(z.literal('')).refine(url => !url || url.startsWith('data:image/') || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)).*$/.test(url), {
        message: "Avatar must be a valid image data URI or URL.",
    }), // Optional Avatar URL or data URI validated
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// **Removed fetchUserData - will load directly from localStorage in useEffect**

// Function to save user data to localStorage
const saveUserData = (data: ProfileFormValues) => {
   if (typeof window !== 'undefined') {
    // Retrieve the full user data (including password if stored - insecure!)
    const storedUserRaw = localStorage.getItem(`user_${data.email}`);
    let fullUserData = {};
    if (storedUserRaw) {
        try {
            fullUserData = JSON.parse(storedUserRaw);
        } catch (e) {
            console.error("Failed to parse existing user data for save:", e);
        }
    }

    // Merge updated profile data with existing data (like password)
    const dataToStore = {
      ...fullUserData, // Keep existing fields like password
      name: data.name,
      username: data.username,
      email: data.email, // Ensure email is saved
      dob: data.dob ? data.dob.toISOString() : null, // Convert date to string
      avatarUrl: data.avatarUrl || '', // Ensure avatarUrl is saved
    };

    // Save the merged data back to the user-specific key
    localStorage.setItem(`user_${data.email}`, JSON.stringify(dataToStore));

    // Also update the 'userProfile' key for current session display
     const profileDataForSession = {
        name: data.name,
        username: data.username,
        email: data.email,
        avatarUrl: data.avatarUrl || '',
        dob: data.dob ? data.dob.toISOString() : null,
     };
    localStorage.setItem('userProfile', JSON.stringify(profileDataForSession));

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
    defaultValues: { // Set explicit defaults matching the schema
        name: '',
        username: '',
        email: '',
        dob: undefined,
        avatarUrl: '',
    },
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  // Watch form fields
  const userName = form.watch("name");
  const watchedAvatarUrl = form.watch("avatarUrl");

  // Mock follower/following counts - Reset to 0
  const [followerCount, setFollowerCount] = React.useState(0);
  const [followingCount, setFollowingCount] = React.useState(0);

  // Effect for checking login status and loading data
  React.useEffect(() => {
    setIsLoading(true); // Start loading
    // Check login status on client mount
    const userProfileRaw = localStorage.getItem('userProfile');
    const loggedIn = !!userProfileRaw;
    setIsLoggedIn(loggedIn);

     if (loggedIn && userProfileRaw) {
        // Load user data if logged in
        try {
            const storedProfile = JSON.parse(userProfileRaw);
            // **Load the full data from the user-specific key for editing**
             const storedUserRaw = localStorage.getItem(`user_${storedProfile.email}`);
             let userDataForForm: ProfileFormValues = { // Initialize with defaults
                 name: '',
                 username: '',
                 email: storedProfile.email || '', // Use email from profile as key
                 dob: undefined,
                 avatarUrl: '',
             };

             if (storedUserRaw) {
                const storedUserData = JSON.parse(storedUserRaw);
                // Map the stored data (which might include password etc.) to the form values
                userDataForForm = {
                    name: storedUserData.name || storedProfile.name || '', // Fallback logic
                    username: storedUserData.username || storedProfile.username || '',
                    email: storedUserData.email || storedProfile.email || '',
                    dob: storedUserData.dob ? new Date(storedUserData.dob) : undefined,
                    avatarUrl: storedUserData.avatarUrl || '',
                };
             } else {
                 // If user-specific data is missing (should ideally not happen if logged in), use profile data
                 userDataForForm = {
                     name: storedProfile.name || '',
                     username: storedProfile.username || '',
                     email: storedProfile.email || '',
                     dob: storedProfile.dob ? new Date(storedProfile.dob) : undefined,
                     avatarUrl: storedProfile.avatarUrl || '',
                 };
             }

            form.reset(userDataForForm); // Reset form with loaded data
            setImagePreview(userDataForForm.avatarUrl || null);
            // TODO: Fetch actual follower/following counts
        } catch (e) {
             console.error("Failed to parse user profile or data:", e);
             toast({ title: "Error Loading Profile", description: "Could not load profile data.", variant: "destructive" });
             // Log out the user if data is corrupted
             localStorage.removeItem('userProfile');
             localStorage.removeItem(`user_${form.getValues('email')}`); // Attempt cleanup
             setIsLoggedIn(false);
             router.push('/login'); // Redirect to login
        }
    } else {
         // Not logged in
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
         // Optional: Redirect if not logged in
         // router.push('/login');
    }
    setIsLoading(false); // Finish loading check
  }, [form, router, toast]); // Add dependencies

  // Effect for updating image preview when watchedAvatarUrl changes
  React.useEffect(() => {
      setImagePreview(watchedAvatarUrl || null);
  }, [watchedAvatarUrl]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
           form.setError('avatarUrl', { type: 'manual', message: 'Image size should not exceed 5MB.' });
           setImagePreview(form.getValues('avatarUrl') || null);
           return;
       }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('avatarUrl', result, { shouldValidate: true, shouldDirty: true });
        form.clearErrors('avatarUrl');
      };
      reader.onerror = () => {
        form.setError('avatarUrl', { type: 'manual', message: 'Failed to read image file.' });
        setImagePreview(form.getValues('avatarUrl') || null);
      };
      reader.readAsDataURL(file);
    }
     if (event.target) {
       event.target.value = '';
     }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerCameraInput = () => cameraInputRef.current?.click();


  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await saveUserData(data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
       form.reset(data); // Reset form with the *saved* data
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
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Render loading state
  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <p className="text-lg text-muted-foreground">Loading profile...</p>
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
            accept="image/png, image/jpeg, image/gif, image/webp"
            style={{ display: 'none' }}
            aria-hidden="true"
        />
        <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="user"
            style={{ display: 'none' }}
            aria-hidden="true"
        />

       <Card className="w-full max-w-2xl shadow-lg relative">
         <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground z-10"
            onClick={() => router.push('/')}
            aria-label="Back to Home"
          >
           <ArrowLeft className="h-5 w-5" />
         </Button>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Avatar Display & Upload Buttons */}
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
                     {/* FormMessage for avatarUrl */}
                     <FormField
                        control={form.control}
                        name="avatarUrl"
                        render={({ field }) => (
                            <FormItem className="h-4 mt-1">
                                <FormMessage className="text-xs text-center"/>
                                <FormControl>
                                    <input type="hidden" {...field} value={field.value ?? ''} />
                                </FormControl>
                            </FormItem>
                        )}
                     />
                 </div>

                <CardHeader className="text-center pt-4">
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

                      {/* Email Field (Read-Only) */}
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
                                // Reload original data from localStorage to cancel changes
                                const profileRaw = localStorage.getItem('userProfile');
                                if (profileRaw) {
                                    try {
                                        const profile = JSON.parse(profileRaw);
                                        const userRaw = localStorage.getItem(`user_${profile.email}`);
                                        if (userRaw) {
                                            const userData = JSON.parse(userRaw);
                                            form.reset({
                                                name: userData.name || '',
                                                username: userData.username || '',
                                                email: userData.email || '',
                                                dob: userData.dob ? new Date(userData.dob) : undefined,
                                                avatarUrl: userData.avatarUrl || '',
                                            });
                                            setImagePreview(userData.avatarUrl || null);
                                        }
                                    } catch (e) {
                                        console.error("Error reloading original data:", e);
                                    }
                                }
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
