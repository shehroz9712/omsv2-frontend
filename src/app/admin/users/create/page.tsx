'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

export default function CreateUserPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'cashier',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await apiClient.post(API_ENDPOINTS.USERS.CREATE, {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim() || null,
        password: formData.password,
        role: formData.role,
      });

      router.push('/admin/users');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create user account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Staff Account"
        subtitle="Provision login credentials and define operational authorization level"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: 'New User' },
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
              placeholder="e.g. Tariq Mehmood"
            />
          </FormField>

          <FormField label="Username" htmlFor="username" required>
            <Input
              id="username"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. tariq_pos"
            />
          </FormField>

          <FormField label="Email Address" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tariq@quickorder.pos"
            />
          </FormField>

          <FormField label="Password" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              required
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
              Create Account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
