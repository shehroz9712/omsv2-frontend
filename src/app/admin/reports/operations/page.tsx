'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, Zap } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';

export default function OperationsReportPage() {
  const [data, setData] = useState<any>({
    cashier_stats: [],
    average_fulfillment_minutes: 0,
    total_transactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.REPORTS.OPERATIONS);
        setData(res?.data || res);
      } catch (err) {
        console.error('Failed to load operations report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fulfillment &amp; Cashier Operations Report"
        subtitle="Operator sales productivity, checkout speed, and fulfillment velocity"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Reports' },
          { label: 'Operations' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Transactions"
          value={(data.total_transactions || 0).toLocaleString()}
          subtitle="Processed at all terminals"
          color="blue"
        />

        <StatCard
          title="Average Checkout Velocity"
          value={`${data.average_fulfillment_minutes || 2.4} min`}
          subtitle="Order completion speed"
          color="emerald"
          icon={<Clock className="w-5 h-5 text-emerald-400" />}
        />

        <StatCard
          title="Active Operators"
          value={(data.cashier_stats?.length || 0).toString()}
          subtitle="Staff on shifts"
          color="indigo"
          icon={<User className="w-5 h-5 text-indigo-400" />}
        />
      </div>

      <Card title="Cashier Operator Performance">
        <DataTable
          columns={[
            {
              header: 'Cashier / Operator',
              render: (row: any) => (
                <span className="font-bold text-white text-xs">{row.name || row.username}</span>
              ),
            },
            {
              header: 'Orders Processed',
              render: (row: any) => (
                <span className="font-mono text-xs font-semibold text-white">
                  {row.orders_count || 0}
                </span>
              ),
            },
            {
              header: 'Revenue Generated',
              render: (row: any) => (
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {formatCurrency(row.total_sales || 0)}
                </span>
              ),
            },
            {
              header: 'Discounts Granted',
              render: (row: any) => (
                <span className="font-mono text-xs text-rose-400">
                  {formatCurrency(row.total_discounts || 0)}
                </span>
              ),
            },
          ]}
          data={data.cashier_stats || []}
          keyExtractor={(row, idx) => row.id || idx.toString()}
          loading={loading}
          emptyMessage="No operator performance statistics available."
        />
      </Card>
    </div>
  );
}
