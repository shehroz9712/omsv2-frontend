'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserCheck, Eye, Truck } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Order } from '@/types/models';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';

export default function UnassignedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnassigned = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(API_ENDPOINTS.ORDERS.UNASSIGNED);
      const list = Array.isArray(res) ? res : res?.data || [];
      setOrders(list);
    } catch (err) {
      console.error('Failed to load unassigned orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnassigned();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unassigned Sales Orders"
        subtitle="Orders awaiting dispatch assignment to field sales or delivery drivers"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Orders', href: '/admin/orders' },
          { label: 'Unassigned' },
        ]}
        actions={
          <Link href="/admin/orders">
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Orders
            </Button>
          </Link>
        }
      />

      <Card>
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
                  {order.customer?.name || order.customer_name_snapshot || 'Walk-in'}
                </span>
              ),
            },
            {
              header: 'Order Total',
              render: (order: Order) => (
                <span className="font-bold text-emerald-400 font-mono">
                  {formatCurrency(order.total)}
                </span>
              ),
            },
            {
              header: 'Items Count',
              render: (order: Order) => (
                <span className="text-gray-400 text-xs">{order.items?.length || 0} items</span>
              ),
            },
            {
              header: 'Created At',
              render: (order: Order) => (
                <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
              ),
            },
            {
              header: 'Action',
              render: (order: Order) => (
                <Link href={`/admin/orders/${order.id}`}>
                  <Button variant="primary" size="sm" icon={<Truck className="w-3.5 h-3.5" />}>
                    Assign Driver
                  </Button>
                </Link>
              ),
            },
          ]}
          data={orders}
          keyExtractor={(order) => order.id}
          loading={loading}
          emptyMessage="All active orders have been assigned to delivery personnel."
        />
      </Card>
    </div>
  );
}
