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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { type StockAlert } from '@/lib/types';

const formSchema = z.object({
  quantityToAdd: z.coerce.number().int().positive({ message: 'Quantity must be a positive number.' }),
});

type AddStockFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  alert: StockAlert | null;
  loading: boolean;
};

export default function AddStockForm({
  isOpen,
  setIsOpen,
  onSubmit,
  alert,
  loading,
}: AddStockFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantityToAdd: alert?.suggestedOrderQty || 1,
    },
  });

  React.useEffect(() => {
    if (alert) {
      form.reset({
        quantityToAdd: alert.suggestedOrderQty,
      });
    }
  }, [alert, form]);

  if (!alert) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock for {alert.productName}</DialogTitle>
          <DialogDescription>
            Current Stock: {alert.currentStock}. Suggested Order: {alert.suggestedOrderQty}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantityToAdd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Add</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter quantity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm and Add Stock
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
