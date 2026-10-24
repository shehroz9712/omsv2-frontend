'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ImportJobStatus } from '@/types/models';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';

export default function CatalogImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeJob, setActiveJob] = useState<ImportJobStatus | null>(null);
  const [history, setHistory] = useState<ImportJobStatus[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const res: any = await apiClient.get(API_ENDPOINTS.IMPORT.LIST);
      const list = Array.isArray(res) ? res : res?.data || [];
      setHistory(list);
    } catch (err) {
      console.error('Failed to load import history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Poll active job progress
  useEffect(() => {
    if (!activeJob || activeJob.status === 'completed' || activeJob.status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.IMPORT.STATUS(activeJob.id));
        const status = res?.data || res;
        setActiveJob(status);

        if (status.status === 'completed' || status.status === 'failed') {
          fetchHistory();
        }
      } catch (err) {
        console.error('Error polling import job:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJob]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a CSV file to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res: any = await apiClient.upload(API_ENDPOINTS.IMPORT.UPLOAD, formData);
      const job = res?.data || res;
      setActiveJob(job);
      setFile(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Import upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog Batch Importer"
        subtitle="Bulk import products, SKUs, inventory quantities, and prices via CSV/Excel"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Import' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-1">
          <Card title="Upload Catalog File">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <label
                htmlFor="catalog-file"
                className="border-2 border-dashed border-[#26334d] hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              >
                <UploadCloud className="w-10 h-10 text-blue-400 mb-2" />
                <span className="text-sm font-semibold text-white">
                  {file ? file.name : 'Choose CSV or drag & drop'}
                </span>
                <span className="text-xs text-gray-500 mt-1">UTF-8 CSV format (Max 25MB)</span>
                <input
                  id="catalog-file"
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                />
              </label>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={uploading}
                icon={<FileSpreadsheet className="w-4 h-4" />}
              >
                Start Background Import
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#26334d] text-xs text-gray-400 space-y-1">
              <p className="font-semibold text-gray-300">Expected CSV Columns:</p>
              <code className="text-[11px] text-blue-400 font-mono block">
                name, sku, barcode, category, price, cost, stock
              </code>
            </div>
          </Card>
        </div>

        {/* Active Progress or Overview */}
        <div className="lg:col-span-2 space-y-6">
          {activeJob && (
            <Card title={`Active Job: #${String(activeJob.id).substring(0, 8)}`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 font-medium">Status: {activeJob.status.toUpperCase()}</span>
                  <span className="font-mono text-blue-400 font-bold">
                    {activeJob.processed_rows} / {activeJob.total_rows || '?'} rows
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${
                        activeJob.total_rows
                          ? Math.min(100, Math.round((activeJob.processed_rows / activeJob.total_rows) * 100))
                          : 50
                      }%`,
                    }}
                  />
                </div>

                {activeJob.error_count ? (
                  <p className="text-xs text-rose-400 font-medium">
                    ⚠️ {activeJob.error_count} row errors encountered
                  </p>
                ) : null}
              </div>
            </Card>
          )}

          {/* History Table */}
          <Card title="Past Import Batches">
            <DataTable
              columns={[
                {
                  header: 'Job ID',
                  render: (j: ImportJobStatus) => (
                    <span className="font-mono font-bold text-blue-400">#{String(j.id).substring(0, 8)}</span>
                  ),
                },
                {
                  header: 'Filename',
                  render: (j: ImportJobStatus) => (
                    <span className="font-semibold text-white text-xs">{j.filename || 'catalog.csv'}</span>
                  ),
                },
                {
                  header: 'Processed',
                  render: (j: ImportJobStatus) => (
                    <span className="font-mono text-xs text-gray-300">
                      {j.processed_rows} / {j.total_rows || j.processed_rows}
                    </span>
                  ),
                },
                {
                  header: 'Status',
                  render: (j: ImportJobStatus) => {
                    const variant =
                      j.status === 'completed'
                        ? 'success'
                        : j.status === 'failed'
                        ? 'danger'
                        : 'warning';
                    return <Badge variant={variant as any}>{j.status.toUpperCase()}</Badge>;
                  },
                },
                {
                  header: 'Date',
                  render: (j: ImportJobStatus) => (
                    <span className="text-xs text-gray-400">{formatDate(j.created_at)}</span>
                  ),
                },
              ]}
              data={history}
              keyExtractor={(j) => j.id}
              loading={loadingHistory}
              emptyMessage="No catalog import batches run yet."
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
