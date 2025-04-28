
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
    console.log('Signup attempt with:', { email: data.email }); // Avoid logging password

    // --- Implement actual signup using localStorage ---
    if (typeof window !== 'undefined') {
        // 1. Check if email already exists
        const existingUserRaw = localStorage.getItem(`user_${data.email}`);
        if (existingUserRaw) {
            toast({
                title: 'Signup Failed',
                description: 'An account with this email already exists. Please log in.',
                variant: 'destructive',
            });
            return; // Stop signup process
        }

        // 2. Store user credentials (Insecure - for demonstration only)
        const userData = {
            email: data.email,
            password: data.password, // Storing plain password - highly insecure!
            username: data.email.split('@')[0] || `user_${Date.now()}`, // Generate username
        };
        localStorage.setItem(`user_${data.email}`, JSON.stringify(userData));

        // 3. Create and store the basic profile for immediate login
        const userProfile = {
            name: userData.username, // Use username as initial name
            email: data.email,
            username: userData.username,
            avatarUrl: '', // Default avatar
            dob: null,
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        // 4. Show success toast
        toast({
          title: 'Signup Successful',
          description: 'Welcome! Redirecting you to the home page...',
        });

        // 5. Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 1500); // Redirect after 1.5 seconds

    } else {
        // Handle case where localStorage is not available (should not happen in browser)
        toast({
          title: 'Signup Error',
          description: 'Could not access storage. Please try again.',
          variant: 'destructive',
        });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Enter your email and password to sign up for BookBurst
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
