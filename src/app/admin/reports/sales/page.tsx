'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Download, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';

export default function SalesReportPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(
        `${API_ENDPOINTS.REPORTS.SALES}?start_date=${startDate}&end_date=${endDate}`
      );
      const list = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
      setSalesData(list);
      setTotalSales(res?.total_sales || res?.data?.total_sales || 0);
      setTotalOrders(res?.total_orders || res?.data?.total_orders || list.length);
    } catch (err) {
      console.error('Failed to load sales report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Revenue Analytics"
        subtitle="Aggregate sales reports, average order value, and category volume breakdowns"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Reports' },
          { label: 'Sales Report' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <input
              type="date"
              aria-label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-[#1f2937] border border-gray-700 rounded-lg text-xs text-white"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="date"
              aria-label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-[#1f2937] border border-gray-700 rounded-lg text-xs text-white"
            />
            <Button variant="primary" size="sm" onClick={fetchSalesReport}>
              Filter
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Net Sales"
          value={formatCurrency(totalSales)}
          subtitle="Selected range revenue"
          color="emerald"
        />

        <StatCard
          title="Orders Completed"
          value={totalOrders.toLocaleString()}
          subtitle="Processed transactions"
          color="blue"
        />

        <StatCard
          title="Average Order Value"
          value={formatCurrency(totalOrders > 0 ? totalSales / totalOrders : 0)}
          subtitle="Revenue per transaction"
          color="indigo"
        />
      </div>

      <Card title="Daily Sales Records">
        <DataTable
          columns={[
            {
              header: 'Date',
              render: (row: any) => (
                <span className="font-mono text-xs text-gray-300">
                  {row.date ? formatDate(row.date) : '—'}
                </span>
              ),
            },
            {
              header: 'Transactions',
              render: (row: any) => (
                <span className="font-bold text-white text-xs">{row.orders_count || 1} orders</span>
              ),
            },
            {
              header: 'Gross Volume',
              render: (row: any) => (
                <span className="font-mono text-xs text-gray-300">
                  {formatCurrency(row.gross_sales || row.total || 0)}
                </span>
              ),
            },
            {
              header: 'Net Revenue',
              render: (row: any) => (
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {formatCurrency(row.net_sales || row.total || 0)}
                </span>
              ),
            },
          ]}
          data={salesData}
          keyExtractor={(row, idx) => row.date || idx.toString()}
          loading={loading}
          emptyMessage="No sales recorded within the selected date range."
        />
      </Card>
    </div>
  );
}
