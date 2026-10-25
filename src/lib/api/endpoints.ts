/**
 * Centralized registry of all FastAPI backend API endpoints.
 * Provides both modular namespaces and direct flat shortcuts.
 */

export const API_ENDPOINTS = {
  // Authentication & Session
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    CONFIRM_AUTH: "/auth/confirm-password",
    TWO_FACTOR_VERIFY: "/auth/2fa/verify",
    TWO_FACTOR_CHALLENGE: "/auth/2fa/challenge",
    CHANGE_PASSWORD: "/auth/change-password",
    REVOKE_ALL_TOKENS: "/auth/revoke-all-tokens",
    REFRESH_LEASE: "/auth/lease/refresh",
  },

  // Admin Operational Dashboard
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
  },

  // Web POS Terminal
  POS: {
    PRODUCTS: "/pos/products",
    ORDERS: "/pos/orders",
    INVOICE: (id: string | number) => `/pos/orders/${id}/invoice`,
  },

  // Products Catalog
  PRODUCTS: {
    LIST: "/products",
    CREATE: "/products",
    SHOW: (id: string | number) => `/products/${id}`,
    UPDATE: (id: string | number) => `/products/${id}`,
    DELETE: (id: string | number) => `/products/${id}`,
    TRASH: "/products/trash",
    RESTORE: (id: string | number) => `/products/${id}/restore`,
    FORCE_DELETE: (id: string | number) => `/products/${id}/force-delete`,
    SCAN: "/products/scan",
  },

  // Inventory & Double-Entry Ledger
  INVENTORY: {
    LIST: "/inventory",
    MOVEMENTS: "/inventory/movements",
    ADJUST: "/inventory/adjust",
  },

  // Customers & Financial Balances
  CUSTOMERS: {
    LIST: "/customers",
    CREATE: "/customers",
    SHOW: (id: string | number) => `/customers/${id}`,
    UPDATE: (id: string | number) => `/customers/${id}`,
    DELETE: (id: string | number) => `/customers/${id}`,
    LEDGER: (id: string | number) => `/customers/${id}/ledger`,
    MERGE: "/customers/merge",
  },

  // Sales Orders & Fulfillment
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders",
    SHOW: (id: string | number) => `/orders/${id}`,
    UPDATE: (id: string | number) => `/orders/${id}`,
    DELETE: (id: string | number) => `/orders/${id}`,
    REVIEW_QUEUE: "/orders/review",
    APPROVE: (id: string | number) => `/orders/${id}/approve`,
    REJECT: (id: string | number) => `/orders/${id}/reject`,
    UNASSIGNED: "/orders/unassigned",
    PROCESS_RETURN: (id: string | number) => `/orders/${id}/return`,
  },

  // Merchandise Returns (RMA)
  RETURNS: {
    LIST: "/returns",
    SHOW: (id: string | number) => `/returns/${id}`,
    CREATE: "/returns",
  },

  // Authorized POS Hardware & Devices
  DEVICES: {
    LIST: "/devices",
    LOCK: (id: string | number) => `/devices/${id}/lock`,
    UNLOCK: (id: string | number) => `/devices/${id}/unlock`,
    REVOKE: (id: string | number) => `/devices/${id}/revoke`,
  },

  // Offline Sync & Overdraft Conflicts
  CONFLICTS: {
    LIST: "/sync/conflicts",
    RESOLVE: (id: string | number) => `/sync/conflicts/${id}/resolve`,
  },

  // Catalog Importer
  IMPORT: {
    LIST: "/imports",
    UPLOAD: "/products/import",
    STATUS: (id: string | number) => `/imports/${id}`,
    TEMPLATE: (format: string) => `/imports/template?format=${format}`,
    ERRORS_CSV: (id: string | number) => `/imports/${id}/errors-csv`,
    CANCEL: (id: string | number) => `/imports/${id}/cancel`,
  },

  // Security Audit Trail
  AUDIT: {
    LIST: "/security/events",
  },

  // Global Settings & Invoice Customizer
  SETTINGS: {
    GET: "/settings",
    UPDATE: "/settings",
    INVOICE: "/settings/invoice",
  },

  // Staff Users
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    SHOW: (id: string | number) => `/users/${id}`,
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
  },

  // Roles & Permissions
  ROLES: {
    LIST: "/roles",
    CREATE: "/roles",
    SHOW: (id: string | number) => `/roles/${id}`,
    UPDATE: (id: string | number) => `/roles/${id}`,
    DELETE: (id: string | number) => `/roles/${id}`,
  },

  // Financial & Operational Reports
  REPORTS: {
    DAILY_CLOSING: "/reports/daily-closing",
    DAILY_CLOSING_PDF: "/reports/daily-closing/pdf",
    SALES: "/reports/sales",
    PROFIT: "/reports/profit",
    INVENTORY: "/reports/inventory",
    RECEIVABLES: "/reports/receivables",
    OPERATIONS: "/reports/operations",
  },

  // Health Probe
  HEALTH: {
    CHECK: "/health",
  },

  // Flat shortcuts for backward compatibility
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
};
