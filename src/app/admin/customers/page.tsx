'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, Edit, BookOpen, GitMerge, Phone, MapPin } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Customer } from '@/types/models';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let query = `?limit=100`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res: any = await apiClient.get(`${API_ENDPOINTS.CUSTOMERS.LIST}${query}`);
      const list = Array.isArray(res) ? res : res?.data || [];
      setCustomers(list);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory"
        subtitle="Manage client accounts, credit limits, account balances, and ledger history"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Customers' }]}
        actions={
          <div className="flex gap-2">
            <Link href="/admin/customers/merge">
              <Button variant="outline" size="sm" icon={<GitMerge className="w-4 h-4 text-purple-400" />}>
                Merge Duplicates
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <div className="p-4 border-b border-[#26334d]">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={fetchCustomers}
            placeholder="Search customers by name, phone, or area..."
          />
        </div>

        <DataTable
          columns={[
            {
              header: 'Customer',
              render: (c: Customer) => (
                <div>
                  <Link
                    href={`/admin/customers/${c.id}/ledger`}
                    className="font-bold text-white hover:text-blue-400"
                  >
                    {c.name}
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                    {c.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-500" />
                        {c.phone}
                      </span>
                    )}
                    {c.area && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        {c.area}
                      </span>
                    )}
                  </div>
                </div>
              ),
            },
            {
              header: 'Balance Due',
              render: (c: Customer) => {
                const bal = c.balance || 0;
                return (
                  <span
                    className={`font-mono font-bold text-sm ${
                      bal > 0 ? 'text-rose-400' : bal < 0 ? 'text-emerald-400' : 'text-gray-400'
                    }`}
                  >
                    {formatCurrency(bal)}
                  </span>
                );
              },
            },
            {
              header: 'Credit Limit',
              render: (c: Customer) => (
                <span className="text-xs text-gray-300 font-mono">
                  {c.credit_limit ? formatCurrency(c.credit_limit) : 'No limit'}
                </span>
              ),
            },
            {
              header: 'Status',
              render: (c: Customer) => {
                const isOverdue = (c.balance || 0) > (c.credit_limit || 0) && (c.credit_limit || 0) > 0;
                return (
                  <Badge variant={isOverdue ? 'danger' : 'success'}>
                    {isOverdue ? 'Credit Exceeded' : 'Active'}
                  </Badge>
                );
              },
            },
            {
              header: 'Actions',
              render: (c: Customer) => (
                <div className="flex items-center gap-1.5">
                  <Link href={`/admin/customers/${c.id}/ledger`}>
                    <button
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-emerald-400 rounded-lg hover:bg-white/5"
                      title="Financial Ledger"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link href={`/admin/customers/${c.id}/edit`}>
                    <button
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-white/5"
                      title="Edit Customer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              ),
            },
          ]}
          data={customers}
          keyExtractor={(c) => c.id}
          loading={loading}
          emptyMessage="No customers registered yet."
        />
      </Card>
    </div>
  );
}
