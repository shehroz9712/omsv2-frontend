'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GitMerge, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Customer } from '@/types/models';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { Select } from '@/components/forms/Select';
import { formatCurrency } from '@/lib/utils';

export default function CustomerMergePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sourceCustomerId, setSourceCustomerId] = useState('');
  const [targetCustomerId, setTargetCustomerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.CUSTOMERS.LIST + '?limit=200');
        const list = Array.isArray(res) ? res : res?.data || [];
        setCustomers(list);
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    };

    fetchCustomers();
  }, []);

  const handleMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!sourceCustomerId || !targetCustomerId) {
      setFeedback({ type: 'error', message: 'Please select both source and target customers.' });
      return;
    }

    if (sourceCustomerId === targetCustomerId) {
      setFeedback({ type: 'error', message: 'Source and target customers must be different.' });
      return;
    }

    if (!confirm('Merging will transfer all orders, invoices, and ledger entries to the target account. Source will be archived. Proceed?')) {
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(API_ENDPOINTS.CUSTOMERS.MERGE, {
        source_id: sourceCustomerId,
        target_id: targetCustomerId,
      });

      setFeedback({ type: 'success', message: 'Customers successfully merged!' });
      setTimeout(() => {
        router.push('/admin/customers');
      }, 1500);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to merge customers.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merge Customer Accounts"
        subtitle="Consolidate duplicate client profiles, transfer historical invoices, and unite ledgers"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Customers', href: '/admin/customers' },
          { label: 'Merge Accounts' },
        ]}
        actions={
          <Link href="/admin/customers">
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Customers
            </Button>
          </Link>
        }
      />

      <Card>
        {feedback && (
          <div
            className={`m-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p>{feedback.message}</p>
          </div>
        )}

        <form onSubmit={handleMerge} className="p-6 space-y-6 max-w-2xl">
          <FormField
            label="Source Customer (Duplicate to Archive)"
            htmlFor="source_id"
            required
            hint="All past orders and balances will be moved away from this account."
          >
            <Select
              id="source_id"
              required
              value={sourceCustomerId}
              onChange={(e) => setSourceCustomerId(e.target.value)}
            >
              <option value="">-- Choose Duplicate Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''} — Bal: {formatCurrency(c.balance || 0)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Target Customer (Master Account to Keep)"
            htmlFor="target_id"
            required
            hint="This account will receive all merged historical orders and ledger records."
          >
            <Select
              id="target_id"
              required
              value={targetCustomerId}
              onChange={(e) => setTargetCustomerId(e.target.value)}
            >
              <option value="">-- Choose Master Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''} — Bal: {formatCurrency(c.balance || 0)}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="pt-4 border-t border-[#26334d]">
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<GitMerge className="w-4 h-4" />}
            >
              Execute Account Merge
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
