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
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Customer } from '@/lib/types';
import CustomerForm from './customer-form';
import { z } from 'zod';

const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/Customers`;

const customerFormSchema = z.object({
  customerName: z.string().min(2),
  phoneNumber: z.string().min(10),
  email: z.string().email(),
  address: z.string().min(5),
});

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  const getAuthHeaders = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to manage customers. Please log in again.',
      });
      return null;
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [toast]);

  const fetchCustomers = useCallback(async (retries = 3) => {
    const headers = getAuthHeaders();
    if (!headers) {
      if (retries > 0) {
        setTimeout(() => fetchCustomers(retries - 1), 500);
      } else {
        setLoading(false);
      }
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(apiBaseUrl, { headers });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Failed to fetch customers. The server might be down or experiencing issues.');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Fetching Customers',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, getAuthHeaders]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteAlertOpen(true);
  };

  const handleFormSubmit = async (values: z.infer<typeof customerFormSchema>) => {
    setFormLoading(true);
    const headers = getAuthHeaders();
    if (!headers) {
        setFormLoading(false);
        return;
    }

    const isEditing = !!selectedCustomer;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiBaseUrl}/${selectedCustomer.id}` : apiBaseUrl;
    
    const body = JSON.stringify(isEditing ? { id: selectedCustomer.id, ...values } : values);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Server error: Failed to ${isEditing ? 'update' : 'create'} customer.`);
      }
      
      toast({
        title: 'Success',
        description: `Customer successfully ${isEditing ? 'updated' : 'created'}.`,
      });

      setIsFormOpen(false);
      fetchCustomers(); // Refresh list
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
    if (!selectedCustomer) return;
    setFormLoading(true);

    const headers = getAuthHeaders();
    if (!headers) {
        setFormLoading(false);
        return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/${selectedCustomer.id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete customer');
      }

      toast({
        title: 'Success',
        description: 'Customer successfully deleted.',
      });

      setIsDeleteAlertOpen(false);
      fetchCustomers(); // Refresh list
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

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Customer Management</h1>
        <Button onClick={handleAddClick} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>A list of all your customers.</CardDescription>
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
                    <TableHead className="w-[80px] hidden sm:table-cell">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Address</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length > 0 ? customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="hidden sm:table-cell">{customer.id}</TableCell>
                      <TableCell className="font-medium">{customer.customerName}</TableCell>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[200px] truncate">{customer.address}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(customer)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(customer)} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        customer={selectedCustomer}
        loading={formLoading}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              &quot;{selectedCustomer?.customerName}&quot;.
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
