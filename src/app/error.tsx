'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#141c2e] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-400 mb-6">
          {error.message || 'An unexpected error occurred while rendering this view.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => reset()}
            variant="primary"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          <Link href="/admin">
            <Button
              variant="secondary"
              icon={<Home className="w-4 h-4" />}
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
