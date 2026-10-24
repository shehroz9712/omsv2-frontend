/**
 * Centralized API envelope, error, and pagination interfaces.
 * Adheres strictly to the FastAPI Laravel-style JSON response contract.
 */

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  status: boolean;
  response?: {
    data: T;
  };
  errors?: ValidationErrorItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}
