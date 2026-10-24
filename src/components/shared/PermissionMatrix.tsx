import React from "react";
import { Checkbox } from "@/components/forms/Checkbox";

export interface PermissionGroup {
  name: string;
  label: string;
  permissions: Array<{
    slug: string;
    label: string;
    description?: string;
  }>;
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: "orders",
    label: "Orders & Sales",
    permissions: [
      { slug: "orders.view", label: "View Orders", description: "View order list and invoice details" },
      { slug: "orders.create", label: "Create Orders", description: "Create sales orders and checkout POS" },
      { slug: "orders.edit", label: "Edit Orders", description: "Update draft or pending order lines" },
      { slug: "orders.cancel", label: "Cancel Orders", description: "Cancel orders and reverse reservations" },
      { slug: "orders.review", label: "Review Orders", description: "Approve exception orders in review queue" },
      { slug: "orders.assign_customer", label: "Resolve Unassigned", description: "Link walk-in orders to customer profiles" },
    ],
  },
  {
    name: "products",
    label: "Product Catalog",
    permissions: [
      { slug: "products.view", label: "View Products", description: "Browse catalog and stock items" },
      { slug: "products.view_cost", label: "View Cost Prices", description: "Reveal cost and purchase prices" },
      { slug: "products.create", label: "Create Products", description: "Add new products and barcodes" },
      { slug: "products.edit", label: "Edit Products", description: "Update product pricing and descriptions" },
      { slug: "products.delete", label: "Delete Products", description: "Soft-delete product items" },
      { slug: "products.import", label: "Import Catalog", description: "Bulk Excel/CSV upload" },
    ],
  },
  {
    name: "inventory",
    label: "Inventory & Stock",
    permissions: [
      { slug: "inventory.view", label: "View Inventory", description: "View stock quantities and thresholds" },
      { slug: "inventory.adjust", label: "Adjust Stock", description: "Perform manual stock corrections" },
    ],
  },
  {
    name: "customers",
    label: "Customers & Ledger",
    permissions: [
      { slug: "customers.view", label: "View Customers", description: "Search customer directory" },
      { slug: "customers.view_credit", label: "View Credit Limits", description: "Inspect receivables and credit lines" },
      { slug: "customers.create", label: "Create Customers", description: "Register new customer profiles" },
      { slug: "customers.edit", label: "Edit Customers", description: "Update contact details and credit limits" },
      { slug: "customers.merge", label: "Merge Customers", description: "Deduplicate customer accounts" },
      { slug: "ledger.view", label: "View Ledger", description: "Inspect receivables ledger and statements" },
    ],
  },
  {
    name: "payments",
    label: "Payments & Financials",
    permissions: [
      { slug: "payments.view", label: "View Payments", description: "View transactions and receipts" },
      { slug: "payments.create", label: "Record Payments", description: "Receive cash, card, and bank payments" },
      { slug: "payments.void", label: "Void Payments", description: "Reversals with audit explanation" },
    ],
  },
  {
    name: "returns",
    label: "Sales Returns & RMA",
    permissions: [
      { slug: "returns.create", label: "Create Returns", description: "Issue return requests from orders" },
      { slug: "returns.approve", label: "Approve Returns", description: "Approve returns and restock items" },
    ],
  },
  {
    name: "devices",
    label: "Device Terminal Management",
    permissions: [
      { slug: "devices.view", label: "View Devices", description: "List hardware device sessions" },
      { slug: "devices.manage", label: "Manage Devices", description: "Lock, revoke, and un-enroll terminals" },
    ],
  },
  {
    name: "reports",
    label: "Reporting & Auditing",
    permissions: [
      { slug: "reports.view", label: "View Reports", description: "Access sales, closing, and inventory reports" },
      { slug: "reports.view_profit", label: "View Profit Analysis", description: "Inspect margins and net profit" },
      { slug: "day_closing.manage", label: "Close Day (Z-Report)", description: "Authorize daily business day closing" },
      { slug: "audit.view", label: "View Audit Trail", description: "Inspect immutable security audit logs" },
    ],
  },
  {
    name: "admin",
    label: "System Administration",
    permissions: [
      { slug: "users.view", label: "View Users", description: "List staff accounts" },
      { slug: "users.create", label: "Create Users", description: "Register staff and salespersons" },
      { slug: "users.edit", label: "Edit Users", description: "Modify roles and passwords" },
      { slug: "roles.view", label: "View Roles", description: "List roles and permissions" },
      { slug: "roles.create", label: "Create Roles", description: "Define custom permission sets" },
      { slug: "roles.edit", label: "Edit Roles", description: "Update role permissions" },
      { slug: "settings.view", label: "View Settings", description: "View system configurations" },
      { slug: "settings.manage", label: "Manage Settings", description: "Update system policies and timeouts" },
      { slug: "system.view_health", label: "View System Health", description: "Access live diagnostics and probes" },
    ],
  },
];

export interface PermissionMatrixProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  availablePermissions?: string[];
  disabled?: boolean;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  selectedPermissions,
  onChange,
  availablePermissions,
  disabled = false,
}) => {
  const togglePermission = (slug: string) => {
    if (disabled) return;
    if (selectedPermissions.includes(slug)) {
      onChange(selectedPermissions.filter((p) => p !== slug));
    } else {
      onChange([...selectedPermissions, slug]);
    }
  };

  const toggleGroup = (group: PermissionGroup) => {
    if (disabled) return;
    const groupSlugs = group.permissions.map((p) => p.slug);
    const allSelected = groupSlugs.every((s) => selectedPermissions.includes(s));

    if (allSelected) {
      // Unselect all in group
      onChange(selectedPermissions.filter((p) => !groupSlugs.includes(p)));
    } else {
      // Select all in group
      const newPerms = new Set([...selectedPermissions, ...groupSlugs]);
      onChange(Array.from(newPerms));
    }
  };

  return (
    <div className="space-y-6">
      {PERMISSION_GROUPS.map((group) => {
        const groupSlugs = group.permissions.map((p) => p.slug);
        const allSelected = groupSlugs.every((s) => selectedPermissions.includes(s));
        const someSelected = groupSlugs.some((s) => selectedPermissions.includes(s));

        return (
          <div
            key={group.name}
            className="bg-[#141c2e] border border-slate-800 rounded-xl overflow-hidden shadow-sm"
          >
            <div className="px-4 py-3 bg-[#111827] border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-white tracking-tight">{group.label}</span>
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                disabled={disabled}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.permissions.map((perm) => {
                const isChecked = selectedPermissions.includes(perm.slug);
                return (
                  <div
                    key={perm.slug}
                    onClick={() => togglePermission(perm.slug)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer select-none flex items-start gap-3 ${
                      isChecked
                        ? "bg-blue-950/40 border-blue-700/60 text-white"
                        : "bg-[#111827]/40 border-slate-800/80 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by container onClick
                      disabled={disabled}
                      className="w-4 h-4 rounded border-slate-700 bg-[#161f33] text-blue-600 focus:ring-blue-500 mt-0.5 pointer-events-none"
                    />
                    <div>
                      <div className="text-sm font-semibold leading-tight">{perm.label}</div>
                      {perm.description && (
                        <div className="text-xs text-slate-400 mt-1">{perm.description}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
