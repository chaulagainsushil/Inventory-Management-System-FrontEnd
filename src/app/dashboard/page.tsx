
import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import StatCard from "@/components/dashboard/stat-card";
import { Boxes, LayoutGrid, AlertTriangle, DollarSign, Users } from "lucide-react";
import InventoryMovementChart from "@/components/dashboard/inventory-movement-chart";
import StockReportChart from "@/components/dashboard/stock-report-chart";
import TargetPrediction from "@/components/dashboard/target-prediction";
import SalesStatsChart from "@/components/dashboard/sales-stats-chart";
import ProductList from "@/components/dashboard/product-list";
import CategoryCountStat from "@/components/dashboard/category-count-stat";
import ProductCountStat from "@/components/dashboard/product-count-stat";
import UserCountStat from "@/components/dashboard/user-count-stat";

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
              <StatCard title="Stock Alerts" value="5" icon={AlertTriangle} variant="destructive" />
              <StatCard title="Monthly Revenue" value="$45,231.89" icon={DollarSign} />
            </div>

            <InventoryMovementChart />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StockReportChart />
              <TargetPrediction />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProductList />
              </div>
              <SalesStatsChart />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
