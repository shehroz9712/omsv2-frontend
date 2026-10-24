'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';

export default function ConfirmAuthPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await apiClient.post(API_ENDPOINTS.AUTH.CONFIRM_AUTH, { password });
      // Redirect back to intended page or dashboard
      router.back();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Password confirmation failed. Please check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Confirm Authentication"
      subtitle="Re-authenticate to execute this high-privilege administrative action"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 mb-2">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <p className="text-xs text-gray-400">
          For security, please enter your password to proceed.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Account Password" htmlFor="password" required>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              className="pl-10"
            />
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </FormField>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={submitting}
          >
            Confirm &amp; Proceed
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel and return to Dashboard
        </Link>
      </div>
    </AuthLayout>
  );
}
