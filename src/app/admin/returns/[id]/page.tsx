'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Package, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Return } from '@/types/models';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DefinitionList } from '@/components/ui/DefinitionList';

export default function ReturnDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [returnItem, setReturnItem] = useState<Return | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchReturn = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.RETURNS.SHOW(id));
        setReturnItem(res?.data || res);
      } catch (err) {
        console.error('Failed to load return details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturn();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!returnItem) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Return record not found.</p>
        <Link href="/admin/returns">
          <Button variant="secondary" className="mt-4">Back to Returns</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Return #${returnItem.return_number || String(returnItem.id).substring(0, 8)}`}
        subtitle={`Recorded on ${formatDate(returnItem.created_at)}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Returns', href: '/admin/returns' },
          { label: `#${String(returnItem.id).substring(0, 8)}` },
        ]}
        actions={
          <Link href="/admin/returns">
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Returns
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Restocked Items">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-200">
                <thead className="bg-[#1f2937] text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Quantity Returned</th>
                    <th className="px-4 py-3 text-right">Refund Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {returnItem.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-semibold text-white">
                        {item.product?.name || `Product #${item.product_id}`}
                      </td>
                      <td className="px-4 py-3 font-bold text-rose-400">
                        {item.quantity} units
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-gray-300">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Return Information">
            <DefinitionList
              items={[
                {
                  label: 'Original Order',
                  value: (
                    <Link
                      href={`/admin/orders/${returnItem.order_id}`}
                      className="font-mono text-blue-400 hover:text-blue-300 font-bold"
                    >
                      View Order #{String(returnItem.order_id).substring(0, 8)}
                    </Link>
                  ),
                },
                {
                  label: 'Return Reason',
                  value: (
                    <Badge variant="warning">
                      {returnItem.reason?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  label: 'Total Refund',
                  value: (
                    <span className="font-mono font-bold text-rose-400">
                      {formatCurrency(returnItem.refund_amount || 0)}
                    </span>
                  ),
                },
                {
                  label: 'Notes / Remarks',
                  value: returnItem.notes || '—',
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
