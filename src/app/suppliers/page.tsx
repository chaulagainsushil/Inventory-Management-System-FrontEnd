'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import SupplierList from '@/components/suppliers/supplier-list';

export default function SuppliersPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <SupplierList />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
