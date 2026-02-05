"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { type User, type StockAlert } from "@/lib/types";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        setNotificationLoading(false);
        return;
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Sales/reorder-alerts`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (response.ok) {
            const data = await response.json();
            setAlerts(data.alerts || []);
        } else {
            console.error("Failed to fetch notifications");
            setAlerts([]);
        }
    } catch (error) {
        console.error("Failed to fetch notifications", error);
        setAlerts([]);
    } finally {
        setNotificationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000); // Re-fetch every 5 minutes
    return () => clearInterval(interval);
  }, [fetchAlerts]);


  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="hidden md:block">
        <h1 className="text-lg md:text-2xl font-semibold">Welcome Back, {user?.name || 'User'}</h1>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <DropdownMenu onOpenChange={(open) => {
            if(open) {
                setNotificationLoading(true);
                fetchAlerts();
            }
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {alerts.length > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                            {alerts.length}
                        </span>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px]">
                <DropdownMenuLabel>Stock Alerts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificationLoading ? (
                    <DropdownMenuItem disabled>
                        <div className="flex items-center justify-center w-full p-4">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                        </div>
                    </DropdownMenuItem>
                ) : alerts.length > 0 ? (
                    <>
                        {alerts.slice(0, 5).map((alert) => (
                            <DropdownMenuItem key={alert.productId} onSelect={() => router.push('/stock-alerts')} className="cursor-pointer">
                                <div className="flex flex-col w-full">
                                    <span className="font-semibold text-destructive">{alert.productName} is low on stock.</span>
                                    <span className="text-sm text-muted-foreground">
                                        Only {alert.currentStock} left.
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                        {alerts.length > 5 && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => router.push('/stock-alerts')} className="justify-center cursor-pointer text-sm font-medium text-primary">
                                    View all {alerts.length} alerts
                                </DropdownMenuItem>
                            </>
                        )}
                    </>
                ) : (
                    <DropdownMenuItem disabled>
                        <div className="text-center w-full p-4 text-sm text-muted-foreground">
                            No new alerts.
                        </div>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1718037229583-0a4a5a549156?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=580&q=80" alt="@admin" />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
