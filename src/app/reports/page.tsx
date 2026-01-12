'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import SalesByProductChart from '@/components/reports/sales-by-product-chart';
import ProductsByCategoryChart from '@/components/reports/products-by-category-chart';
import PaymentMethodSummaryChart from '@/components/reports/payment-method-summary-chart';
import UserSalesSummaryChart from '@/components/reports/user-sales-summary-chart';

export default function ReportsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <SalesByProductChart />
                <ProductsByCategoryChart />
                <PaymentMethodSummaryChart />
                <UserSalesSummaryChart />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
