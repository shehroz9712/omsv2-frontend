'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, AlertCircle, Save } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Order } from '@/types/models';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Textarea } from '@/components/forms/Textarea';

export default function ProcessOrderReturnPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('damaged');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.ORDERS.SHOW(id));
        const ord = res?.data || res;
        setOrder(ord);
        // Initialize return quantities to 0
        const initialQty: Record<string, number> = {};
        ord?.items?.forEach((item: any) => {
          initialQty[item.id] = 0;
        });
        setReturnQuantities(initialQty);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const itemsToReturn = Object.entries(returnQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([order_item_id, quantity]) => ({
        order_item_id,
        quantity,
      }));

    if (itemsToReturn.length === 0) {
      setErrorMessage('Please specify at least one item quantity to return.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(API_ENDPOINTS.ORDERS.PROCESS_RETURN(id), {
        items: itemsToReturn,
        reason,
        notes: notes.trim() || null,
      });

      router.push('/admin/returns');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to process return.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <p>Order not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Process Return for Order #${order.order_number}`}
        subtitle="Select returned quantities and record inventory restocking disposition"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Orders', href: '/admin/orders' },
          { label: `#${order.order_number}`, href: `/admin/orders/${order.id}` },
          { label: 'Return' },
        ]}
      />

      <Card>
        {errorMessage && (
          <div className="m-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmitReturn} className="p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-200">
              <thead className="bg-[#1f2937] text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Product Item</th>
                  <th className="px-4 py-3">Ordered Qty</th>
                  <th className="px-4 py-3">Unit Price</th>
                  <th className="px-4 py-3">Return Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {order.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold text-white">
                      {item.product?.name || item.product_name_snapshot || `Product #${item.product_id}`}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-400">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={returnQuantities[item.id] || 0}
                        onChange={(e) =>
                          setReturnQuantities({
                            ...returnQuantities,
                            [item.id]: Math.min(item.quantity, Math.max(0, parseInt(e.target.value, 10) || 0)),
                          })
                        }
                        className="w-24 text-center font-bold"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#26334d]">
            <FormField label="Return Reason" htmlFor="reason" required>
              <Select
                id="reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="damaged">Damaged / Defective Stock</option>
                <option value="customer_exchange">Customer Exchange</option>
                <option value="wrong_item">Incorrect Item Shipped</option>
                <option value="cancelled">Customer Cancelled / Refused</option>
              </Select>
            </FormField>

            <FormField label="Additional Notes" htmlFor="notes">
              <Textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details about returned stock condition..."
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#26334d]">
            <Link href={`/admin/orders/${order.id}`}>
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Submit Return &amp; Adjust Stock
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
