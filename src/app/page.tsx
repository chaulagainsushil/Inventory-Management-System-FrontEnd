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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Smartphone, ShieldCheck, Warehouse } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          toast({
            title: 'Login Successful',
            description: 'Redirecting to your dashboard...',
          });
          router.push('/dashboard');
        } else {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Authentication token was not provided.',
          });
        }
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
      <div className="hidden bg-primary text-primary-foreground lg:flex flex-col items-center justify-center p-12 text-center">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold font-headline mb-4">Streamline Your Inventory</h2>
          <p className="text-lg opacity-90 mb-8">
            StockSync is a powerful, intuitive inventory management system designed to give you complete control over your stock, from procurement to sales.
          </p>
          <div className="space-y-6 text-left">
            <div className="flex items-start gap-4">
              <div className="bg-accent/20 p-2 rounded-full">
                <Warehouse className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">What is StockSync?</h3>
                <p className="opacity-80">
                  An all-in-one platform to track products, manage suppliers, handle purchase orders, and monitor stock levels in real-time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-accent/20 p-2 rounded-full">
                <ShieldCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Why is it reliable?</h3>
                <p className="opacity-80">
                  Built on a robust and secure architecture, StockSync ensures your data is always safe, accurate, and accessible when you need it.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-accent/20 p-2 rounded-full">
                <Smartphone className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Mobile App Available</h3>
                <p className="opacity-80">
                  Manage your inventory on the go. Our mobile app keeps you connected and in control, wherever you are.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-4xl font-bold font-headline text-primary">StockSync</h1>
            <p className="text-balance text-muted-foreground">
              Welcome back! Please log in to continue.
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
    </div>
  );
}
