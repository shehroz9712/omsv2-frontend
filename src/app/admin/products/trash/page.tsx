'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Trash2, Package } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Product } from '@/types/models';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';

export default function ProductTrashPage() {
  const [trashed, setTrashed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(API_ENDPOINTS.PRODUCTS.TRASH);
      const list = Array.isArray(res) ? res : res?.data || [];
      setTrashed(list);
    } catch (err) {
      console.error('Failed to load trashed products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id: string | number) => {
    try {
      await apiClient.post(API_ENDPOINTS.PRODUCTS.RESTORE(id));
      setTrashed((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to restore product');
    }
  };

  const handlePermanentDelete = async (id: string | number) => {
    if (!confirm('This action is irreversible. Permanently delete product from database?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.PRODUCTS.FORCE_DELETE(id));
      setTrashed((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to permanently delete product');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trashed Products"
        subtitle="Restore archived items or permanently purge them from the database"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'Trash' },
        ]}
        actions={
          <Link href="/admin/products">
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Catalog
            </Button>
          </Link>
        }
      />

      <Card>
        <DataTable
          columns={[
            {
              header: 'Product',
              render: (p: Product) => (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0b0f19] border border-[#26334d] flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">{p.name}</h5>
                    <span className="text-xs text-gray-400 font-mono">SKU: {p.sku || 'N/A'}</span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Price',
              render: (p: Product) => (
                <span className="font-semibold text-gray-300">{formatCurrency(p.price)}</span>
              ),
            },
            {
              header: 'Last Stock',
              render: (p: Product) => (
                <span className="text-gray-400">{p.stock} units</span>
              ),
            },
            {
              header: 'Actions',
              render: (p: Product) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(p.id)}
                    icon={<RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
                  >
                    Restore
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handlePermanentDelete(p.id)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Purge
                  </Button>
                </div>
              ),
            },
          ]}
          data={trashed}
          keyExtractor={(p) => p.id}
          loading={loading}
          emptyMessage="Trash is empty. No archived products."
        />
      </Card>
    </div>
  );
}
