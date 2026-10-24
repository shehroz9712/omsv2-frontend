'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Order } from '@/types/models';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';

export default function OrderReviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(API_ENDPOINTS.ORDERS.REVIEW_QUEUE);
      const list = Array.isArray(res) ? res : res?.data || [];
      setOrders(list);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const handleApprove = async (id: string | number) => {
    try {
      await apiClient.post(API_ENDPOINTS.ORDERS.APPROVE(id));
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to approve order');
    }
  };

  const handleReject = async (id: string | number) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await apiClient.post(API_ENDPOINTS.ORDERS.REJECT(id), { reason });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reject order');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Review Queue"
        subtitle="Approve or reject large-volume orders and credit limit overdrafts"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Orders', href: '/admin/orders' },
          { label: 'Review Queue' },
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
              header: 'Total Value',
              render: (order: Order) => (
                <span className="font-bold text-emerald-400 font-mono">
                  {formatCurrency(order.total)}
                </span>
              ),
            },
            {
              header: 'Reason',
              render: () => (
                <Badge variant="warning">Requires Supervisor Approval</Badge>
              ),
            },
            {
              header: 'Submitted',
              render: (order: Order) => (
                <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
              ),
            },
            {
              header: 'Actions',
              render: (order: Order) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(order.id)}
                    icon={<CheckCircle className="w-3.5 h-3.5" />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(order.id)}
                    icon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Reject
                  </Button>
                </div>
              ),
            },
          ]}
          data={orders}
          keyExtractor={(order) => order.id}
          loading={loading}
          emptyMessage="No pending orders in the review queue."
        />
      </Card>
    </div>
  );
}
