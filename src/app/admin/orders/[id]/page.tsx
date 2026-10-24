'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, RotateCcw, User, CreditCard, Calendar, CheckCircle, Package } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Order } from '@/types/models';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DefinitionList } from '@/components/ui/DefinitionList';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.ORDERS.SHOW(id));
        setOrder(res?.data || res);
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-400">
        <h3 className="text-lg font-bold text-white mb-2">Order Not Found</h3>
        <p className="text-sm mb-4">The order you requested could not be retrieved.</p>
        <Link href="/admin/orders">
          <Button variant="secondary">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${order.order_number}`}
        subtitle={`Created on ${formatDate(order.created_at)}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Orders', href: '/admin/orders' },
          { label: `#${order.order_number}` },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href={`/admin/orders/${order.id}/return`}>
              <Button variant="outline" size="sm" icon={<RotateCcw className="w-4 h-4 text-amber-400" />}>
                Process Return
              </Button>
            </Link>
            <a
              href={API_ENDPOINTS.POS.INVOICE(order.id)}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="primary" size="sm" icon={<Printer className="w-4 h-4" />}>
                Print Invoice
              </Button>
            </a>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items Table (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Order Items &amp; Pricing">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-200">
                <thead className="bg-[#1f2937] text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Product Item</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {order.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-semibold text-white">
                        {item.product?.name || item.product_name_snapshot || `Product #${item.product_id}`}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-300">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {item.discount_amount ? formatCurrency(item.discount_amount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(item.line_total || item.unit_price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="p-4 bg-[#0e1626] border-t border-[#26334d] flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-200 font-mono">
                    {formatCurrency(order.subtotal || order.total)}
                  </span>
                </div>
                {order.discount_total ? (
                  <div className="flex justify-between text-gray-400">
                    <span>Discount</span>
                    <span className="font-semibold text-rose-400 font-mono">
                      -{formatCurrency(order.discount_total)}
                    </span>
                  </div>
                ) : null}
                <div className="pt-2 border-t border-[#26334d] flex justify-between items-baseline text-sm font-bold">
                  <span className="text-white">Total Amount</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Cards (1 col) */}
        <div className="space-y-6">
          {/* Customer Details */}
          <Card title="Customer Profile">
            <DefinitionList
              items={[
                {
                  label: 'Name',
                  value: order.customer?.name || order.customer_name_snapshot || 'Walk-in Customer',
                },
                {
                  label: 'Phone',
                  value: order.customer?.phone || '—',
                },
                {
                  label: 'Account Balance',
                  value: order.customer?.balance ? formatCurrency(order.customer.balance) : 'Rs 0.00',
                },
              ]}
            />
          </Card>

          {/* Payment & Status */}
          <Card title="Payment &amp; Fulfillment">
            <DefinitionList
              items={[
                {
                  label: 'Order Status',
                  value: <Badge variant="success">{order.status.toUpperCase()}</Badge>,
                },
                {
                  label: 'Payment Method',
                  value: (order.payment_method || 'CASH').toUpperCase(),
                },
                {
                  label: 'Terminal / Channel',
                  value: order.source ? order.source.toUpperCase() : 'POS TERMINAL',
                },
                {
                  label: 'Timestamp',
                  value: formatDate(order.created_at),
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
