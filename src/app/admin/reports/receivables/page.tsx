'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';

export default function ReceivablesReportPage() {
  const [data, setData] = useState<any>({
    total_outstanding: 0,
    debtors_count: 0,
    items: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceivables = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.REPORTS.RECEIVABLES);
        setData(res?.data || res);
      } catch (err) {
        console.error('Failed to load receivables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceivables();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts Receivable &amp; Debtor Aging"
        subtitle="Track outstanding customer credit balances, aged receivables, and debt exposure"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Reports' },
          { label: 'Receivables' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Outstanding Debt"
          value={formatCurrency(data.total_outstanding || 0)}
          subtitle="Receivables owed across all clients"
          color="rose"
          icon={<DollarSign className="w-5 h-5 text-rose-400" />}
        />

        <StatCard
          title="Clients with Overdue Balance"
          value={(data.debtors_count || data.items?.length || 0).toLocaleString()}
          subtitle="Active debtor accounts"
          color="amber"
          icon={<Users className="w-5 h-5 text-amber-400" />}
        />

        <StatCard
          title="Average Debt per Client"
          value={formatCurrency(
            (data.debtors_count || 0) > 0 ? (data.total_outstanding || 0) / data.debtors_count : 0
          )}
          subtitle="Mean balance exposure"
          color="indigo"
        />
      </div>

      <Card title="Debtor Customer Balances">
        <DataTable
          columns={[
            {
              header: 'Customer',
              render: (row: any) => (
                <div>
                  <Link
                    href={`/admin/customers/${row.id}/ledger`}
                    className="font-bold text-white hover:text-blue-400 text-xs"
                  >
                    {row.name}
                  </Link>
                  <p className="text-[11px] text-gray-400">{row.phone || 'No phone'}</p>
                </div>
              ),
            },
            {
              header: 'Area / Location',
              render: (row: any) => (
                <span className="text-xs text-gray-300">{row.area || '—'}</span>
              ),
            },
            {
              header: 'Credit Limit',
              render: (row: any) => (
                <span className="font-mono text-xs text-gray-300">
                  {row.credit_limit ? formatCurrency(row.credit_limit) : 'No limit'}
                </span>
              ),
            },
            {
              header: 'Total Balance Due',
              render: (row: any) => (
                <span className="font-mono text-xs font-bold text-rose-400">
                  {formatCurrency(row.balance || 0)}
                </span>
              ),
            },
            {
              header: 'Action',
              render: (row: any) => (
                <Link
                  href={`/admin/customers/${row.id}/ledger`}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  View Ledger &rarr;
                </Link>
              ),
            },
          ]}
          data={data.items || []}
          keyExtractor={(row, idx) => row.id || idx.toString()}
          loading={loading}
          emptyMessage="No customer debts recorded. All accounts in good standing."
        />
      </Card>
    </div>
  );
}
