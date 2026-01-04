'use client';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Boxes,
  LayoutGrid,
  Truck,
  FileStack,
  BarChart as BarChartIcon,
  Settings,
  LogOut,
  UserPlus,
  Users,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/products', icon: Boxes, label: 'Products' },
  { href: '/categories', icon: LayoutGrid, label: 'Categories' },
  { href: '/suppliers', icon: Truck, label: 'Suppliers' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/stock-alerts', icon: AlertTriangle, label: 'Stock Alerts' },
  { href: '#', icon: FileStack, label: 'Purchase Record' },
  { href: '/reports', icon: BarChartIcon, label: 'Reports' },
  { href: '/users', icon: UserPlus, label: 'Create User' },
  { href: '#', icon: Settings, label: 'Settings' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2 justify-center group-data-[collapsible=icon]:justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-primary shrink-0"
          >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
            <path d="m3.3 7 8.7 5 8.7-5"></path>
            <path d="M12 22V12"></path>
          </svg>
          <span className="text-xl font-headline font-semibold text-primary group-data-[collapsible=icon]:hidden">
            StockSync
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
