
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // Set the error path to confirmPassword field
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter(); // Get router instance
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    // Placeholder for actual signup logic
    console.log('Signup attempt with:', { email: data.email }); // Avoid logging password

    // --- TODO: Implement actual signup ---
    // 1. Send `data.email` and `data.password` to your backend/auth provider.
    // 2. Handle the response:
    //    - On success: Log the user in immediately (store session/token)
    //                 Create a basic profile in localStorage (or fetch from backend)
    //                 Redirect to home page.
    //    - On failure (e.g., email exists): Show an error toast.

    // **Mock Success Simulation:**
    // For demonstration, we'll simulate a successful signup and save mock data.
    const mockUserProfile = {
      name: `User_${data.email.split('@')[0]}`, // Create a simple name
      email: data.email,
      username: data.email.split('@')[0], // Create a simple username
      avatarUrl: '', // Default avatar
      dob: null,
    };
    localStorage.setItem('userProfile', JSON.stringify(mockUserProfile));
    // Show success toast
    toast({
      title: 'Signup Successful',
      description: 'Welcome! Redirecting you to the home page...',
    });

    // Redirect to home page after a short delay to allow toast visibility
    setTimeout(() => {
      router.push('/');
    }, 1500); // Redirect after 1.5 seconds
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Enter your email and password to sign up for BookBurst {/* Updated Name */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
           <div className="mt-4 text-center text-muted-foreground">
             Already have an account?{' '}
             <Link href="/login" className="underline text-primary hover:text-primary/80">
               Login
             </Link>
             <span className="mx-1">|</span>
              <Link href="/" className="underline text-primary hover:text-primary/80">
               Back to Home
             </Link>
           </div>
        </CardFooter>
      </Card>
    </div>
  );
}
