'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Conflict } from '@/types/models';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(API_ENDPOINTS.CONFLICTS.LIST);
      const list = Array.isArray(res) ? res : res?.data || [];
      setConflicts(list);
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const handleResolve = async (id: string | number, resolution: 'accept' | 'reject' | 'partial') => {
    try {
      await apiClient.post(API_ENDPOINTS.CONFLICTS.RESOLVE(id), { resolution });
      setConflicts((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to resolve conflict');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offline Stock Conflict Queue"
        subtitle="Resolve inventory overdraft conflicts caused by concurrent offline transactions"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Conflicts' }]}
      />

      <Card>
        <DataTable
          columns={[
            {
              header: 'Conflict ID',
              render: (c: Conflict) => (
                <span className="font-mono font-bold text-amber-400">#{c.id}</span>
              ),
            },
            {
              header: 'Order #',
              render: (c: Conflict) => (
                <Link
                  href={`/admin/orders/${c.order_id}`}
                  className="font-mono font-bold text-blue-400 hover:text-blue-300"
                >
                  #{c.order?.order_number || `ORD-${c.order_id}`}
                </Link>
              ),
            },
            {
              header: 'Product Item',
              render: (c: Conflict) => (
                <span className="font-semibold text-white">
                  {c.product?.name || `Product #${c.product_id}`}
                </span>
              ),
            },
            {
              header: 'Requested Qty',
              render: (c: Conflict) => (
                <span className="font-mono font-bold text-rose-400">{c.requested_quantity}</span>
              ),
            },
            {
              header: 'Available Stock',
              render: (c: Conflict) => (
                <span className="font-mono font-bold text-emerald-400">{c.available_stock}</span>
              ),
            },
            {
              header: 'Recorded At',
              render: (c: Conflict) => (
                <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
              ),
            },
            {
              header: 'Resolution Options',
              render: (c: Conflict) => (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleResolve(c.id, 'accept')}
                    title="Allow negative stock overdraft"
                  >
                    Accept Overdraft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(c.id, 'partial')}
                    title="Allocate available units"
                  >
                    Partial
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleResolve(c.id, 'reject')}
                    title="Reject line item"
                  >
                    Reject
                  </Button>
                </div>
              ),
            },
          ]}
          data={conflicts}
          keyExtractor={(c) => c.id}
          loading={loading}
          emptyMessage="No pending inventory sync conflicts in the queue."
        />
      </Card>
    </div>
  );
}
