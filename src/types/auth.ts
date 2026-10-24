/**
 * Authentication, user profile, role limits, and cryptographic offline lease types.
 */

export interface RoleLimits {
  data_scope: "all" | "own";
  max_discount_percent: number | string;
  can_override_price: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  roles: string[];
  role?: string;
  permissions: string[];
  must_change_password: boolean;
  role_limits?: RoleLimits;
  two_factor_enabled?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  devices?: Array<{
    id: number;
    uuid: string;
    device_name: string;
    platform: string;
    status: string;
  }>;
}

export interface OfflineLease {
  lease_id?: string;
  user_id: number;
  device_uuid: string;
  role_slug: string;
  permissions: string[];
  role_limits: RoleLimits;
  data_scope: string;
  issued_at: string;
  expires_at: string;
  server_counter: number;
  signature?: string;
  public_key?: string;
}

export interface LoginResult {
  token: string;
  user: User;
  must_change_password: boolean;
  two_factor_required?: boolean;
  lease?: OfflineLease;
  settings?: Record<string, any>;
}
