'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';

export default function InvoiceSettingsPage() {
  const [formData, setFormData] = useState({
    header_text: 'Thank you for shopping with us!',
    footer_text: 'Goods once sold are returnable within 3 days with original receipt.',
    paper_size: 'thermal_80mm',
    show_logo: 'true',
    show_tax_number: 'true',
    ntn_number: '1234567-8',
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchInvoiceSettings = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.SETTINGS.INVOICE);
        if (res) {
          setFormData((prev) => ({ ...prev, ...(res.data || res) }));
        }
      } catch (err) {
        console.error('Failed to load invoice settings:', err);
      }
    };

    fetchInvoiceSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      await apiClient.put(API_ENDPOINTS.SETTINGS.INVOICE, formData);
      setFeedback({ type: 'success', message: 'Invoice template preferences saved.' });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update invoice settings.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice &amp; Receipt Customizer"
        subtitle="Customize 80mm thermal receipt formats, A4 invoices, and tax registration notices"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Settings', href: '/admin/settings' },
          { label: 'Invoice Customizer' },
        ]}
        actions={
          <Link href="/admin/settings">
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Settings
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
            <FormField label="Default Printer Format" htmlFor="paper_size" required>
              <Select
                id="paper_size"
                required
                value={formData.paper_size}
                onChange={(e) => setFormData({ ...formData, paper_size: e.target.value })}
              >
                <option value="thermal_80mm">Thermal Receipt (80mm / 3 inch)</option>
                <option value="thermal_58mm">Thermal Receipt (58mm / 2 inch)</option>
                <option value="a4_full">A4 Full Sheet (Standard Laser)</option>
              </Select>
            </FormField>

            <FormField label="Tax / NTN Registration Number" htmlFor="ntn_number">
              <Input
                id="ntn_number"
                value={formData.ntn_number}
                onChange={(e) => setFormData({ ...formData, ntn_number: e.target.value })}
                placeholder="e.g. 1234567-8"
              />
            </FormField>
          </div>

          <FormField label="Receipt Header Message" htmlFor="header_text">
            <Input
              id="header_text"
              value={formData.header_text}
              onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
            />
          </FormField>

          <FormField label="Receipt Footer Terms &amp; Policies" htmlFor="footer_text">
            <Textarea
              id="footer_text"
              rows={3}
              value={formData.footer_text}
              onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
            />
          </FormField>

          <div className="pt-4 border-t border-[#26334d]">
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<Save className="w-4 h-4" />}
            >
              Save Invoice Template
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
