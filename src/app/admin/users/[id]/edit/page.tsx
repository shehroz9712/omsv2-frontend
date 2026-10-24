'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'cashier',
    password: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const u: any = await apiClient.get(API_ENDPOINTS.USERS.SHOW(id));
        if (u) {
          setFormData({
            name: u.name || '',
            username: u.username || '',
            email: u.email || '',
            role: u.role || 'cashier',
            password: '',
          });
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const payload: any = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim() || null,
        role: formData.role,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), payload);
      router.push('/admin/users');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Staff User: ${formData.name}`}
        subtitle={`Managing credentials for @${formData.username}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Edit' },
        ]}
      />

      <Card>
        {errorMessage && (
          <div className="m-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-2xl">
          <FormField label="Full Name" htmlFor="name" required>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormField>

          <FormField label="Username" htmlFor="username" required>
            <Input
              id="username"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </FormField>

          <FormField label="Email Address" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>

          <FormField label="Reset Password (leave empty to keep current)" htmlFor="password">
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
            />
          </FormField>

          <FormField label="System Role" htmlFor="role" required>
            <Select
              id="role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="cashier">POS Cashier (Sales Only)</option>
              <option value="inventory_manager">Warehouse / Inventory Manager</option>
              <option value="accountant">Financial Accountant</option>
              <option value="admin">System Administrator (Full Access)</option>
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#26334d]">
            <Link href="/admin/users">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<Save className="w-4 h-4" />}
            >
              Update Account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
