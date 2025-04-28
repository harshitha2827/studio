
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, LogIn, Moon, Sun } from 'lucide-react'; // Added icons
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentTheme, setCurrentTheme] = React.useState('light'); // Default to light

  React.useEffect(() => {
    // Check login status
    const userProfileExists = localStorage.getItem('userProfile');
    const loggedIn = !!userProfileExists;
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      toast({
        title: 'Login Required',
        description: 'Please log in to access settings.',
        variant: 'destructive',
      });
      // Optionally redirect immediately
      // router.push('/login');
    } else {
        // Load theme preference from localStorage
        const savedTheme = localStorage.getItem('theme') || 'light';
        setCurrentTheme(savedTheme);
        // Apply the theme class initially
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
    }

    setIsLoading(false);
  }, [router, toast]);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: 'Theme Updated',
      description: `Switched to ${theme} mode.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
        <div className="text-center max-w-md bg-background p-8 rounded-lg shadow-lg border">
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access settings.
          </p>
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

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="truncate text-xl font-semibold">Settings</h1>
          <div>{/* Placeholder */}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl flex-1 space-y-8 px-4 py-8">
        {/* Theme Settings Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label className="text-base">Theme</Label>
              <RadioGroup
                defaultValue={currentTheme}
                onValueChange={(value) => handleThemeChange(value as 'light' | 'dark')}
                className="grid max-w-md grid-cols-2 gap-4 pt-2"
              >
                {/* Light Theme Option */}
                <div>
                  <RadioGroupItem value="light" id="light" className="peer sr-only" />
                  <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    Light
                  </Label>
                </div>
                {/* Dark Theme Option */}
                <div>
                  <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                  <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    Dark
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Add other settings sections here (e.g., Account, Notifications) */}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
