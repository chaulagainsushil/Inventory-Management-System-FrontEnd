"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { type User, type StockAlert } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, UserCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchAlerts = async (retries = 3) => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('authToken');
    if (!token) {
      if (retries > 0) {
        setTimeout(() => fetchAlerts(retries - 1), 500);
      }
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Sales/reorder-alerts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const newAlerts = data.alerts || [];
        setAlerts(newAlerts);
        setUnreadCount(newAlerts.length);
      } else if (response.status !== 401) {
        toast({
          variant: "destructive",
          title: "Failed to fetch notifications",
          description: "Could not retrieve stock alerts from the server.",
        });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [toast]);

  const handleMarkAsRead = () => {
    setUnreadCount(0);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-lg md:text-2xl font-semibold">Welcome Back, {user?.name || 'User'}</h1>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu onOpenChange={(open) => { if (!open) handleMarkAsRead() }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications</span>
              {alerts.length > 0 && <span className="text-xs text-muted-foreground">{alerts.length} new</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts.length > 0 ? (
              alerts.slice(0, 5).map((alert) => (
                <DropdownMenuItem key={alert.productId} asChild>
                  <Link href="/stock-alerts" className="flex items-start gap-3">
                    <div className="text-destructive mt-1">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{alert.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock is low ({alert.currentStock}). Reorder suggested.
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                You have no new notifications.
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/stock-alerts" className="w-full flex justify-center">
                    View all alerts
                </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserCircle className="h-6 w-6" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
