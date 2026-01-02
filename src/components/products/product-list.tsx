
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Product, type Category } from '@/lib/types';
import ProductForm from './product-form';
import { z } from 'zod';

const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

const productFormSchema = z.object({
  productName: z.string().min(2, 'Product name is too short'),
  description: z.string().min(5, 'Description is too short'),
  pricePerUnit: z.coerce.number().min(0, 'Selling price must be a positive number.'),
  pricePerUnitPurchased: z.coerce.number().min(0, 'Purchase price must be a positive number.'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock quantity must be a whole number.'),
  safetyStock: z.coerce.number().int().min(0, 'Safety stock must be a whole number.'),
  leadTimeDays: z.coerce.number().int().min(0, 'Lead time must be a positive whole number.'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.coerce.number().int().min(1, 'Category is required'),
  supplierId: z.coerce.number().int().min(1, 'Supplier ID is required'),
});


export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const getAuthHeaders = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to manage products. Please log in again.',
      });
      return null;
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [toast]);

  const fetchData = useCallback(
    async (retries = 3) => {
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
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/Product`, { headers }),
          fetch(`${apiBaseUrl}/Category`, { headers }),
        ]);

        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products. The server might be down or experiencing issues.');
        }
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories. The server might be unavailable.');
        }

        const productsData = await productsResponse.json();
        const categoriesData: Category[] = await categoriesResponse.json();
        
        const categoryMap = new Map(categoriesData.map(cat => [cat.id, cat.name]));

        const mappedProducts = productsData.map((p: any) => ({
          ...p,
          supplierId: p.suppliersInfromationId || p.supplierId,
        }));

        setProducts(mappedProducts);
        setCategories(categoryMap);

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error Fetching Data',
          description: error.message || 'An unknown error occurred.',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, getAuthHeaders]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: z.infer<typeof productFormSchema>) => {
    setFormLoading(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setFormLoading(false);
      return;
    }

    const isEditing = !!selectedProduct;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiBaseUrl}/Product/${selectedProduct.id}` : `${apiBaseUrl}/Product`;

    const body = JSON.stringify(isEditing ? { ...values, id: selectedProduct.id } : values);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Server error: Failed to ${isEditing ? 'update' : 'create'} product.`);
      }

      toast({
        title: 'Success',
        description: `Product successfully ${isEditing ? 'updated' : 'created'}.`,
      });

      setIsFormOpen(false);
      fetchData(); // Refresh list
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const getStatus = (stock: number, safetyStock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock <= safetyStock) return <Badge variant="secondary" className="bg-yellow-500 text-black">Low Stock</Badge>;
    return <Badge className="bg-green-500">In Stock</Badge>;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Product Management</h1>
        <Button onClick={handleAddClick} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>A list of all your products.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] hidden sm:table-cell">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden xl:table-cell">Description</TableHead>
                    <TableHead>Sell Price</TableHead>
                    <TableHead className="hidden md:table-cell">Buy Price</TableHead>
                    <TableHead className="hidden lg:table-cell">SKU</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="hidden lg:table-cell">Safety Stock</TableHead>
                    <TableHead className="hidden lg:table-cell">Lead Time</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">{product.id}</TableCell>
                        <TableCell className="font-medium">{product.productName}</TableCell>
                        <TableCell>{categories.get(product.categoryId) || 'N/A'}</TableCell>
                        <TableCell className="hidden xl:table-cell max-w-[250px] truncate">{product.description}</TableCell>
                        <TableCell>Rs. {product.pricePerUnit.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">Rs. {product.pricePerUnitPurchased.toFixed(2)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{product.sku}</TableCell>
                        <TableCell>{product.stockQuantity}</TableCell>
                        <TableCell className="hidden lg:table-cell">{product.safetyStock}</TableCell>
                        <TableCell className="hidden lg:table-cell">{product.leadTimeDays} days</TableCell>
                        <TableCell className="hidden sm:table-cell">{getStatus(product.stockQuantity, product.safetyStock)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(product)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center h-24">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        loading={formLoading}
      />
    </>
  );
}
