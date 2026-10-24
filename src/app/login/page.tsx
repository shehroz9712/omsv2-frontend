'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Checkbox } from '@/components/forms/Checkbox';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [deviceName] = useState('Web Admin Browser');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect to admin
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const result = await login({
        username: username.trim(),
        password,
        device_name: deviceName,
        remember,
      });

      if (result.two_factor_required) {
        router.push('/admin/2fa/challenge');
      } else {
        router.push('/admin');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please verify credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Enter your credentials to access the administrative portal"
    >
      {errorMessage && (
        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Username or Email"
          htmlFor="login"
          required
        >
          <div className="relative">
            <Input
              id="login"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin or username"
              autoComplete="username"
              className="pl-10"
            />
            <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          required
        >
          <div className="relative">
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-10"
            />
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </FormField>

        <div className="flex items-center justify-between pt-1">
          <Checkbox
            id="remember"
            name="remember"
            label="Remember this device"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={submitting}
            icon={<LogIn className="w-5 h-5" />}
          >
            Sign In to Admin
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-[#26334d] text-center text-xs text-gray-500">
        Designed &amp; developed by{' '}
        <a
          href="https://buildbyshehroz.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 font-semibold focus:outline-none focus:underline"
        >
          Muhammad Shehroz
        </a>
      </div>
    </AuthLayout>
  );
}
