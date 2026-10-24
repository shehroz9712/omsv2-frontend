'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Printer, Download, CreditCard, DollarSign } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Customer } from '@/types/models';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';

interface LedgerEntry {
  id: string;
  created_at: string;
  type: 'sale' | 'payment' | 'return' | 'adjustment';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference_id?: string;
}

export default function CustomerLedgerPage() {
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchLedger = async () => {
      try {
        const [custRes, ledgRes] = await Promise.allSettled([
          apiClient.get(API_ENDPOINTS.CUSTOMERS.SHOW(id)),
          apiClient.get(API_ENDPOINTS.CUSTOMERS.LEDGER(id)),
        ]);

        if (custRes.status === 'fulfilled' && custRes.value) {
          setCustomer((custRes.value as any)?.data || custRes.value);
        }

        if (ledgRes.status === 'fulfilled' && ledgRes.value) {
          const list = Array.isArray(ledgRes.value) ? ledgRes.value : (ledgRes.value as any)?.data || [];
          setEntries(list);
        }
      } catch (err) {
        console.error('Failed to load ledger:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Customer Ledger: ${customer?.name || 'Customer'}`}
        subtitle={`Current Balance: ${formatCurrency(customer?.balance || 0)}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Customers', href: '/admin/customers' },
          { label: customer?.name || 'Ledger' },
          { label: 'Ledger Statement' },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/admin/customers">
              <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Customers
              </Button>
            </Link>
          </div>
        }
      />

      <Card title="Financial Transaction Statement">
        <DataTable
          columns={[
            {
              header: 'Date',
              render: (e: LedgerEntry) => (
                <span className="font-mono text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(e.created_at)}
                </span>
              ),
            },
            {
              header: 'Transaction Type',
              render: (e: LedgerEntry) => {
                const variant =
                  e.type === 'payment'
                    ? 'success'
                    : e.type === 'sale'
                    ? 'info'
                    : e.type === 'return'
                    ? 'warning'
                    : 'secondary';
                return <Badge variant={variant as any}>{e.type.toUpperCase()}</Badge>;
              },
            },
            {
              header: 'Description / Reference',
              render: (e: LedgerEntry) => (
                <span className="text-white font-medium text-xs">
                  {e.description || `Transaction #${String(e.id).substring(0, 8)}`}
                </span>
              ),
            },
            {
              header: 'Debit (+ Due)',
              render: (e: LedgerEntry) => (
                <span className="font-mono text-xs font-semibold text-rose-400">
                  {e.debit > 0 ? formatCurrency(e.debit) : '—'}
                </span>
              ),
            },
            {
              header: 'Credit (- Paid)',
              render: (e: LedgerEntry) => (
                <span className="font-mono text-xs font-semibold text-emerald-400">
                  {e.credit > 0 ? formatCurrency(e.credit) : '—'}
                </span>
              ),
            },
            {
              header: 'Running Balance',
              render: (e: LedgerEntry) => (
                <span
                  className={`font-mono text-xs font-bold ${
                    e.balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formatCurrency(e.balance)}
                </span>
              ),
            },
          ]}
          data={entries}
          keyExtractor={(e) => e.id}
          loading={loading}
          emptyMessage="No transaction ledger entries found for this customer."
        />
      </Card>
    </div>
  );
}
