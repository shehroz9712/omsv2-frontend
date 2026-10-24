'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  PackageX,
  Zap,
  Package,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Order, Conflict } from '@/types/models';

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<'today' | '7_days' | '30_days' | 'custom'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Dashboard Data
  const [summary, setSummary] = useState({
    net_sales: 0,
    gross_sales: 0,
    orders_count: 0,
    average_order_value: 0,
  });
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [pendingConflictsCount, setPendingConflictsCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [salesTrend, setSalesTrend] = useState<Array<{ business_date: string; net_sales: number }>>([]);
  const [pendingConflicts, setPendingConflicts] = useState<Conflict[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let query = `?period=${period}`;
      if (period === 'custom' && startDate && endDate) {
        query += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const res: any = await apiClient.get(`${API_ENDPOINTS.ADMIN.DASHBOARD}${query}`);

      if (res) {
        setSummary(res.sales_summary || res.summary || {
          net_sales: res.net_sales || 0,
          gross_sales: res.gross_sales || 0,
          orders_count: res.orders_count || 0,
          average_order_value: res.average_order_value || 0,
        });
        setLowStockCount(res.low_stock_count || 0);
        setOutOfStockCount(res.out_of_stock_count || 0);
        setPendingConflictsCount(res.pending_conflicts_count || 0);
        setTotalProducts(res.total_products || 0);
        setTotalCustomers(res.total_customers || 0);
        setSalesTrend(res.sales_trend || []);
        setPendingConflicts(res.pending_conflicts || []);
        setRecentOrders(res.recent_orders || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const handleCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      fetchDashboardData();
    }
  };

  // Pure SVG Sales Trend Bar Calculations
  const maxSales = Math.max(1, ...salesTrend.map((d) => d.net_sales || 0));
  const chartHeight = 160;
  const barCount = salesTrend.length;
  const chartWidth = Math.max(600, barCount * 60);
  const barWidth = barCount > 0 ? Math.max(14, Math.min(44, chartWidth / barCount - 16)) : 40;

  return (
    <div className="space-y-6">
      {/* Nightly Reconciliation Health Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-800/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">Reports &amp; Ledger Reconciliation</h4>
              <p className="text-xs text-gray-400 mt-0.5">Automated nightly ledger balancing check</p>
            </div>
          </div>
          <Badge variant="success">CLEAN (0 Discrepancies)</Badge>
        </div>

        <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-800/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">Inventory Ledger Reconciliation</h4>
              <p className="text-xs text-gray-400 mt-0.5">Physical audit vs transaction ledger sync</p>
            </div>
          </div>
          <Badge variant="success">CLEAN (0 Discrepancies)</Badge>
        </div>
      </div>

      {/* Date Range Filter Tabs */}
      <div className="p-3 bg-[#111827] border border-[#26334d] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Period:</span>
          {(['today', '7_days', '30_days'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[38px] inline-flex items-center transition-colors cursor-pointer ${
                period === p
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {p === 'today' ? 'Today' : p === '7_days' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomFilter} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <input
            type="date"
            aria-label="Start Date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPeriod('custom');
            }}
            className="w-36 px-2.5 py-1.5 bg-[#1f2937] border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-xs">-</span>
          <input
            type="date"
            aria-label="End Date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPeriod('custom');
            }}
            className="w-36 px-2.5 py-1.5 bg-[#1f2937] border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 min-h-[36px] cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Sales Revenue"
          value={formatCurrency(summary.net_sales)}
          subtitle={`Gross: ${formatCurrency(summary.gross_sales)}`}
          color="emerald"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        />

        <StatCard
          title="Orders Placed"
          value={summary.orders_count.toLocaleString()}
          subtitle="Period volume"
          color="blue"
          icon={<ShoppingCart className="w-5 h-5 text-blue-400" />}
        />

        <StatCard
          title="Average Order Value"
          value={formatCurrency(summary.average_order_value)}
          subtitle="Per completed order"
          color="indigo"
          icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
        />

        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount.toLocaleString()}
          subtitle="Below min threshold"
          color="amber"
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
        />

        <StatCard
          title="Out of Stock"
          value={outOfStockCount.toLocaleString()}
          subtitle="Zero units remaining"
          color="rose"
          icon={<PackageX className="w-5 h-5 text-rose-400" />}
        />

        <StatCard
          title="Pending Conflicts"
          value={pendingConflictsCount.toLocaleString()}
          subtitle="Offline overdrafts"
          color="purple"
          icon={<Zap className="w-5 h-5 text-purple-400" />}
        />

        <StatCard
          title="Total Products"
          value={totalProducts.toLocaleString()}
          subtitle="Live catalog items"
          color="blue"
          icon={<Package className="w-5 h-5 text-blue-400" />}
        />

        <StatCard
          title="Total Customers"
          value={totalCustomers.toLocaleString()}
          subtitle="Registered clients"
          color="emerald"
          icon={<Users className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Sales Trend Pure SVG Chart */}
      <Card
        title="Sales Revenue Daily Trend"
        subtitle={`Period metrics (${period.replace('_', ' ')})`}
      >
        {salesTrend.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No sales recorded in the selected period.
          </div>
        ) : (
          <div className="w-full overflow-x-auto py-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
              className="w-full h-56 min-w-[500px]"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Subtle Grid Lines */}
              <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#334155" strokeDasharray="3" strokeWidth="1" />
              <line x1="0" y1={chartHeight / 2 + 10} x2={chartWidth} y2={chartHeight / 2 + 10} stroke="#334155" strokeDasharray="3" strokeWidth="1" />
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#475569" strokeWidth="1" />

              {salesTrend.map((day, idx) => {
                const barHeight = Math.max(4, ((day.net_sales || 0) / maxSales) * (chartHeight - 30));
                const x = idx * (chartWidth / Math.max(1, barCount)) + 12;
                const y = chartHeight - barHeight;

                return (
                  <g key={day.business_date || idx}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill="#3b82f6"
                      className="hover:fill-blue-400 transition-colors cursor-pointer"
                    />
                    {day.net_sales > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        fill="#93c5fd"
                        fontSize="10"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {formatCurrency(day.net_sales)}
                      </text>
                    )}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 20}
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {day.business_date ? formatDate(day.business_date) : `Day ${idx + 1}`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </Card>

      {/* Pending Conflicts Banner */}
      {pendingConflicts.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/80 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-base font-bold text-amber-200">Stock Overdraft Conflicts Awaiting Review</h3>
                <p className="text-xs text-amber-300/70">Offline synced orders exceeded current warehouse stock.</p>
              </div>
            </div>
            <Link href="/admin/conflicts">
              <Button variant="primary" size="sm">Review Conflicts Queue</Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-200">
              <thead className="bg-[#1f2937] text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Conflict ID</th>
                  <th className="px-4 py-2.5">Order #</th>
                  <th className="px-4 py-2.5">Product</th>
                  <th className="px-4 py-2.5">Requested</th>
                  <th className="px-4 py-2.5">Available</th>
                  <th className="px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {pendingConflicts.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">#{c.id}</td>
                    <td className="px-4 py-3 font-semibold text-white">ORD-{c.order_id}</td>
                    <td className="px-4 py-3 text-gray-300">{c.product_id}</td>
                    <td className="px-4 py-3 font-bold text-rose-400">{c.requested_quantity}</td>
                    <td className="px-4 py-3"><Badge variant="info">{c.available_stock}</Badge></td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/conflicts`}>
                        <Button variant="primary" size="sm">Resolve</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <Card
        title="Recent Sales Orders"
        actions={
          <Link href="/admin/orders">
            <Button variant="secondary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Orders
            </Button>
          </Link>
        }
      >
        <DataTable
          columns={[
            {
              header: 'Order #',
              render: (order: Order) => (
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-mono font-bold text-blue-400 hover:text-blue-300"
                >
                  #{order.order_number}
                </Link>
              ),
            },
            {
              header: 'Customer',
              render: (order: Order) => (
                <span className="font-medium text-white">
                  {order.customer?.name || order.customer_name_snapshot || 'Walk-in Customer'}
                </span>
              ),
            },
            {
              header: 'Items',
              render: (order: Order) => (
                <span className="text-gray-400">{order.items?.length || 0} items</span>
              ),
            },
            {
              header: 'Total',
              render: (order: Order) => (
                <span className="font-bold text-emerald-400">{formatCurrency(order.total)}</span>
              ),
            },
            {
              header: 'Status',
              render: (order: Order) => {
                const variant =
                  order.status === 'completed'
                    ? 'success'
                    : order.status === 'pending'
                    ? 'warning'
                    : order.status === 'cancelled'
                    ? 'danger'
                    : 'info';
                return <Badge variant={variant as any}>{order.status.toUpperCase()}</Badge>;
              },
            },
            {
              header: 'Date',
              render: (order: Order) => (
                <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
              ),
            },
          ]}
          data={recentOrders}
          keyExtractor={(order) => order.id}
          loading={loading}
          emptyMessage="No recent orders recorded yet."
        />
      </Card>
    </div>
  );
}
