import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../src/lib/api/client';
import { ApiError } from '../src/lib/api/errors';
import { formatCurrency, formatQuantity, formatDate } from '../src/lib/utils';

describe('Format Utilities', () => {
  it('formats PKR currency correctly', () => {
    expect(formatCurrency(1500)).toBe('₨ 1,500.00');
    expect(formatCurrency(0)).toBe('₨ 0.00');
  });

  it('formats quantities with commas', () => {
    expect(formatQuantity(12500)).toBe('12,500');
    expect(formatQuantity(0)).toBe('0');
  });

  it('formats dates properly', () => {
    const formatted = formatDate('2026-03-15T12:00:00Z');
    expect(formatted).toContain('2026');
  });
});

describe('ApiClient Envelope Handling', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient('http://test-api:8000/api/v1');
    vi.restoreAllMocks();
  });

  it('unwraps Laravel/FastAPI envelope on 200 success', async () => {
    const mockEnvelope = {
      statusCode: 200,
      status: true,
      message: 'Success',
      response: {
        data: {
          items: [{ id: 'prod_1', name: 'Test Product' }],
        },
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockEnvelope,
    });

    const result: any = await client.get('/products');
    expect(result.items).toBeDefined();
    expect(result.items[0].name).toBe('Test Product');
  });

  it('throws ApiError with statusCode and message on error envelope', async () => {
    const errorEnvelope = {
      statusCode: 422,
      status: false,
      message: 'Validation failed',
      errors: [
        { field: 'sku', message: 'SKU already exists' },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => errorEnvelope,
    });

    await expect(client.post('/products', {})).rejects.toThrow('Validation failed');
  });
});
