
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
import Link from 'next/link'; // Import Link for navigation
import { useRouter } from 'next/navigation'; // Import useRouter

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'), // Simple check for presence
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log('Login attempt with:', data.email); // Avoid logging password

    // --- Implement actual authentication using localStorage ---
    if (typeof window !== 'undefined') {
        // 1. Retrieve stored user data based on email
        const storageKey = `user_${data.email}`;
        const storedUserRaw = localStorage.getItem(storageKey);
        console.log(`Checking localStorage key: ${storageKey}`); // Debugging

        if (!storedUserRaw) {
            console.log('No user data found for this email.'); // Debugging
            toast({
                title: 'Login Failed',
                description: 'Invalid email or password.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const storedUserData = JSON.parse(storedUserRaw);
            console.log('Stored user data found:', storedUserData); // Debugging

            // 2. Compare entered password with stored password (Insecure!)
            if (storedUserData.password && storedUserData.password === data.password) {
                // --- Success ---
                console.log('Password match successful.'); // Debugging
                // 3. Create and store the basic profile to simulate session
                 // Ensure all necessary fields are present, falling back to stored data
                const userProfile = {
                    name: storedUserData.name || storedUserData.username || '', // Use stored name or username
                    email: storedUserData.email, // Use stored email
                    username: storedUserData.username || data.email.split('@')[0], // Use stored username or generate default
                    avatarUrl: storedUserData.avatarUrl || '', // Use stored avatar or default
                    dob: storedUserData.dob || null,     // Use stored DOB or null
                };
                console.log('Creating user profile for session:', userProfile); // Debugging
                localStorage.setItem('userProfile', JSON.stringify(userProfile));

                toast({
                  title: 'Login Successful',
                  description: 'Welcome back! Redirecting...',
                });
                // 4. Redirect to home page
                 router.push('/');

            } else {
                 // --- Failure (Incorrect Password) ---
                 console.log('Password mismatch.'); // Debugging
                 toast({
                    title: 'Login Failed',
                    description: 'Invalid email or password.',
                    variant: 'destructive',
                 });
            }
        } catch (e) {
            console.error("Error parsing stored user data:", e);
            toast({
                title: 'Login Error',
                description: 'An error occurred during login. Please try again.',
                variant: 'destructive',
            });
        }

    } else {
        // Handle case where localStorage is not available
        toast({
          title: 'Login Error',
          description: 'Could not access storage. Please try again.',
          variant: 'destructive',
        });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login to BookBurst</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
           <div className="mt-4 text-center text-muted-foreground">
             Don't have an account?{' '}
             <Link href="/signup" className="underline text-primary hover:text-primary/80">
               Sign up
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

