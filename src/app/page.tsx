'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-illustration');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://localhost:7232/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Assuming the API returns a token or session info which you might want to store
        // For now, just redirecting on success
        toast({
          title: 'Login Successful',
          description: 'Redirecting to your dashboard...',
        });
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: errorData.message || 'Invalid credentials. Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Could not connect to the server. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-4xl font-bold font-headline text-primary">StockSync</h1>
            <p className="text-balance text-muted-foreground">
              Manage your stock efficiently with StockSync.
            </p>
          </div>
          <Card className="shadow-lg">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Login</CardTitle>
                <CardDescription>Enter your email below to login to your account</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="ml-auto inline-block text-sm underline">
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" disabled={loading} />
                  <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:from-primary/90 hover:to-accent/90" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            data-ai-hint={loginImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>
    </div>
  );
}
