
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
    // Placeholder for actual login logic
    console.log('Login attempt with:', data.email); // Avoid logging password

    // --- TODO: Implement actual authentication ---
    // 1. Send `data.email` and `data.password` to your backend/auth provider.
    // 2. Handle the response:
    //    - On success: Store the user session/token (e.g., in cookies or localStorage)
    //                 Store minimal profile data (name, avatarUrl) in localStorage for quick UI updates.
    //                 Redirect to the home page or intended destination.
    //    - On failure: Show an appropriate error toast.

    // **Mock Success Simulation:**
    // For demonstration, we'll simulate a successful login and save mock data.
    const mockUserProfile = {
      name: 'Mock User',
      email: data.email,
      username: data.email.split('@')[0], // Create a simple username
      avatarUrl: '', // Default or generate a mock avatar
      dob: null, // Or a mock date
    };
    localStorage.setItem('userProfile', JSON.stringify(mockUserProfile));

    toast({
      title: 'Login Successful',
      description: 'Welcome back! Redirecting...',
    });
    // In a real app, redirect after successful auth confirmation
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login to BookBurst</CardTitle> {/* Updated Name */}
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
           {/* Links for signup and back to bookshelf */}
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
