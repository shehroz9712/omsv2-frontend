'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Eye, Printer, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Order } from '@/types/models';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = `?limit=100`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;

      const res: any = await apiClient.get(`${API_ENDPOINTS.ORDERS.LIST}${query}`);
      const list = Array.isArray(res) ? res : res?.data || [];
      setOrders(list);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle="Manage sales transactions, order statuses, payments, and invoices"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Orders' }]}
        actions={
          <div className="flex gap-2">
            <Link href="/admin/orders/review">
              <Button variant="outline" size="sm">
                Review Queue
              </Button>
            </Link>
            <Link href="/admin/orders/unassigned">
              <Button variant="secondary" size="sm">
                Unassigned Orders
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
            onSearchSubmit={fetchOrders}
            placeholder="Search by order number or customer..."
          >
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#1f2937] border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </FilterBar>
        </div>

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
                <span className="font-semibold text-white">
                  {order.customer?.name || order.customer_name_snapshot || 'Walk-in Customer'}
                </span>
              ),
            },
            {
              header: 'Items',
              render: (order: Order) => (
                <span className="text-gray-400 text-xs">
                  {order.items?.length || 0} items
                </span>
              ),
            },
            {
              header: 'Total',
              render: (order: Order) => (
                <span className="font-bold text-emerald-400 font-mono">
                  {formatCurrency(order.total)}
                </span>
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
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(order.created_at)}
                </span>
              ),
            },
            {
              header: 'Actions',
              render: (order: Order) => (
                <div className="flex items-center gap-1.5">
                  <Link href={`/admin/orders/${order.id}`}>
                    <button
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-white/5"
                      title="View Order Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </Link>
                  <a
                    href={API_ENDPOINTS.POS.INVOICE(order.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-gray-400 hover:text-emerald-400 rounded-lg hover:bg-white/5"
                    title="Print Invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </a>
                </div>
              ),
            },
          ]}
          data={orders}
          keyExtractor={(order) => order.id}
          loading={loading}
          emptyMessage="No sales orders found."
        />
      </Card>
    </div>
  );
}
