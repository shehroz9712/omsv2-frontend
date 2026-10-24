'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Save, AlertCircle, CheckCircle, Receipt } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

export default function SystemSettingsPage() {
  const [formData, setFormData] = useState({
    store_name: 'OMS Central Distribution',
    store_phone: '+92 300 1234567',
    store_email: 'admin@quickorder.pos',
    currency: 'PKR',
    tax_rate: '0',
    offline_sync_interval: '60',
    max_offline_days: '7',
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.SETTINGS.GET);
        if (res) {
          setFormData((prev) => ({ ...prev, ...(res.data || res) }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      await apiClient.put(API_ENDPOINTS.SETTINGS.UPDATE, formData);
      setFeedback({ type: 'success', message: 'System settings saved successfully.' });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save settings.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global System Settings"
        subtitle="Configure business parameters, offline lease windows, and tax policies"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Settings' }]}
        actions={
          <Link href="/admin/settings/invoice">
            <Button variant="outline" size="sm" icon={<Receipt className="w-4 h-4 text-blue-400" />}>
              Invoice Customizer
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Business / Company Name" htmlFor="store_name" required>
              <Input
                id="store_name"
                required
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              />
            </FormField>

            <FormField label="Official Phone Number" htmlFor="store_phone">
              <Input
                id="store_phone"
                value={formData.store_phone}
                onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
              />
            </FormField>

            <FormField label="Support Email" htmlFor="store_email">
              <Input
                id="store_email"
                type="email"
                value={formData.store_email}
                onChange={(e) => setFormData({ ...formData, store_email: e.target.value })}
              />
            </FormField>

            <FormField label="Primary Currency" htmlFor="currency" required>
              <Select
                id="currency"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="PKR">PKR — Pakistani Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="AED">AED — UAE Dirham</option>
              </Select>
            </FormField>

            <FormField label="Default Sales Tax (%)" htmlFor="tax_rate">
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
              />
            </FormField>

            <FormField
              label="Offline Lease Maximum Duration (Days)"
              htmlFor="max_offline_days"
              hint="Max consecutive days a POS device can operate disconnected before re-authorization."
            >
              <Input
                id="max_offline_days"
                type="number"
                min="1"
                max="30"
                value={formData.max_offline_days}
                onChange={(e) => setFormData({ ...formData, max_offline_days: e.target.value })}
              />
            </FormField>
          </div>

          <div className="pt-4 border-t border-[#26334d]">
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
