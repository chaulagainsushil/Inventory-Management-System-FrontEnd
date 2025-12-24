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
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@/lib/types';
import ProductForm from './product-form';
import { z } from 'zod';

const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/Product`;

const productFormSchema = z.object({
    productName: z.string().min(2, 'Product name is too short'),
    description: z.string().min(5, 'Description is too short'),
    pricePerUnit: z.coerce.number().min(0, 'Price must be a positive number'),
    sku: z.string().min(1, 'SKU is required'),
    quantityPerUnit: z.string().min(1, 'Quantity is required'),
    reoredLevel: z.coerce.number().int().min(0, 'Reorder level must be a positive integer'),
    categoryId: z.coerce.number().int().min(1, 'Category ID is required'),
    supplierId: z.coerce.number().int().min(1, 'Supplier ID is required'),
  });

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const getAuthHeaders = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchProducts = useCallback(async (retries = 3) => {
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
        description: 'Could not fetch products. Is your API server running and are you logged in?',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, getAuthHeaders]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to perform this action.' });
        setFormLoading(false);
        return;
    }

    const isEditing = !!selectedProduct;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiBaseUrl}/${selectedProduct.id}` : apiBaseUrl;
    
    const body = JSON.stringify(isEditing ? { ...values, id: selectedProduct.id } : values);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${errorData || 'Failed to process request'}`);
      }
      
      toast({
        title: 'Success',
        description: `Product successfully ${isEditing ? 'updated' : 'created'}.`,
      });

      setIsFormOpen(false);
      fetchProducts(); // Refresh list
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: `Could not ${isEditing ? 'update' : 'create'} product. ${error.message}`,
      });
    } finally {
      setFormLoading(false);
    }
  };


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button onClick={handleAddClick} className="bg-primary hover:bg-primary/90">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell className="font-medium">{product.productName}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{product.pricePerUnit.toFixed(2)}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.quantityPerUnit}</TableCell>
                    <TableCell>{product.reoredLevel}</TableCell>
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
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
