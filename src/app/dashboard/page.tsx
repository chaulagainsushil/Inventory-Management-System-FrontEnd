
import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import { Boxes, LayoutGrid, AlertTriangle, CreditCard, Users } from "lucide-react";
import InventoryMovementChart from "@/components/dashboard/inventory-movement-chart";
import ProductList from "@/components/dashboard/product-list";
import CategoryCountStat from "@/components/dashboard/category-count-stat";
import ProductCountStat from "@/components/dashboard/product-count-stat";
import UserCountStat from "@/components/dashboard/user-count-stat";
import MonthlyRevenueStat from "@/components/dashboard/monthly-revenue-stat";
import StockAlertStat from "@/components/dashboard/stock-alert-stat";

export const metadata: Metadata = {
  title: "Dashboard | StockSync",
  description: "Inventory Management Dashboard",
};

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <CategoryCountStat />
              <ProductCountStat />
              <UserCountStat />
              <StockAlertStat />
              <MonthlyRevenueStat />
            </div>

            <InventoryMovementChart />

            <ProductList />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
