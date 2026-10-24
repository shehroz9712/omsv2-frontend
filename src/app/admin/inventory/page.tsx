'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Product } from '@/types/models';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { formatQuantity, formatDate } from '@/lib/utils';

interface StockMovement {
  id: string;
  created_at: string;
  product_id: string;
  product?: { name: string; sku: string };
  type: string;
  quantity: number;
  balance_before: number;
  balance_after: number;
  notes?: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'low_stock' | 'out_of_stock'>('');

  // Adjustment form state
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustType, setAdjustType] = useState<'stock_in' | 'stock_out'>('stock_in');
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);
  const [adjustFeedback, setAdjustFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      let query = `?limit=100`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&filter=${statusFilter}`;

      const [prodRes, moveRes] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.INVENTORY.LIST + query),
        apiClient.get(API_ENDPOINTS.INVENTORY.MOVEMENTS + '?limit=20'),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value) {
        const list = Array.isArray(prodRes.value) ? prodRes.value : (prodRes.value as any).data || [];
        setProducts(list);
      }

      if (moveRes.status === 'fulfilled' && moveRes.value) {
        const mList = Array.isArray(moveRes.value) ? moveRes.value : (moveRes.value as any).data || [];
        setMovements(mList);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [statusFilter]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId) {
      setAdjustFeedback({ type: 'error', message: 'Please choose a product to adjust.' });
      return;
    }

    setSubmittingAdjust(true);
    setAdjustFeedback(null);

    try {
      const qty = parseInt(adjustQuantity, 10) || 0;
      await apiClient.post(API_ENDPOINTS.INVENTORY.ADJUST, {
        product_id: adjustProductId,
        type: adjustType,
        quantity: qty,
        reason: adjustReason.trim(),
      });

      setAdjustFeedback({ type: 'success', message: 'Stock adjustment successfully logged.' });
      setAdjustQuantity('');
      setAdjustReason('');
      fetchInventoryData();
    } catch (err: unknown) {
      setAdjustFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to record stock adjustment.',
      });
    } finally {
      setSubmittingAdjust(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Levels &amp; Stock Movements"
        subtitle="Monitor real-time warehouse stock, track audit history, and log adjustments"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Inventory' }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={fetchInventoryData}
        placeholder="Search inventory by product, SKU, or barcode..."
      />

      {/* Grid: Stock Levels (2 cols) & Adjust Form (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Current Stock Levels"
            actions={
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter('')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === '' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('low_stock')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === 'low_stock' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-gray-800'
                  }`}
                >
                  ⚠️ Low Stock
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('out_of_stock')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === 'out_of_stock' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:bg-gray-800'
                  }`}
                >
                  🚫 Out of Stock
                </button>
              </div>
            }
          >
            <DataTable
              columns={[
                {
                  header: 'Product',
                  render: (p: Product) => (
                    <div>
                      <h5 className="font-bold text-white text-xs">{p.name}</h5>
                      <span className="text-[11px] text-gray-400 font-mono">SKU: {p.sku || 'N/A'}</span>
                    </div>
                  ),
                },
                {
                  header: 'Current Stock',
                  render: (p: Product) => {
                    const isOut = p.stock <= 0;
                    const isLow = p.stock > 0 && p.stock <= (p.min_stock || 10);
                    return (
                      <span
                        className={`font-mono font-bold text-sm ${
                          isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {formatQuantity(p.stock)} {p.unit || 'units'}
                      </span>
                    );
                  },
                },
                {
                  header: 'Threshold',
                  render: (p: Product) => (
                    <span className="text-xs text-gray-400">Min: {p.min_stock || 10}</span>
                  ),
                },
                {
                  header: 'Status',
                  render: (p: Product) => {
                    const isOut = p.stock <= 0;
                    const isLow = p.stock > 0 && p.stock <= (p.min_stock || 10);
                    return (
                      <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Sufficient'}
                      </Badge>
                    );
                  },
                },
              ]}
              data={products}
              keyExtractor={(p) => p.id}
              loading={loading}
              emptyMessage="No inventory items found."
            />
          </Card>
        </div>

        {/* Quick Stock Adjust Form */}
        <div className="lg:col-span-1">
          <Card title="⚡ Quick Stock Adjust">
            {adjustFeedback && (
              <div
                className={`mb-4 p-3 rounded-xl flex items-center gap-2.5 text-xs ${
                  adjustFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {adjustFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{adjustFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <FormField label="Select Product" htmlFor="product_id" required>
                <Select
                  id="product_id"
                  required
                  value={adjustProductId}
                  onChange={(e) => setAdjustProductId(e.target.value)}
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku ? `[${p.sku}] ` : ''}{p.name} ({p.stock} {p.unit || 'units'})
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Adjustment Type" htmlFor="adjust_type" required>
                <Select
                  id="adjust_type"
                  required
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                >
                  <option value="stock_in">🟢 Stock IN (Purchase / Restock)</option>
                  <option value="stock_out">🔴 Stock OUT (Damage / Write-off)</option>
                </Select>
              </FormField>

              <FormField label="Adjustment Quantity" htmlFor="quantity" required>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  placeholder="e.g. 50"
                />
              </FormField>

              <FormField label="Reason / Reference" htmlFor="reason" required>
                <Input
                  id="reason"
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="PO #8839 / Warehouse recount"
                />
              </FormField>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submittingAdjust}
                >
                  Record Adjustment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Double-Entry Stock Movement History Table */}
      <Card title="Double-Entry Stock Movement History">
        <DataTable
          columns={[
            {
              header: 'Timestamp',
              render: (m: StockMovement) => (
                <span className="font-mono text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(m.created_at)}
                </span>
              ),
            },
            {
              header: 'Product',
              render: (m: StockMovement) => (
                <span className="font-semibold text-white">
                  {m.product?.name || m.product_id}
                </span>
              ),
            },
            {
              header: 'Type',
              render: (m: StockMovement) => (
                <Badge variant="info">{m.type.replace('_', ' ').toUpperCase()}</Badge>
              ),
            },
            {
              header: 'Delta',
              render: (m: StockMovement) => {
                const isNegative = m.quantity < 0;
                return (
                  <span
                    className={`font-mono font-bold text-xs ${
                      isNegative ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </span>
                );
              },
            },
            {
              header: 'Before',
              render: (m: StockMovement) => (
                <span className="font-mono text-xs text-gray-400">{m.balance_before}</span>
              ),
            },
            {
              header: 'After',
              render: (m: StockMovement) => (
                <span className="font-mono text-xs font-bold text-white">{m.balance_after}</span>
              ),
            },
            {
              header: 'Reference / Notes',
              render: (m: StockMovement) => (
                <span className="text-xs text-gray-400">{m.notes || 'Manual Adjustment'}</span>
              ),
            },
          ]}
          data={movements}
          keyExtractor={(m) => m.id}
          loading={loading}
          emptyMessage="No stock movements recorded yet."
        />
      </Card>
    </div>
  );
}
