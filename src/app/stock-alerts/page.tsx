'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import StockAlertList from '@/components/stock-alerts/stock-alert-list';

export default function StockAlertsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <StockAlertList />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
