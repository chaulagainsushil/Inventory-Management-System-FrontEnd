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
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type User } from '@/lib/types';
import UserForm from './user-form';
import { z } from 'zod';

const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/Auth`;

const userFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
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

  const fetchUsers = useCallback(async (retries = 3) => {
    const headers = getAuthHeaders();
    if (!headers) {
      if (retries > 0) {
        setTimeout(() => fetchUsers(retries - 1), 500);
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
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch users. Is your API server running and are you logged in?',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, getAuthHeaders]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddClick = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: z.infer<typeof userFormSchema>) => {
    setFormLoading(true);
    const headers = getAuthHeaders();
    if (!headers) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to perform this action.' });
      setFormLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/MobileUserRegister`, {
        method: 'POST',
        headers,
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${errorData || 'Failed to create user'}`);
      }

      toast({
        title: 'Success',
        description: 'User successfully created.',
      });

      setIsFormOpen(false);
      fetchUsers(); // Refresh list
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: `Could not create user. ${error.message}`,
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={handleAddClick} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users in your system.</CardDescription>
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
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-xs">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.userName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="font-normal">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UserForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />
    </>
  );
}
