'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileSpreadsheet,
  FileArchive,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
  AlertTriangle,
  FolderArchive,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';

interface ImportBatch {
  id: number;
  uuid: string;
  original_filename: string;
  filename?: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  progress_percentage: number;
  inserted_count: number;
  updated_count: number;
  unchanged_count: number;
  error_count: number;
  warning_count: number;
  is_dry_run: boolean;
  is_finished: boolean;
  started_at?: string;
  finished_at?: string;
  created_at?: string;
  rows?: Array<{
    id: number;
    row_number: number;
    sku?: string;
    status: string;
    messages?: any;
    raw?: any;
  }>;
}

export default function CatalogImportPage() {
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [imagesZip, setImagesZip] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  // Active / Selected Job
  const [selectedJob, setSelectedJob] = useState<ImportBatch | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [rowStatusFilter, setRowStatusFilter] = useState<string>('all');

  // History state
  const [history, setHistory] = useState<ImportBatch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper to download templates & error reports with authentication
  const downloadAuthenticatedFile = async (endpoint: string, fallbackFilename: string) => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('oms_token') || sessionStorage.getItem('oms_token')
          : null;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
      const cleanBase = baseUrl.replace(/\/+$/, '');
      const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

      const res = await fetch(`${cleanBase}${cleanPath}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      let filename = fallbackFilename;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Download failed.');
    }
  };

  const handleDownloadTemplate = async (format: 'xlsx' | 'csv' | 'zip') => {
    setDownloadingFormat(format);
    const filenames: Record<string, string> = {
      xlsx: 'sample_products.xlsx',
      csv: 'sample_products.csv',
      zip: 'sample_products_with_images.zip',
    };
    await downloadAuthenticatedFile(API_ENDPOINTS.IMPORT.TEMPLATE(format), filenames[format]);
    setDownloadingFormat(null);
  };

  const fetchHistory = async () => {
    try {
      const res: any = await apiClient.get(API_ENDPOINTS.IMPORT.LIST);
      const list = res?.items || (Array.isArray(res) ? res : res?.data || []);
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

  // Poll selected job if it is currently processing or queued
  useEffect(() => {
    if (!selectedJob || selectedJob.is_finished) return;

    const interval = setInterval(async () => {
      try {
        const res: any = await apiClient.get(
          `${API_ENDPOINTS.IMPORT.STATUS(selectedJob.id)}?status=${rowStatusFilter === 'all' ? '' : rowStatusFilter}`
        );
        const job = res?.data || res;
        setSelectedJob(job);

        if (job.is_finished) {
          fetchHistory();
        }
      } catch (err) {
        console.error('Error polling import job:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedJob, rowStatusFilter]);

  const loadJobDetails = async (jobId: number | string) => {
    setLoadingDetails(true);
    try {
      const res: any = await apiClient.get(
        `${API_ENDPOINTS.IMPORT.STATUS(jobId)}?status=${rowStatusFilter === 'all' ? '' : rowStatusFilter}`
      );
      const job = res?.data || res;
      setSelectedJob(job);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to load batch details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCancelJob = async (jobId: number | string) => {
    if (!confirm('Are you sure you want to cancel this running import?')) return;
    try {
      await apiClient.post(API_ENDPOINTS.IMPORT.CANCEL(jobId));
      await loadJobDetails(jobId);
      await fetchHistory();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel import.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a spreadsheet (.xlsx, .csv) or .zip archive to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    if (imagesZip) {
      formData.append('images_zip', imagesZip);
    }
    formData.append('dry_run', dryRun ? 'true' : 'false');

    try {
      const res: any = await apiClient.upload(API_ENDPOINTS.IMPORT.UPLOAD, formData);
      const job = res?.data || res;
      setSuccessMsg(`Import initiated for ${job.total_rows || 'batch'} rows successfully.`);
      setFile(null);
      setImagesZip(null);
      await loadJobDetails(job.id);
      await fetchHistory();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Import upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'completed_with_errors':
        return 'warning';
      case 'processing':
        return 'info';
      case 'failed':
        return 'danger';
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Sample Downloads */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Bulk Product Import & Catalog Ingestion"
          subtitle="High-throughput, memory-safe product catalog and inventory ingestion via CSV, XLSX, and ZIP"
          breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Import' }]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadTemplate('xlsx')}
            loading={downloadingFormat === 'xlsx'}
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
          >
            Sample XLSX
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadTemplate('csv')}
            loading={downloadingFormat === 'csv'}
            icon={<FileText className="w-3.5 h-3.5 text-blue-400" />}
          >
            Sample CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadTemplate('zip')}
            loading={downloadingFormat === 'zip'}
            icon={<FolderArchive className="w-3.5 h-3.5 text-purple-400" />}
          >
            Sample ZIP (with images)
          </Button>
        </div>
      </div>

      {/* Main 2-Column Upload & Rules Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upload Form */}
        <Card title="📥 Upload Catalog File">
          <p className="text-xs text-gray-400 mb-5 leading-relaxed">
            Upload <code className="px-1.5 py-0.5 rounded bg-gray-900 border border-slate-800 text-blue-400 font-mono text-[11px]">.xlsx</code>,{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-900 border border-slate-800 text-blue-400 font-mono text-[11px]">.csv</code>, or complete{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-900 border border-slate-800 text-purple-400 font-mono text-[11px]">.zip</code> package for high-throughput product ingestion (supports up to 50,000+ items).
          </p>

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Primary Spreadsheet / Archive Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Select Spreadsheet (.xlsx / .csv) or All-in-One Package (.zip) <span className="text-red-400">*</span>
              </label>
              <label
                htmlFor="main-file-input"
                className="border-2 border-dashed border-[#26334d] hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#0b0f19]/60"
              >
                <UploadCloud className="w-8 h-8 text-blue-400 mb-1.5" />
                <span className="text-xs font-semibold text-white">
                  {file ? file.name : 'Choose .xlsx, .csv, or .zip archive'}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5">Max size: 50 MB</span>
                <input
                  id="main-file-input"
                  type="file"
                  accept=".xlsx,.csv,.zip,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                />
              </label>
            </div>

            {/* Optional Images ZIP Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Optional Product Images Archive (.zip)
              </label>
              <label
                htmlFor="images-zip-input"
                className="border border-[#26334d] hover:border-slate-600 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors bg-[#0b0f19]/40"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileArchive className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-xs text-gray-300 truncate">
                    {imagesZip ? imagesZip.name : 'Upload ZIP containing product images (JPG/PNG/WebP)'}
                  </span>
                </div>
                {imagesZip && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setImagesZip(null);
                    }}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <input
                  id="images-zip-input"
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setImagesZip(e.target.files[0])}
                />
              </label>
              <p className="text-[11px] text-gray-500 mt-1">
                Filenames must match the <code className="text-gray-400">Image</code> column in your spreadsheet (e.g. water_1500.jpg).
              </p>
            </div>

            {/* Dry Run Checkbox */}
            <div className="rounded-xl border border-[#26334d] bg-[#0b0f19]/40 p-3.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-[#161f33] text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-white">Dry-Run Validation Mode</span>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Runs full file parsing, duplicate checks, and barcode resolution without modifying any database records.
                  </p>
                </div>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 font-bold flex items-center justify-center gap-2 text-sm"
              loading={uploading}
              icon={<UploadCloud className="w-4 h-4" />}
            >
              🚀 Start Asynchronous Import Pipeline
            </Button>
          </form>
        </Card>

        {/* Right Column: Format Specifications */}
        <Card title="📋 Format Specifications & Integrity Rules">
          <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
            <div>
              <strong className="text-white block mb-1">Required Columns:</strong>
              <div className="p-2.5 rounded-lg bg-[#0b0f19] border border-[#26334d] font-mono text-[11px] text-blue-300">
                SKU, Product Name, Category, Price, Stock
              </div>
            </div>

            <div>
              <strong className="text-white block mb-1">Optional Columns:</strong>
              <div className="p-2.5 rounded-lg bg-[#0b0f19] border border-[#26334d] font-mono text-[11px] text-emerald-300">
                Subcategory, Brand, Description, Cost Price, Unit, Barcode, Status, Featured, Image
              </div>
            </div>

            <ul className="space-y-2 list-disc list-inside text-gray-400 text-[11px] pt-1">
              <li>
                <strong className="text-gray-200">SKU & Barcodes:</strong> Always preserve leading zeros. Format column as <code className="text-blue-400 font-mono">Text</code> in Excel.
              </li>
              <li>
                <strong className="text-gray-200">Barcode Resolution:</strong> Blank cells generate valid EAN-13 codes automatically. Existing products keep current barcodes.
              </li>
              <li>
                <strong className="text-gray-200">Stock Adjustments:</strong> Non-zero changes record double-entry audit records in <code className="text-blue-400 font-mono">StockMovement</code> (type <code className="text-blue-400 font-mono">excel_import</code>).
              </li>
              <li>
                <strong className="text-gray-200">Fractional Units:</strong> Decimal quantities allowed only for units with fractional support (<code className="text-gray-300 font-mono">kg</code>, <code className="text-gray-300 font-mono">litre</code>). Units like <code className="text-gray-300 font-mono">pcs</code> require integers.
              </li>
              <li>
                <strong className="text-gray-200">Idempotency:</strong> Re-importing identical records marks them <em>unchanged</em> without touching <code className="text-blue-400 font-mono">updated_at</code>, preventing catalog sync storms.
              </li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Selected / Active Job Detail Card */}
      {selectedJob && (
        <Card
          title={
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-white text-sm">
                  Batch #{selectedJob.id}: {selectedJob.original_filename || selectedJob.filename}
                </span>
                <Badge variant={getBadgeVariant(selectedJob.status) as any}>
                  {selectedJob.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {selectedJob.is_dry_run && <Badge variant="warning">DRY-RUN</Badge>}
              </div>
              <div className="flex items-center gap-2">
                {!selectedJob.is_finished && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancelJob(selectedJob.id)}
                    icon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Cancel Import
                  </Button>
                )}
                {(selectedJob.error_count > 0 || selectedJob.warning_count > 0) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      downloadAuthenticatedFile(
                        API_ENDPOINTS.IMPORT.ERRORS_CSV(selectedJob.id),
                        `import_${selectedJob.id}_issues.csv`
                      )
                    }
                    icon={<Download className="w-3.5 h-3.5 text-rose-400" />}
                  >
                    Download Issues CSV ({selectedJob.error_count + selectedJob.warning_count})
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-400">
                  Processed {selectedJob.processed_rows} of {selectedJob.total_rows || selectedJob.processed_rows} rows
                </span>
                <span className="font-mono text-blue-400 font-bold">
                  {selectedJob.progress_percentage ||
                    (selectedJob.total_rows
                      ? Math.round((selectedJob.processed_rows / selectedJob.total_rows) * 100)
                      : 0)}
                  %
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      selectedJob.total_rows
                        ? (selectedJob.processed_rows / selectedJob.total_rows) * 100
                        : 0
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* 6 KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-[#0b0f19] border border-[#26334d] rounded-xl text-center">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Rows</div>
                <div className="text-lg font-mono font-bold text-white mt-0.5">{selectedJob.total_rows}</div>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#26334d] rounded-xl text-center">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Inserted</div>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">+{selectedJob.inserted_count}</div>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#26334d] rounded-xl text-center">
                <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Updated</div>
                <div className="text-lg font-mono font-bold text-blue-400 mt-0.5">{selectedJob.updated_count}</div>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#26334d] rounded-xl text-center">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Unchanged</div>
                <div className="text-lg font-mono font-bold text-gray-400 mt-0.5">{selectedJob.unchanged_count}</div>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#26334d] rounded-xl text-center">
                <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Errors</div>
                <div className="text-lg font-mono font-bold text-rose-400 mt-0.5">{selectedJob.error_count}</div>
              </div>
              <div className="p-3 bg-[#0b0f19] border border-[#26334d] rounded-xl text-center">
                <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Warnings</div>
                <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">{selectedJob.warning_count}</div>
              </div>
            </div>

            {/* Row-Level Inspection Table */}
            {selectedJob.rows && selectedJob.rows.length > 0 && (
              <div className="pt-4 border-t border-[#26334d]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Processed Row Results</h4>
                  <div className="flex items-center gap-1.5">
                    {['all', 'error', 'warning', 'inserted', 'updated'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setRowStatusFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          rowStatusFilter === f
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto rounded-xl border border-[#26334d]">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#0b0f19] text-[11px] uppercase tracking-wider text-gray-400 sticky top-0 border-b border-[#26334d]">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Row #</th>
                        <th className="px-4 py-2.5 font-semibold">SKU</th>
                        <th className="px-4 py-2.5 font-semibold">Status</th>
                        <th className="px-4 py-2.5 font-semibold">Message / Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#26334d] text-xs">
                      {selectedJob.rows.map((r) => {
                        const messages = Array.isArray(r.messages)
                          ? r.messages.map((m: any) => (typeof m === 'object' ? m.message : m)).join('; ')
                          : String(r.messages || '—');
                        return (
                          <tr key={r.id} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-2 font-mono text-gray-400 font-semibold">{r.row_number}</td>
                            <td className="px-4 py-2 font-mono text-white font-bold">{r.sku || '—'}</td>
                            <td className="px-4 py-2">
                              <Badge
                                variant={
                                  r.status === 'inserted'
                                    ? 'success'
                                    : r.status === 'updated'
                                    ? 'info'
                                    : r.status === 'error'
                                    ? 'danger'
                                    : 'warning'
                                }
                              >
                                {r.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-gray-400 truncate max-w-md" title={messages}>
                              {messages}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Batch Import History Table */}
      <Card title="📜 Batch Import History">
        <DataTable
          columns={[
            {
              header: 'ID',
              render: (j: ImportBatch) => (
                <span className="font-mono font-bold text-white text-xs">#{j.id}</span>
              ),
            },
            {
              header: 'Filename',
              render: (j: ImportBatch) => (
                <div>
                  <div className="font-semibold text-white text-xs max-w-xs truncate" title={j.original_filename || j.filename}>
                    {j.original_filename || j.filename || 'catalog.csv'}
                  </div>
                  <div className="font-mono text-[10px] text-gray-500">
                    UUID: {String(j.uuid || '').substring(0, 8)}
                  </div>
                </div>
              ),
            },
            {
              header: 'Status',
              render: (j: ImportBatch) => (
                <Badge variant={getBadgeVariant(j.status) as any}>
                  {j.status.replace('_', ' ').toUpperCase()}
                </Badge>
              ),
            },
            {
              header: 'Progress',
              render: (j: ImportBatch) => {
                const percent =
                  j.progress_percentage ||
                  (j.total_rows ? Math.round((j.processed_rows / j.total_rows) * 100) : 100);
                return (
                  <div className="min-w-[100px]">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono">
                      <span>{j.processed_rows} / {j.total_rows || j.processed_rows}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              },
            },
            {
              header: 'Inserted',
              render: (j: ImportBatch) => (
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  +{j.inserted_count}
                </span>
              ),
            },
            {
              header: 'Updated',
              render: (j: ImportBatch) => (
                <span className="font-mono font-bold text-blue-400 text-xs">
                  {j.updated_count}
                </span>
              ),
            },
            {
              header: 'Unchanged',
              render: (j: ImportBatch) => (
                <span className="font-mono text-gray-400 text-xs">
                  {j.unchanged_count}
                </span>
              ),
            },
            {
              header: 'Errors',
              render: (j: ImportBatch) => (
                <span className={`font-mono text-xs font-bold ${j.error_count > 0 ? 'text-rose-400' : 'text-gray-500'}`}>
                  {j.error_count}
                </span>
              ),
            },
            {
              header: 'Mode',
              render: (j: ImportBatch) => (
                <Badge variant={j.is_dry_run ? 'warning' : 'secondary'}>
                  {j.is_dry_run ? 'DRY-RUN' : 'LIVE'}
                </Badge>
              ),
            },
            {
              header: 'Date',
              render: (j: ImportBatch) => (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(j.started_at || j.created_at)}
                </span>
              ),
            },
            {
              header: 'Action',
              render: (j: ImportBatch) => (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => loadJobDetails(j.id)}
                  loading={loadingDetails && selectedJob?.id === j.id}
                  icon={<Eye className="w-3.5 h-3.5 text-blue-400" />}
                >
                  View Details
                </Button>
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
  );
}
