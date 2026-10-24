/**
 * Domain entity interfaces mirroring backend database models and response schemas.
 */

export interface Category {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  image?: string | null;
  status?: string;
}

export interface Brand {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  logo?: string | null;
  status?: string;
}

export interface ProductImage {
  id: number;
  image_path: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number | string;
  uuid?: string;
  sku: string;
  barcode?: string;
  name: string;
  slug?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  brand_id?: number | null;
  description?: string | null;
  sale_price?: string | number;
  price: number;
  cost_price?: string | null;
  cost?: number;
  stock_quantity?: string | number;
  stock: number;
  low_stock_threshold?: string | number;
  min_stock?: number;
  unit?: string;
  image?: string | null;
  thumbnail?: string | null;
  image_url?: string | null;
  status?: string;
  is_featured?: boolean;
  is_popular?: boolean;
  is_new?: boolean;
  is_offer?: boolean;
  sort_order?: number;
  category?: any;
  brand?: Brand | null;
  images?: ProductImage[];
}

export interface Customer {
  id: number | string;
  uuid?: string;
  client_uuid?: string | null;
  name: string;
  phone?: string | null;
  phone_normalized?: string | null;
  email?: string | null;
  business_name?: string | null;
  address?: string | null;
  city?: string | null;
  area?: string | null;
  credit_limit?: any;
  outstanding_balance?: string | null;
  balance?: any;
  available_store_credit?: string | null;
  default_discount_percent?: string | null;
  tax_rate_percent?: string | null;
  tax_number?: string | null;
  status?: string;
  notes?: string | null;
}

export interface OrderItem {
  id: number | string;
  product_id: number | string;
  product?: Product;
  product_name_snapshot?: string;
  sku_snapshot?: string;
  barcode_snapshot?: string | null;
  unit_snapshot?: string | null;
  quantity: number | any;
  unit_price: number | any;
  discount_amount?: number | any;
  line_total?: number | any;
}

export interface Order {
  id: number | string;
  uuid?: string;
  client_uuid?: string | null;
  order_number: string;
  invoice_number?: string | null;
  device_uuid?: string | null;
  customer_id?: number | string | null;
  customer?: Customer | null;
  customer_name_snapshot?: string | null;
  customer_phone_snapshot?: string | null;
  customer_assignment_status?: string | null;
  user_id?: number | string;
  subtotal?: any;
  discount?: any;
  discount_total?: any;
  customer_discount_amount?: string;
  manual_discount_amount?: string;
  tax_rate?: any;
  tax_amount?: any;
  total: any;
  paid_amount?: any;
  balance_due?: any;
  status: string;
  payment_status?: string;
  payment_method?: string;
  source?: string;
  created_at?: string;
  cancellation_status?: string;
  return_status?: string;
  stock_review_status?: string;
  discount_review_status?: string;
  price_review_status?: string;
  credit_review_status?: string;
  walkin_review_status?: string;
  version?: number;
  notes?: string | null;
  bilty_slip_path?: string | null;
  bilty_number?: string | null;
  transporter_name?: string | null;
  server_created_at?: string;
  items: OrderItem[];
}

export interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  display_order: number;
}

export interface Payment {
  id: number;
  uuid: string;
  client_uuid?: string | null;
  order_id?: number | null;
  order_client_uuid?: string | null;
  customer_id?: number | null;
  user_id: number;
  device_uuid?: string | null;
  payment_method_id?: number | null;
  type: string;
  amount: string;
  reference?: string | null;
  notes?: string | null;
  status: string;
  receipt_number?: string | null;
  received_at?: string | null;
  server_created_at?: string | null;
  voided_at?: string | null;
  void_reason?: string | null;
}

export interface CustomerLedgerEntry {
  id: number;
  uuid: string;
  type: string;
  debit: string;
  credit: string;
  balance_after: string;
  notes?: string | null;
  reference_type?: string | null;
  reference_id?: number | null;
  created_at?: string | null;
}

export interface AgingBucket {
  current_0_30: string;
  overdue_31_60: string;
  overdue_61_90: string;
  overdue_90_plus: string;
  total_outstanding: string;
}

export interface CustomerLedgerResponse {
  customer: {
    id: number;
    name: string;
    credit_limit?: string | null;
    outstanding_balance?: string | null;
    available_store_credit?: string | null;
  };
  aging_summary?: AgingBucket;
  aging?: AgingBucket;
  entries: CustomerLedgerEntry[];
}

export interface OrderReturnItem {
  id: number;
  order_item_id: number;
  product_id: number;
  quantity: string;
  unit_price: string;
  line_total: string;
  restock: boolean;
  condition?: string;
}

export interface OrderReturn {
  id: number | string;
  uuid?: string;
  client_uuid?: string | null;
  return_number?: string;
  order_id: number | string;
  customer_id?: number | null;
  user_id?: number;
  status?: string;
  reason?: string;
  reason_code?: string | null;
  notes?: string | null;
  refund_method?: string | null;
  refund_amount?: number;
  total?: string | number;
  approved_by?: number | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  order?: {
    id?: number | string;
    order_number?: string;
    customer?: { id?: number | string; name?: string };
  };
  items?: Array<{
    id: string | number;
    product_id: string | number;
    product?: { id?: string | number; name?: string };
    quantity: number;
    unit_price: number;
  }>;
  created_at?: string;
}

export type Return = OrderReturn;

export interface Device {
  id: number | string;
  uuid?: string;
  device_name?: string;
  device_identifier?: string;
  platform?: string;
  app_version?: string;
  status?: string;
  is_active?: boolean;
  lease_expires_at?: string | null;
  last_seen_at?: string | null;
  last_synced_at?: string | null;
  user_id?: number;
  user?: { id?: number | string; name?: string; email?: string };
}

export interface SyncConflict {
  id: number | string;
  uuid?: string;
  order_id?: number | string;
  order_client_uuid?: string;
  order?: {
    id?: number | string;
    order_number?: string;
  };
  product_id: number | string;
  conflict_type?: string;
  requested_quantity: number | string;
  available_quantity?: number | string;
  available_stock?: number | string;
  status?: "pending" | "approved" | "adjusted" | "rejected";
  resolution_notes?: string;
  resolved_at?: string;
  created_at?: string;
  product?: {
    id?: number | string;
    name?: string;
    sku?: string;
  };
}

export type Conflict = SyncConflict;

export interface AuditLog {
  id: number | string;
  action: string;
  entity_type?: string;
  entity_id?: string | null;
  auditable_type?: string | null;
  auditable_id?: string | null;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  user_id?: number | string | null;
  user_name?: string | null;
  user?: { id?: number | string; name?: string; email?: string } | null;
  device_uuid?: string | null;
  created_at: string;
}

export interface SystemHealth {
  status: "ok" | "degraded" | "unhealthy";
  timestamp?: number;
  uptime_seconds?: number;
  database?: {
    status?: string;
    latency_ms?: number;
  };
  storage?: {
    status?: string;
  };
  disk?: {
    used_percent?: number;
    free_gb?: number;
  };
  version?: string;
}

export interface ImportJobStatus {
  id: number | string;
  uuid?: string;
  filename?: string;
  created_at?: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  total_rows?: number;
  processed_rows: number;
  inserted_count?: number;
  updated_count?: number;
  unchanged_count?: number;
  error_count?: number;
  warning_count?: number;
  progress_percentage?: number;
  is_finished?: boolean;
}
