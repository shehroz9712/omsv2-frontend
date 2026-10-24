'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit, Search, AlertCircle, FileSpreadsheet, Package } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Product } from '@/types/models';
import { formatCurrency, formatQuantity } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = `?limit=100`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (categoryFilter) query += `&category=${encodeURIComponent(categoryFilter)}`;

      const res: any = await apiClient.get(`${API_ENDPOINTS.PRODUCTS.LIST}${query}`);
      const list = Array.isArray(res) ? res : res?.data || [];
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to move this product to Trash?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products Catalog"
        subtitle="Manage inventory items, SKUs, barcode mappings, and pricing rules"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Products' }]}
        actions={
          <div className="flex gap-2">
            <Link href="/admin/products/trash">
              <Button variant="outline" size="sm" icon={<Trash2 className="w-4 h-4 text-gray-400" />}>
                Trash
              </Button>
            </Link>
            <Link href="/admin/import">
              <Button variant="secondary" size="sm" icon={<FileSpreadsheet className="w-4 h-4" />}>
                Import CSV
              </Button>
            </Link>
            <Link href="/admin/products/create">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                New Product
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <div className="p-4 border-b border-[#26334d]">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={fetchProducts}
            placeholder="Search by name, SKU, or barcode..."
          />
        </div>

        <DataTable
          columns={[
            {
              header: 'Product',
              render: (p: Product) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0b0f19] border border-[#26334d] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="font-bold text-white hover:text-blue-400 leading-tight block"
                    >
                      {p.name}
                    </Link>
                    <span className="text-[11px] text-gray-400 font-mono">
                      SKU: {p.sku || 'N/A'} {p.barcode ? `• Barcode: ${p.barcode}` : ''}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Category',
              render: (p: Product) => (
                <span className="text-xs text-gray-300 font-medium">
                  {p.category || 'General'}
                </span>
              ),
            },
            {
              header: 'Sale Price',
              render: (p: Product) => (
                <span className="font-bold text-emerald-400 font-mono">
                  {formatCurrency(p.price)}
                </span>
              ),
            },
            {
              header: 'Stock',
              render: (p: Product) => {
                const isOut = p.stock <= 0;
                const isLow = p.stock > 0 && p.stock <= (p.min_stock || 10);
                return (
                  <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                    {formatQuantity(p.stock)} {p.unit || 'units'}
                  </Badge>
                );
              },
            },
            {
              header: 'Actions',
              render: (p: Product) => (
                <div className="flex items-center gap-1.5">
                  <Link href={`/admin/products/${p.id}/edit`}>
                    <button
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-white/5 transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                    title="Move to Trash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={products}
          keyExtractor={(p) => p.id}
          loading={loading}
          emptyMessage="No products in catalog matching criteria."
        />
      </Card>
    </div>
  );
}
