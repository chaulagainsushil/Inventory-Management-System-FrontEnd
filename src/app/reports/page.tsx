'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import SalesByProductChart from '@/components/reports/sales-by-product-chart';
import ProductsByCategoryChart from '@/components/reports/products-by-category-chart';
import PaymentMethodSummaryChart from '@/components/reports/payment-method-summary-chart';
import UserSalesSummaryChart from '@/components/reports/user-sales-summary-chart';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { type TopSellingProduct, type CategoryProductInfo, type PaymentMethodData, type UserSalesData } from '@/lib/types';

export default function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [exporting, setExporting] = React.useState(false);

  const [topSellingProducts, setTopSellingProducts] = React.useState<TopSellingProduct[]>([]);
  const [productsByCategory, setProductsByCategory] = React.useState<CategoryProductInfo[]>([]);
  const [paymentMethodSummary, setPaymentMethodSummary] = React.useState<PaymentMethodData[]>([]);
  const [userSalesSummary, setUserSalesSummary] = React.useState<UserSalesData[]>([]);

  const getAuthHeaders = React.useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to view reports.',
      });
      return null;
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [toast]);

  const fetchData = React.useCallback(async (retries = 3) => {
    const headers = getAuthHeaders();
    if (!headers) {
      if (retries > 0) {
        setTimeout(() => fetchData(retries - 1), 500);
      } else {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      const [
        topSellingRes,
        productsByCategoryRes,
        paymentMethodRes,
        userSalesRes,
      ] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Sales/top-selling-products?topCount=10`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Product/products-by-category`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Sales/payment-method-summary`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Sales/user-sales-summary`, { headers }),
      ]);

      if (!topSellingRes.ok) throw new Error('Failed to fetch top-selling products.');
      const topSellingData = await topSellingRes.json();
      setTopSellingProducts(topSellingData);

      if (!productsByCategoryRes.ok) throw new Error('Failed to fetch product distribution data.');
      const productsByCategoryData = await productsByCategoryRes.json();
      if (productsByCategoryData.isSuccess && productsByCategoryData.data && productsByCategoryData.data.categories) {
        setProductsByCategory(productsByCategoryData.data.categories);
      }

      if (!paymentMethodRes.ok) throw new Error('Failed to fetch payment method summary.');
      const paymentMethodData = await paymentMethodRes.json();
      if (paymentMethodData.data) {
        setPaymentMethodSummary(paymentMethodData.data);
      }
      
      if (!userSalesRes.ok) throw new Error('Failed to fetch user sales summary.');
      const userSalesData = await userSalesRes.json();
      setUserSalesSummary(userSalesData);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching report data',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    if (exporting) return;
    setExporting(true);

    try {
      const wb = XLSX.utils.book_new();

      const topSellingWs = XLSX.utils.json_to_sheet(topSellingProducts);
      XLSX.utils.book_append_sheet(wb, topSellingWs, 'Top Selling Products');

      const productsByCategoryWs = XLSX.utils.json_to_sheet(productsByCategory);
      XLSX.utils.book_append_sheet(wb, productsByCategoryWs, 'Products By Category');

      const paymentMethodWs = XLSX.utils.json_to_sheet(paymentMethodSummary);
      XLSX.utils.book_append_sheet(wb, paymentMethodWs, 'Payment Method Summary');

      const userSalesWs = XLSX.utils.json_to_sheet(userSalesSummary);
      XLSX.utils.book_append_sheet(wb, userSalesWs, 'User Sales Summary');

      XLSX.writeFile(wb, 'StockSync_Reports.xlsx');

      toast({
        title: 'Export Successful',
        description: 'Your reports have been exported to Excel.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'An error occurred while exporting the reports.',
      });
    } finally {
      setExporting(false);
    }
  };


  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
              <Button onClick={handleExport} disabled={loading || exporting || topSellingProducts.length === 0}>
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export All to Excel
              </Button>
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <SalesByProductChart data={topSellingProducts} loading={loading} />
              <ProductsByCategoryChart data={productsByCategory} loading={loading} />
              <PaymentMethodSummaryChart data={paymentMethodSummary} loading={loading} />
              <UserSalesSummaryChart data={userSalesSummary} loading={loading} />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}