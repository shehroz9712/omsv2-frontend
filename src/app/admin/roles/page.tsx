'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Plus, Edit, Trash2, Key } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';

interface RoleItem {
  id: string;
  name: string;
  description?: string;
  permissions_count?: number;
  users_count?: number;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(API_ENDPOINTS.ROLES.LIST);
      const list = Array.isArray(res) ? res : res?.data || [];
      setRoles(list);
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this custom role?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.ROLES.DELETE(id));
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete role');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles &amp; Permission Schemes"
        subtitle="Define granular access rights, discount limits, and sensitive action authorizations"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Roles' }]}
        actions={
          <Link href="/admin/roles/create">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Create Role
            </Button>
          </Link>
        }
      />

      <Card>
        <DataTable
          columns={[
            {
              header: 'Role Name',
              render: (r: RoleItem) => (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">{r.name}</h5>
                    <p className="text-[11px] text-gray-400">{r.description || 'System access role'}</p>
                  </div>
                </div>
              ),
            },
            {
              header: 'Permissions',
              render: (r: RoleItem) => (
                <Badge variant="info">{r.permissions_count || 'Custom'} Rights</Badge>
              ),
            },
            {
              header: 'Active Users',
              render: (r: RoleItem) => (
                <span className="text-gray-300 text-xs font-semibold">
                  {r.users_count || 0} operators
                </span>
              ),
            },
            {
              header: 'Actions',
              render: (r: RoleItem) => (
                <div className="flex items-center gap-1.5">
                  <Link href={`/admin/roles/${r.id}/edit`}>
                    <button
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-white/5"
                      title="Edit Permissions"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={roles}
          keyExtractor={(r) => r.id}
          loading={loading}
          emptyMessage="No custom roles configured."
        />
      </Card>
    </div>
  );
}
