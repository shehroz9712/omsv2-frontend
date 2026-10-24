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
import { PermissionMatrix } from '@/components/shared/PermissionMatrix';

const ALL_AVAILABLE_PERMISSIONS = [
  'orders.view', 'orders.create', 'orders.edit', 'orders.delete', 'orders.approve',
  'products.view', 'products.create', 'products.edit', 'products.delete',
  'inventory.view', 'inventory.adjust',
  'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
  'reports.sales', 'reports.financial', 'reports.closing',
  'settings.view', 'settings.edit',
  'users.manage', 'devices.manage',
];

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchRole = async () => {
      try {
        const r: any = await apiClient.get(API_ENDPOINTS.ROLES.SHOW(id));
        if (r) {
          setName(r.name || '');
          setDescription(r.description || '');
          setSelectedPermissions(r.permissions || []);
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load role');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await apiClient.put(API_ENDPOINTS.ROLES.UPDATE(id), {
        name: name.trim(),
        description: description.trim() || null,
        permissions: selectedPermissions,
      });

      router.push('/admin/roles');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update role');
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
        title={`Edit Role: ${name}`}
        subtitle="Update assigned permissions and privilege matrix"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Roles', href: '/admin/roles' },
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Role Name" htmlFor="name" required>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormField>

            <FormField label="Description" htmlFor="description">
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormField>
          </div>

          <div className="pt-4 border-t border-[#26334d]">
            <h4 className="text-sm font-bold text-white mb-3">Module Permissions</h4>
            <PermissionMatrix
              availablePermissions={ALL_AVAILABLE_PERMISSIONS}
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#26334d]">
            <Link href="/admin/roles">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<Save className="w-4 h-4" />}
            >
              Update Role
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
