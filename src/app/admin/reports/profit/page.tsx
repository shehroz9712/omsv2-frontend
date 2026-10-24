'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';

export default function ProfitReportPage() {
  const [data, setData] = useState<any>({
    revenue: 0,
    cogs: 0,
    gross_profit: 0,
    margin_percentage: 0,
    items: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfit = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.REPORTS.PROFIT);
        setData(res?.data || res);
      } catch (err) {
        console.error('Failed to load profit report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfit();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit Margin &amp; COGS Analysis"
        subtitle="Gross margins, cost of goods sold (COGS), and product profitability"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Reports' },
          { label: 'Profit Analysis' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Revenue"
          value={formatCurrency(data.revenue || 0)}
          subtitle="Topline sales"
          color="blue"
        />

        <StatCard
          title="Cost of Goods (COGS)"
          value={formatCurrency(data.cogs || 0)}
          subtitle="Inventory acquisition cost"
          color="rose"
        />

        <StatCard
          title="Gross Profit"
          value={formatCurrency(data.gross_profit || 0)}
          subtitle="Revenue minus COGS"
          color="emerald"
        />

        <StatCard
          title="Overall Margin"
          value={`${(data.margin_percentage || 0).toFixed(1)}%`}
          subtitle="Gross profit percentage"
          color="indigo"
          icon={<Percent className="w-5 h-5 text-indigo-400" />}
        />
      </div>

      <Card title="Product Profitability Breakdown">
        <DataTable
          columns={[
            {
              header: 'Product Item',
              render: (row: any) => (
                <span className="font-bold text-white text-xs">{row.name || row.product_name}</span>
              ),
            },
            {
              header: 'Units Sold',
              render: (row: any) => (
                <span className="font-mono text-xs text-gray-300">{row.units_sold || 0}</span>
              ),
            },
            {
              header: 'Revenue',
              render: (row: any) => (
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {formatCurrency(row.revenue || 0)}
                </span>
              ),
            },
            {
              header: 'Total Cost',
              render: (row: any) => (
                <span className="font-mono text-xs text-rose-400">
                  {formatCurrency(row.cost || 0)}
                </span>
              ),
            },
            {
              header: 'Margin %',
              render: (row: any) => (
                <span className="font-mono text-xs font-bold text-blue-400">
                  {(row.margin_percentage || 0).toFixed(1)}%
                </span>
              ),
            },
          ]}
          data={data.items || []}
          keyExtractor={(row, idx) => row.id || idx.toString()}
          loading={loading}
          emptyMessage="No product profit margin data recorded."
        />
      </Card>
    </div>
  );
}
