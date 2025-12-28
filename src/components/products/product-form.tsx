
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters.'),
  description: z.string().min(5, 'Description must be at least 5 characters.'),
  pricePerUnit: z.coerce.number().min(0, 'Selling price must be a positive number.'),
  pricePerUnitPurchased: z.coerce.number().min(0, 'Purchase price must be a positive number.'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock quantity must be a whole number.'),
  reorderLevel: z.coerce.number().int().min(0, 'Reorder level must be a whole number.'),
  sku: z.string().min(1, 'SKU is required.'),
  categoryId: z.coerce.number().int().min(1, 'Category is required.'),
  supplierId: z.coerce.number().int().min(1, 'Supplier ID is required.'),
});

type CategoryDropdownItem = {
  id: number;
  name: string;
};

type ProductFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  product?: Product | null;
  loading: boolean;
};

export default function ProductForm({
  isOpen,
  setIsOpen,
  onSubmit,
  product,
  loading,
}: ProductFormProps) {
  const [categories, setCategories] = React.useState<CategoryDropdownItem[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      description: '',
      pricePerUnit: 0,
      pricePerUnitPurchased: 0,
      stockQuantity: 0,
      reorderLevel: 0,
      sku: '',
      categoryId: 0,
      supplierId: 0,
    },
  });

  React.useEffect(() => {
    async function fetchCategories() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'Your session has expired. Please log in again.' });
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Category/Categorydropdown`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch categories. The server might be unavailable.');
        const data = await response.json();
        setCategories(data);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not load categories.' });
      }
    }

    if (isOpen) {
      fetchCategories();
      form.reset({
        productName: product?.productName || '',
        description: product?.description || '',
        pricePerUnit: product?.pricePerUnit || 0,
        pricePerUnitPurchased: product?.pricePerUnitPurchased || 0,
        stockQuantity: product?.stockQuantity || 0,
        reorderLevel: product?.reorderLevel || 0,
        sku: product?.sku || '',
        categoryId: product?.categoryId || 0,
        supplierId: product?.supplierId || 0,
      });
    }
  }, [product, form, isOpen, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Premium Rice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., RICE001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of the product." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="pricePerUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price Per Unit</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricePerUnitPurchased"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price Per Unit</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 80" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Level</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    defaultValue={field.value > 0 ? String(field.value) : undefined}
                    value={field.value > 0 ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier ID</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="md:col-span-2 mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? 'Save Changes' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
