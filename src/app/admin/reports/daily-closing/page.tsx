'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Printer, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';

export default function DailyClosingReportPage() {
  const [closingDate, setClosingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyClosing = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(`${API_ENDPOINTS.REPORTS.DAILY_CLOSING}?date=${closingDate}`);
      setReport(res?.data || res);
    } catch (err) {
      console.error('Failed to load daily closing report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyClosing();
  }, [closingDate]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Shift &amp; Register Closing Report"
        subtitle="End-of-day register reconciliation, cash drawer balancing, and payment summaries"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Reports', href: '/admin/reports/sales' },
          { label: 'Daily Closing' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <input
              type="date"
              aria-label="Closing Date"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              className="px-3 py-1.5 bg-[#1f2937] border border-gray-700 rounded-lg text-xs text-white"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              icon={<Printer className="w-4 h-4" />}
            >
              Print Register Z-Report
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cash Collected"
          value={formatCurrency(report?.total_cash || 0)}
          subtitle="Physical cash in register"
          color="emerald"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        />

        <StatCard
          title="Card &amp; Bank Payments"
          value={formatCurrency(report?.total_digital || 0)}
          subtitle="POS terminal card slips"
          color="blue"
        />

        <StatCard
          title="Credit Sales (On Account)"
          value={formatCurrency(report?.total_credit || 0)}
          subtitle="Added to client ledgers"
          color="amber"
        />

        <StatCard
          title="Total Register Orders"
          value={(report?.orders_count || 0).toLocaleString()}
          subtitle="Completed transactions"
          color="indigo"
        />
      </div>

      {/* Cash Drawer Reconciliation Summary */}
      <Card title="Cash Drawer Breakdown">
        <div className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b border-[#26334d] text-sm">
            <span className="text-gray-400">Opening Float Balance</span>
            <span className="font-mono font-bold text-white">
              {formatCurrency(report?.opening_balance || 0)}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-[#26334d] text-sm">
            <span className="text-gray-400">Cash Sales Total (+)</span>
            <span className="font-mono font-bold text-emerald-400">
              +{formatCurrency(report?.total_cash || 0)}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-[#26334d] text-sm">
            <span className="text-gray-400">Cash Refunds / Returns (-)</span>
            <span className="font-mono font-bold text-rose-400">
              -{formatCurrency(report?.total_refunds || 0)}
            </span>
          </div>

          <div className="flex justify-between py-3 border-t-2 border-[#26334d] text-base font-black">
            <span className="text-white">Expected Cash in Drawer</span>
            <span className="font-mono text-emerald-300">
              {formatCurrency(
                (report?.opening_balance || 0) +
                  (report?.total_cash || 0) -
                  (report?.total_refunds || 0)
              )}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
