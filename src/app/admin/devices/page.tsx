'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, ShieldAlert, Lock, Unlock, RefreshCw, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Device } from '@/types/models';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(API_ENDPOINTS.DEVICES.LIST);
      const list = Array.isArray(res) ? res : res?.data || [];
      setDevices(list);
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleToggleLock = async (device: Device) => {
    const action = device.is_active ? 'lock' : 'unlock';
    if (!confirm(`Are you sure you want to ${action} this device?`)) return;

    try {
      if (device.is_active) {
        await apiClient.post(API_ENDPOINTS.DEVICES.LOCK(device.id));
      } else {
        await apiClient.post(API_ENDPOINTS.DEVICES.UNLOCK(device.id));
      }
      fetchDevices();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleRevoke = async (id: string | number) => {
    if (!confirm('Revoking will trigger an immediate offline kill switch. The device will be signed out and local database purged. Proceed?')) {
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.DEVICES.REVOKE(id));
      fetchDevices();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Revocation failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authorized Devices &amp; Terminals"
        subtitle="Manage POS hardware registrations, offline lease tokens, and emergency kill switches"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Devices' }]}
      />

      <Card>
        <DataTable
          columns={[
            {
              header: 'Device Terminal',
              render: (d: Device) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0b0f19] border border-[#26334d] flex items-center justify-center flex-shrink-0">
                    {d.platform?.toLowerCase().includes('android') ? (
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Monitor className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">{d.device_name || 'Unnamed Terminal'}</h5>
                    <span className="text-[11px] text-gray-400 font-mono">
                      ID: {d.device_identifier || String(d.id).substring(0, 12)}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Assigned User',
              render: (d: Device) => (
                <span className="text-white font-medium text-xs">
                  {d.user?.name || 'Unassigned'}
                </span>
              ),
            },
            {
              header: 'Platform',
              render: (d: Device) => (
                <Badge variant="info">{(d.platform || 'DESKTOP').toUpperCase()}</Badge>
              ),
            },
            {
              header: 'Offline Lease',
              render: (d: Device) => {
                const isLeaseActive = d.lease_expires_at && new Date(d.lease_expires_at) > new Date();
                return (
                  <Badge variant={isLeaseActive ? 'success' : 'secondary'}>
                    {isLeaseActive ? 'VALID LEASE' : 'NO LEASE'}
                  </Badge>
                );
              },
            },
            {
              header: 'Status',
              render: (d: Device) => (
                <Badge variant={d.is_active ? 'success' : 'danger'}>
                  {d.is_active ? 'ACTIVE' : 'LOCKED'}
                </Badge>
              ),
            },
            {
              header: 'Last Seen',
              render: (d: Device) => (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {d.last_seen_at ? formatDate(d.last_seen_at) : 'Never'}
                </span>
              ),
            },
            {
              header: 'Actions',
              render: (d: Device) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleLock(d)}
                    icon={d.is_active ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                  >
                    {d.is_active ? 'Lock' : 'Unlock'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevoke(d.id)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Kill Switch
                  </Button>
                </div>
              ),
            },
          ]}
          data={devices}
          keyExtractor={(d) => d.id}
          loading={loading}
          emptyMessage="No POS devices registered."
        />
      </Card>
    </div>
  );
}
