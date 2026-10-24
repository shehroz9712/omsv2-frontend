'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Calendar, User } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { AuditLog } from '@/types/models';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = `?limit=100`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res: any = await apiClient.get(`${API_ENDPOINTS.AUDIT.LIST}${query}`);
      const list = Array.isArray(res) ? res : res?.data || [];
      setLogs(list);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Audit &amp; Event Logs"
        subtitle="Forensic audit trail of all staff logins, security overrides, and ledger adjustments"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Audit Logs' }]}
      />

      <Card>
        <div className="p-4 border-b border-[#26334d]">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={fetchLogs}
            placeholder="Search by action, user, or IP address..."
          />
        </div>

        <DataTable
          columns={[
            {
              header: 'Timestamp',
              render: (log: AuditLog) => (
                <span className="font-mono text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(log.created_at)}
                </span>
              ),
            },
            {
              header: 'User',
              render: (log: AuditLog) => (
                <span className="font-semibold text-white text-xs">
                  {log.user?.name || log.user_id || 'System Worker'}
                </span>
              ),
            },
            {
              header: 'Action / Event',
              render: (log: AuditLog) => (
                <Badge variant="info">{log.action.replace(/_/g, ' ').toUpperCase()}</Badge>
              ),
            },
            {
              header: 'Entity',
              render: (log: AuditLog) => (
                <span className="font-mono text-xs text-gray-300">
                  {log.auditable_type || 'General'} #{log.auditable_id || '—'}
                </span>
              ),
            },
            {
              header: 'IP Address',
              render: (log: AuditLog) => (
                <span className="font-mono text-xs text-gray-400">{log.ip_address || '127.0.0.1'}</span>
              ),
            },
          ]}
          data={logs}
          keyExtractor={(log) => log.id}
          loading={loading}
          emptyMessage="No audit log events recorded."
        />
      </Card>
    </div>
  );
}
