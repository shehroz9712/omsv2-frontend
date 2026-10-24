'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Eye, Calendar, User, Package } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Return } from '@/types/models';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(API_ENDPOINTS.RETURNS.LIST);
      const list = Array.isArray(res) ? res : res?.data || [];
      setReturns(list);
    } catch (err) {
      console.error('Failed to load returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchandise Returns &amp; Restocking"
        subtitle="Track RMA returns, credit adjustments, and restocking entries"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Returns' }]}
      />

      <Card>
        <DataTable
          columns={[
            {
              header: 'Return #',
              render: (r: Return) => (
                <Link
                  href={`/admin/returns/${r.id}`}
                  className="font-mono font-bold text-blue-400 hover:text-blue-300"
                >
                  #{r.return_number || `RET-${String(r.id).substring(0, 8)}`}
                </Link>
              ),
            },
            {
              header: 'Order #',
              render: (r: Return) => (
                <Link
                  href={`/admin/orders/${r.order_id}`}
                  className="font-mono text-gray-300 hover:text-white"
                >
                  #{r.order?.order_number || r.order_id}
                </Link>
              ),
            },
            {
              header: 'Customer',
              render: (r: Return) => (
                <span className="font-semibold text-white">
                  {r.order?.customer?.name || 'Walk-in'}
                </span>
              ),
            },
            {
              header: 'Refund Amount',
              render: (r: Return) => (
                <span className="font-bold text-rose-400 font-mono">
                  {formatCurrency(r.refund_amount || 0)}
                </span>
              ),
            },
            {
              header: 'Reason',
              render: (r: Return) => (
                <Badge variant="warning">{r.reason?.replace('_', ' ').toUpperCase()}</Badge>
              ),
            },
            {
              header: 'Date',
              render: (r: Return) => (
                <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
              ),
            },
            {
              header: 'Actions',
              render: (r: Return) => (
                <Link href={`/admin/returns/${r.id}`}>
                  <button
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-white/5"
                    title="View Return Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
              ),
            },
          ]}
          data={returns}
          keyExtractor={(r) => r.id}
          loading={loading}
          emptyMessage="No returns recorded yet."
        />
      </Card>
    </div>
  );
}
