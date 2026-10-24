'use client';

import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Layers } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatCurrency, formatQuantity } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';

export default function InventoryValuationReportPage() {
  const [data, setData] = useState<any>({
    total_cost_valuation: 0,
    total_retail_valuation: 0,
    potential_profit: 0,
    total_skus: 0,
    items: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValuation = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.REPORTS.INVENTORY);
        setData(res?.data || res);
      } catch (err) {
        console.error('Failed to load inventory valuation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchValuation();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Valuation &amp; Asset Report"
        subtitle="Current warehouse stock asset value, cost basis, and retail liquidation potential"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Reports' },
          { label: 'Inventory Valuation' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cost Valuation"
          value={formatCurrency(data.total_cost_valuation || 0)}
          subtitle="Capital invested in stock"
          color="blue"
        />

        <StatCard
          title="Retail Sales Valuation"
          value={formatCurrency(data.total_retail_valuation || 0)}
          subtitle="Gross expected retail value"
          color="emerald"
        />

        <StatCard
          title="Expected Unrealized Profit"
          value={formatCurrency(data.potential_profit || 0)}
          subtitle="Valuation spread"
          color="indigo"
        />

        <StatCard
          title="Active Catalog SKUs"
          value={(data.total_skus || data.items?.length || 0).toLocaleString()}
          subtitle="Inventory lines"
          color="amber"
          icon={<Package className="w-5 h-5 text-amber-400" />}
        />
      </div>

      <Card title="Valuation by Product Item">
        <DataTable
          columns={[
            {
              header: 'Product',
              render: (row: any) => (
                <div>
                  <h5 className="font-bold text-white text-xs">{row.name}</h5>
                  <span className="text-[11px] text-gray-400 font-mono">SKU: {row.sku || 'N/A'}</span>
                </div>
              ),
            },
            {
              header: 'In Stock',
              render: (row: any) => (
                <span className="font-mono text-xs font-bold text-white">
                  {formatQuantity(row.stock || 0)} {row.unit || 'units'}
                </span>
              ),
            },
            {
              header: 'Cost Basis',
              render: (row: any) => (
                <span className="font-mono text-xs text-rose-400 font-semibold">
                  {formatCurrency((row.cost || 0) * (row.stock || 0))}
                </span>
              ),
            },
            {
              header: 'Retail Valuation',
              render: (row: any) => (
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {formatCurrency((row.price || 0) * (row.stock || 0))}
                </span>
              ),
            },
          ]}
          data={data.items || []}
          keyExtractor={(row, idx) => row.id || idx.toString()}
          loading={loading}
          emptyMessage="No inventory items to value."
        />
      </Card>
    </div>
  );
}
