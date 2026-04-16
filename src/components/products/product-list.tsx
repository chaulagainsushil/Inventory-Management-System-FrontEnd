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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.coerce.number().int().min(1, 'Category is required'),
  supplierId: z.coerce.number().int().min(1, 'Supplier ID is required'),
  leadTimeDays: z.coerce.number().int().min(0, 'Lead time must be a positive number.').optional(),
});


export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoryMap, setCategoryMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
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

  const fetchCategories = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const categoriesResponse = await fetch(`${apiBaseUrl}/Category`, { headers });
      if (!categoriesResponse.ok) throw new Error('Failed to fetch categories.');
      const categoriesData: Category[] = await categoriesResponse.json();
      setAllCategories(categoriesData);
      setCategoryMap(new Map(categoriesData.map(cat => [cat.id, cat.name])));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error Fetching Categories', description: error.message });
    }
  }, [getAuthHeaders, toast]);
  
  const fetchProducts = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }
    setLoading(true);
  
    let url = `${apiBaseUrl}/Product`;
    if (selectedCategoryId !== 'all') {
      url = `${apiBaseUrl}/Product/by-category/${selectedCategoryId}`;
    }
  
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Failed to fetch products.');
      const data = await response.json();
      const productsData = Array.isArray(data) ? data : data.products || [];
      
      setProducts(productsData.map((p: any) => ({ ...p, supplierId: p.suppliersInfromationId || p.supplierId })));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error Fetching Products', description: error.message });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, toast, selectedCategoryId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteAlertOpen(true);
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

    const body = JSON.stringify(isEditing ? { id: selectedProduct.id, ...values } : values);

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
      fetchProducts(); // Refresh list
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

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setFormLoading(true);

    const headers = getAuthHeaders();
    if (!headers) {
        setFormLoading(false);
        return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/Product/${selectedProduct.id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete product');
      }

      toast({
        title: 'Success',
        description: 'Product successfully deleted.',
      });

      setIsDeleteAlertOpen(false);
      fetchProducts(); // Refresh list
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setFormLoading(false);
    }
  };


  const getStatus = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock > 0 && stock <= 10) return <Badge variant="secondary" className="bg-yellow-500 text-black">Low Stock</Badge>;
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>A list of all your products.</CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="sm:w-[300px] w-full">
                  <SelectValue placeholder="Filter by category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">{product.id}</TableCell>
                        <TableCell className="font-medium">{product.productName}</TableCell>
                        <TableCell>{(product as any).categoryName || categoryMap.get(product.categoryId) || 'N/A'}</TableCell>
                        <TableCell className="hidden xl:table-cell max-w-[250px] truncate">{product.description}</TableCell>
                        <TableCell>Rs. {product.pricePerUnit.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">Rs. {product.pricePerUnitPurchased.toFixed(2)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{product.sku}</TableCell>
                        <TableCell>{product.stockQuantity}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center h-24">
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

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              &quot;{selectedProduct?.productName}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90" disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
