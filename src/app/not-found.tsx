import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#141c2e] border border-[#26334d] rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">404 Error</span>
        <h2 className="text-2xl font-bold text-white mt-1 mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-400 mb-6">
          The view or resource you requested cannot be found or may have been relocated.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/admin">
            <Button
              variant="primary"
              icon={<Home className="w-4 h-4" />}
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
