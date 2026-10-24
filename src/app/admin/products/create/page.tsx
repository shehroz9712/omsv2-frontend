'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';

export default function CreateProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '10',
    unit: 'pcs',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim() || null,
        barcode: formData.barcode.trim() || null,
        category: formData.category.trim() || 'General',
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        min_stock: parseInt(formData.min_stock, 10) || 10,
        unit: formData.unit.trim() || 'pcs',
        description: formData.description.trim() || null,
      };

      await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, payload);
      router.push('/admin/products');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Product"
        subtitle="Create an inventory SKU with price rules and reorder thresholds"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'New Product' },
        ]}
      />

      <Card>
        {errorMessage && (
          <div className="m-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Product Name" htmlFor="name" required>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Basmati Rice 5kg"
              />
            </FormField>

            <FormField label="Category" htmlFor="category">
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Grains, Beverages, Dairy"
              />
            </FormField>

            <FormField label="SKU (Stock Keeping Unit)" htmlFor="sku">
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. RICE-BAS-005"
              />
            </FormField>

            <FormField label="Barcode" htmlFor="barcode">
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g. 896400012345"
              />
            </FormField>

            <FormField label="Selling Price (PKR)" htmlFor="price" required>
              <Input
                id="price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Cost Price (PKR)" htmlFor="cost">
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Initial Stock" htmlFor="stock" required>
              <Input
                id="stock"
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </FormField>

            <FormField label="Minimum Low-Stock Alert Threshold" htmlFor="min_stock">
              <Input
                id="min_stock"
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                placeholder="10"
              />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="description">
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product details, packaging size, supplier notes..."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#26334d]">
            <Link href="/admin/products">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<Save className="w-4 h-4" />}
            >
              Save Product
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
