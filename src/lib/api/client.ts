import { ApiResponse } from "@/types/api";
import { ApiError } from "./errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("oms_token") || sessionStorage.getItem("oms_token");
  }

  private getDeviceUuid(): string {
    if (typeof window === "undefined") return "web-terminal-001";
    let uuid = localStorage.getItem("oms_device_uuid");
    if (!uuid) {
      uuid = "web-term-" + Math.random().toString(36).substring(2, 10);
      localStorage.setItem("oms_device_uuid", uuid);
    }
    return uuid;
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          url.searchParams.append(key, String(val));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers: customHeaders, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);

    const headers = new Headers(customHeaders);
    if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("X-Device-UUID", this.getDeviceUuid());
    headers.set("X-App-Version", "1.0.0");
    headers.set("Accept", "application/json");

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } catch (networkError: any) {
      throw new ApiError(
        networkError.message || "Network request failed. Please check your backend connection.",
        0
      );
    }

    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch {
      throw new ApiError(
        `Invalid server response (${response.status} ${response.statusText})`,
        response.status
      );
    }

    // Standard Laravel-style envelope verification
    if (!response.ok || json.status === false) {
      const msg = json.message || "An unexpected error occurred.";
      const code = json.statusCode || response.status;
      const errors = json.errors || [];

      // Intercept session expiration
      if (code === 401 && typeof window !== "undefined") {
        if (!window.location.pathname.includes("/login")) {
          localStorage.removeItem("oms_token");
          sessionStorage.removeItem("oms_token");
          window.location.href = "/login?expired=1";
        }
      }

      throw new ApiError(msg, code, errors);
    }

    // Unpack data from response envelope
    if (json.response && json.response.data !== undefined) {
      return json.response.data;
    }

    // If response.data was omitted (e.g. empty success action), return response envelope or fallback
    return (json as unknown) as T;
  }

  public get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  public put<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  public upload<T>(path: string, formData: FormData, options?: RequestOptions): Promise<T> {
    return this.post<T>(path, formData, options);
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(BASE_URL);
