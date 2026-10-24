'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserCheck, Plus, Edit, Shield, KeyRound, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { User } from '@/types/auth';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(API_ENDPOINTS.USERS.LIST);
      const list = Array.isArray(res) ? res : res?.data || [];
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to deactivate this staff account?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Deactivation failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff &amp; Operator Accounts"
        subtitle="Manage warehouse cashiers, inventory clerks, and administrative permissions"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]}
        actions={
          <Link href="/admin/users/create">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Add User
            </Button>
          </Link>
        }
      />

      <Card>
        <DataTable
          columns={[
            {
              header: 'Staff Member',
              render: (u: User) => (
                <div>
                  <h5 className="font-bold text-white text-xs">{u.name}</h5>
                  <span className="text-[11px] text-gray-400 font-mono">@{u.username || u.email}</span>
                </div>
              ),
            },
            {
              header: 'Assigned Role',
              render: (u: User) => (
                <Badge variant="info">
                  {(u.role || (u.roles && u.roles[0]) || 'Staff').toUpperCase()}
                </Badge>
              ),
            },
            {
              header: 'Two-Factor (2FA)',
              render: (u: User) => (
                <Badge variant={u.two_factor_enabled ? 'success' : 'secondary'}>
                  {u.two_factor_enabled ? 'ENABLED' : 'DISABLED'}
                </Badge>
              ),
            },
            {
              header: 'Status',
              render: (u: User) => (
                <Badge variant={u.is_active !== false ? 'success' : 'danger'}>
                  {u.is_active !== false ? 'ACTIVE' : 'SUSPENDED'}
                </Badge>
              ),
            },
            {
              header: 'Created',
              render: (u: User) => (
                <span className="text-xs text-gray-400">
                  {u.created_at ? formatDate(u.created_at) : '—'}
                </span>
              ),
            },
            {
              header: 'Actions',
              render: (u: User) => (
                <div className="flex items-center gap-1.5">
                  <Link href={`/admin/users/${u.id}/edit`}>
                    <button
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-white/5"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(u.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                    title="Deactivate Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={users}
          keyExtractor={(u) => u.id}
          loading={loading}
          emptyMessage="No staff accounts registered."
        />
      </Card>
    </div>
  );
}
