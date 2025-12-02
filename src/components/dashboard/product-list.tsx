'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const apiBaseUrl = 'https://localhost:7232/api/Product';

const getBadgeClassName = (quantity: number, reorderLevel: number) => {
  if (quantity === 0) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
  }
  if (quantity <= reorderLevel) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
  }
  return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
};

const getStatus = (quantity: number, reorderLevel: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= reorderLevel) return 'Low Stock';
    return 'In Stock';
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getAuthHeaders = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchProducts = useCallback(
    async (retries = 3) => {
      const headers = getAuthHeaders();
      if (!headers) {
        if (retries > 0) {
          setTimeout(() => fetchProducts(retries - 1), 500);
        } else {
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'Could not find auth token. Please log in again.',
          });
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(apiBaseUrl, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch products for dashboard list.',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, getAuthHeaders]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const productImages = PlaceHolderImages.filter((p) => p.id.startsWith('product-'));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>A list of the latest products in your inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead className="hidden sm:table-cell">Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.slice(0, 5).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.productName}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.quantityPerUnit}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      ${product.pricePerUnit.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'capitalize',
                          getBadgeClassName(parseInt(product.quantityPerUnit, 10), product.reoredLevel)
                        )}
                        variant="secondary"
                      >
                        {getStatus(parseInt(product.quantityPerUnit, 10), product.reoredLevel)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
